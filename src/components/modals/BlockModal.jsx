import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import { useCreateBlock, useUpdateBlock } from '../../hooks/useBlocks'
import { useToast } from '../../context/ToastContext'
import { supabase } from '../../lib/supabase'
import RichEditor from '../ui/RichEditor'

const TYPES = [
  { value: 'default',    label: '일반' },
  { value: 'tip',        label: '팁' },
  { value: 'warning',    label: '주의' },
  { value: 'info',       label: '안내' },
  { value: 'process',    label: '프로세스' },
  { value: 'links',      label: '링크+비고' },
  { value: 'links-file', label: '링크+파일' },
  { value: 'kakao',      label: '카톡 템플릿' },
  { value: 'code',       label: '코드' },
  { value: 'file',       label: '파일 첨부' },
]
const SPECIAL = ['links', 'links-file', 'kakao', 'code', 'file', 'process']
const LINKS_TYPES = ['links', 'links-file']
const ITEM_ICONS = { tip: '💡', warning: '⚠️', info: 'ℹ️', default: '•', code: '<>', file: '📎' }

export default function BlockModal({ open, onClose, stepId, editing }) {
  const [type, setType] = useState('default')
  const [label, setLabel] = useState('')
  const [content, setContent] = useState('')
  const [linkItems, setLinkItems] = useState([{ name: '', type: '', url: '', note: '', file: '', _file: null, code: '' }])
  const [processItems, setProcessItems] = useState([{ title: '', desc: '' }])
  const [kakaoItems, setKakaoItems] = useState([{ title: '', body: '' }])
  const [codeContent, setCodeContent] = useState('')
  const [fileContent, setFileContent] = useState('')   // stored as "name|url|size\n..."
  const [pendingFiles, setPendingFiles] = useState([]) // File objects not yet uploaded
  const [uploading, setUploading] = useState(false)
  const [items, setItems] = useState([])

  const toast = useToast()
  const create = useCreateBlock()
  const update = useUpdateBlock()
  const isPending = create.isPending || update.isPending

  useEffect(() => {
    if (open) {
      setType(editing?.type ?? 'default')
      setLabel(editing?.label ?? '')
      setContent('')
      setKakaoItems([{ title: '', body: '' }])
      setCodeContent('')
      setFileContent('')
      setPendingFiles([])
      if (editing?.type === 'process') {
        const rows = (editing?.content ?? '').split('\n').filter(Boolean)
        setProcessItems(rows.length > 0
          ? rows.map(r => {
              const [title = '', desc = ''] = r.split('|').map(s => s?.trim() ?? '')
              return { title, desc: desc.replace(/\\n/g, '\n') }
            })
          : [{ title: '', desc: '' }]
        )
      } else if (editing?.type === 'links' || editing?.type === 'links-file') {
        const rows = (editing?.content ?? '').split('\n').filter(Boolean)
        const isFile = editing?.type === 'links-file'
        setLinkItems(rows.length > 0
          ? rows.map(r => {
              const [name = '', type = '', url = '', extra = '', code = ''] = r.split('|').map(s => s?.trim() ?? '')
              return isFile
                ? { name, type, url, note: '', file: extra, _file: null, code: code.replace(/\\n/g, '\n') }
                : { name, type, url, note: extra, file: '', _file: null, code: code.replace(/\\n/g, '\n') }
            })
          : [{ name: '', type: '', url: '', note: '', file: '', _file: null, code: '' }]
        )
      } else if (editing?.type === 'kakao') {
        const msgs = (editing?.content ?? '').split(/\n---\n/).map(s => s.trim()).filter(Boolean)
        setKakaoItems(msgs.length > 0
          ? msgs.map(m => {
              const lines = m.split('\n')
              if (lines[0]?.startsWith('# ')) {
                return { title: lines[0].slice(2).trim(), body: lines.slice(1).join('\n').trim() }
              }
              return { title: '', body: m }
            })
          : [{ title: '', body: '' }]
        )
      } else if (editing?.type === 'code') {
        setCodeContent(editing?.content ?? '')
      } else if (editing?.type === 'file') {
        setFileContent(editing?.content ?? '')
      } else {
        setContent(editing?.content ?? '')
      }
      setItems((editing?.block_items ?? []).map(it => ({ _id: crypto.randomUUID(), type: it.type, text: it.text })))
    }
  }, [open, editing])

  function addItem(itemType) {
    const newItem = { _id: crypto.randomUUID(), type: itemType, text: '' }
    setItems(prev => itemType === 'file' ? [newItem, ...prev] : [...prev, newItem])
  }
  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }
  function updateItem(idx, text) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, text } : it))
  }
  function updateItemFile(idx, file) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, _file: file, text: it.text } : it))
  }
  function moveItem(idx, dir) {
    setItems(prev => {
      const next = [...prev]
      const swap = idx + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  async function handleSave() {
    let actualContent
    if (type === 'process') {
      actualContent = processItems
        .filter(it => it.title.trim())
        .map(it => `${it.title}|${it.desc.replace(/\n/g, '\\n')}`)
        .join('\n')
    } else if (type === 'links') {
      actualContent = linkItems
        .filter(it => it.name.trim() || it.url.trim())
        .map(it => `${it.name}|${it.type}|${it.url}|${it.note ?? ''}|${it.code.replace(/\n/g, '\\n')}`)
        .join('\n')
    } else if (type === 'links-file') {
      const hasPendingLinkFiles = linkItems.some(it => it._file)
      let resolvedLinkItems = linkItems
      if (hasPendingLinkFiles) {
        setUploading(true)
        try {
          resolvedLinkItems = await Promise.all(linkItems.map(async it => {
            if (!it._file) return it
            const ext = it._file.name.split('.').pop()
            const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const { error } = await supabase.storage.from('uploads').upload(path, it._file)
            if (error) throw error
            const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
            return { ...it, file: `${it._file.name}::${urlData.publicUrl}`, _file: null }
          }))
        } catch (err) {
          toast('파일 업로드 실패: ' + err.message)
          setUploading(false)
          return
        }
        setUploading(false)
      }
      actualContent = resolvedLinkItems
        .filter(it => it.name.trim() || it.url.trim())
        .map(it => `${it.name}|${it.type}|${it.url}|${it.file}|${it.code.replace(/\n/g, '\\n')}`)
        .join('\n')
    }
    else if (type === 'kakao') {
      actualContent = kakaoItems
        .filter(it => it.body.trim())
        .map(it => it.title.trim() ? `# ${it.title}\n${it.body}` : it.body)
        .join('\n---\n')
    }
    else if (type === 'code') actualContent = codeContent
    else if (type === 'file') {
      const existingLines = fileContent ? fileContent.split('\n').filter(Boolean) : []
      const newLines = []
      if (pendingFiles.length > 0) {
        setUploading(true)
        try {
          for (const f of pendingFiles) {
            const ext = f.name.split('.').pop()
            const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const { error } = await supabase.storage.from('uploads').upload(path, f)
            if (error) throw error
            const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
            newLines.push(`${f.name}|${urlData.publicUrl}|${f.size}`)
          }
        } catch (err) {
          toast('파일 업로드 실패: ' + err.message)
          setUploading(false)
          return
        }
        setUploading(false)
      }
      // 새 파일을 항상 맨 위로
      actualContent = [...newLines, ...existingLines].join('\n')
    } else {
      actualContent = content
    }

    // Upload any file-type inline items
    let resolvedItems = items
    const hasFileItems = items.some(it => it.type === 'file' && (it._file || it.text))
    if (hasFileItems) {
      setUploading(true)
      try {
        resolvedItems = await Promise.all(items.map(async it => {
          if (it.type === 'file' && it._file) {
            const ext = it._file.name.split('.').pop()
            const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const { error } = await supabase.storage.from('uploads').upload(path, it._file)
            if (error) throw error
            const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path)
            return { type: 'file', text: `${it._file.name}|${urlData.publicUrl}|${it._file.size}` }
          }
          return { type: it.type, text: it.text }
        }))
      } catch (err) {
        toast('파일 업로드 실패: ' + err.message)
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const validItems = resolvedItems
      .filter(it => it.text?.trim())
    if (!actualContent?.trim() && validItems.length === 0) {
      toast('내용이나 항목을 입력해주세요.')
      return
    }
    const payload = {
      step_id: stepId,
      type,
      label: label.trim(),
      content: actualContent?.trim() ?? '',
      items: validItems,
    }
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    toast('저장되었습니다.')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? '내용 블록 수정' : '내용 블록 추가'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending || uploading}>
            {uploading ? '업로드 중…' : isPending ? '저장 중…' : '저장'}
          </button>
        </>
      }
    >
      {/* 블록 유형 */}
      <div className="form-group">
        <label className="form-label">블록 유형</label>
        <div className="type-pills">
          {TYPES.map(t => (
            <button
              key={t.value}
              className={`type-pill${type === t.value ? ' selected' : ''}`}
              onClick={() => setType(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 레이블 */}
      <div className="form-group">
        <label className="form-label">레이블 (선택)</label>
        <input className="form-input" value={label} onChange={e => setLabel(e.target.value)}
          placeholder="예: 참고사항, 진행 절차 …" />
      </div>

      {/* 일반 내용 */}
      {!SPECIAL.includes(type) && (
        <div className="form-group">
          <label className="form-label">내용</label>
          <RichEditor value={content} onChange={setContent} placeholder="내용을 입력하세요." />
        </div>
      )}

      {/* 프로세스 */}
      {type === 'process' && (
        <div className="form-group">
          <label className="form-label">프로세스 단계</label>
          <div className="process-items-list">
            {processItems.map((item, i) => (
              <div key={i} className="process-item-block">
                <div className="process-item-left">
                  <div className="process-item-num">{i + 1}</div>
                  <div className="process-item-order-btns">
                    <button
                      className="process-order-btn"
                      disabled={i === 0}
                      onClick={() => setProcessItems(prev => {
                        const next = [...prev]
                        ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                        return next
                      })}
                    >▲</button>
                    <button
                      className="process-order-btn"
                      disabled={i === processItems.length - 1}
                      onClick={() => setProcessItems(prev => {
                        const next = [...prev]
                        ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
                        return next
                      })}
                    >▼</button>
                  </div>
                </div>
                <div className="process-item-fields">
                  <input
                    className="form-input"
                    value={item.title}
                    onChange={e => setProcessItems(prev => prev.map((it, j) => j === i ? { ...it, title: e.target.value } : it))}
                    placeholder="단계 제목"
                  />
                  <textarea
                    className="form-input process-item-desc"
                    value={item.desc}
                    onChange={e => setProcessItems(prev => prev.map((it, j) => j === i ? { ...it, desc: e.target.value } : it))}
                    placeholder="설명 (선택)"
                  />
                </div>
                <button className="modal-item-remove" onClick={() => setProcessItems(prev => prev.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
          </div>
          <button
            className="link-item-add-btn"
            style={{ marginTop: 8 }}
            onClick={() => setProcessItems(prev => [...prev, { title: '', desc: '' }])}
          >
            + 단계 추가
          </button>
        </div>
      )}

      {/* 링크 목록 (비고 / 파일 공용) */}
      {LINKS_TYPES.includes(type) && (
        <div className="form-group">
          <label className="form-label">링크 목록</label>
          <div className="link-items-list">
            {linkItems.map((item, i) => (
              <div key={i} className="link-item-block">
                <div className="link-item-row">
                  <div className="modal-item-order-btns">
                    <button className="process-order-btn" disabled={i === 0}
                      onClick={() => setLinkItems(prev => { const n = [...prev]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n })}>▲</button>
                    <button className="process-order-btn" disabled={i === linkItems.length - 1}
                      onClick={() => setLinkItems(prev => { const n = [...prev]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n })}>▼</button>
                  </div>
                  <input
                    className="form-input link-item-name"
                    value={item.name}
                    onChange={e => setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, name: e.target.value } : it))}
                    placeholder="가이드명"
                  />
                  <input
                    className="form-input link-item-type"
                    value={item.type}
                    onChange={e => setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, type: e.target.value } : it))}
                    placeholder="유형"
                  />
                  <input
                    className="form-input link-item-url"
                    value={item.url}
                    onChange={e => setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, url: e.target.value } : it))}
                    placeholder="https://..."
                  />
                  <button className="modal-item-remove" onClick={() => setLinkItems(prev => prev.filter((_, j) => j !== i))}>×</button>
                </div>

                {/* 비고 (links 타입) */}
                {type === 'links' && (
                  <input
                    className="form-input"
                    value={item.note}
                    onChange={e => setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, note: e.target.value } : it))}
                    placeholder="비고 (선택)"
                  />
                )}

                {/* 파일 (links-file 타입) */}
                {type === 'links-file' && (
                  <div className="link-item-file-row">
                    {(item._file || item.file) ? (
                      <>
                        <span className="link-item-file-name">
                          📎 {item._file ? item._file.name : item.file.split('::')[0]}
                        </span>
                        <label className="link-item-file-change-btn">
                          변경
                          <input type="file" style={{ display: 'none' }}
                            onChange={e => { if (e.target.files[0]) setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, _file: e.target.files[0], file: '' } : it)) }}
                          />
                        </label>
                        <button className="link-item-file-remove-btn" onClick={() => setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, _file: null, file: '' } : it))}>×</button>
                      </>
                    ) : (
                      <label className="link-item-file-upload-btn">
                        📎 파일 첨부 (선택)
                        <input type="file" style={{ display: 'none' }}
                          onChange={e => { if (e.target.files[0]) setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, _file: e.target.files[0] } : it)) }}
                        />
                      </label>
                    )}
                  </div>
                )}

                <textarea
                  className="form-textarea code-textarea link-item-code"
                  value={item.code}
                  onChange={e => setLinkItems(prev => prev.map((it, j) => j === i ? { ...it, code: e.target.value } : it))}
                  placeholder="코드 (선택)"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>
          <button
            className="link-item-add-btn"
            onClick={() => setLinkItems(prev => [...prev, { name: '', type: '', url: '', note: '', file: '', _file: null, code: '' }])}
          >
            + 항목 추가
          </button>
        </div>
      )}

      {/* 카카오 템플릿 */}
      {type === 'kakao' && (
        <div className="form-group">
          <label className="form-label">카카오 메시지</label>
          <div className="kakao-items-list">
            {kakaoItems.map((item, i) => (
              <div key={i} className="kakao-item-block">
                <div className="kakao-item-header">
                  <span className="kakao-item-num">메시지 {i + 1}</span>
                  <button className="modal-item-remove" onClick={() => setKakaoItems(prev => prev.filter((_, j) => j !== i))}>×</button>
                </div>
                <input
                  className="form-input"
                  value={item.title}
                  onChange={e => setKakaoItems(prev => prev.map((it, j) => j === i ? { ...it, title: e.target.value } : it))}
                  placeholder="제목 (선택)"
                />
                <textarea
                  className="form-textarea"
                  value={item.body}
                  onChange={e => setKakaoItems(prev => prev.map((it, j) => j === i ? { ...it, body: e.target.value } : it))}
                  placeholder="메시지 내용"
                  style={{ minHeight: 100 }}
                />
              </div>
            ))}
          </div>
          <button
            className="link-item-add-btn"
            style={{ marginTop: 8 }}
            onClick={() => setKakaoItems(prev => [...prev, { title: '', body: '' }])}
          >
            + 메시지 추가
          </button>
        </div>
      )}

      {/* 코드 블록 */}
      {type === 'code' && (
        <div className="form-group">
          <label className="form-label">코드</label>
          <textarea
            className="form-textarea code-textarea"
            value={codeContent}
            onChange={e => setCodeContent(e.target.value)}
            placeholder="코드를 입력하세요"
            spellCheck={false}
          />
        </div>
      )}

      {/* 파일 첨부 */}
      {type === 'file' && (
        <div className="form-group">
          <label className="form-label">파일 첨부</label>
          <div
            className="file-dropzone"
            onClick={() => document.getElementById('file-upload-input').click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              const files = Array.from(e.dataTransfer.files)
              setPendingFiles(prev => [...prev, ...files])
            }}
          >
            <span>📎 클릭하거나 파일을 여기에 드래그하세요</span>
            <input
              id="file-upload-input"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={e => {
                const files = Array.from(e.target.files)
                setPendingFiles(prev => [...prev, ...files])
                e.target.value = ''
              }}
            />
          </div>
          {/* 기존 업로드 파일 */}
          {fileContent && fileContent.split('\n').filter(Boolean).map((row, i) => {
            const [name] = row.split('|')
            return (
              <div key={i} className="file-pending-item">
                <span>📎 {name}</span>
                <button className="modal-item-remove" onClick={() => {
                  const lines = fileContent.split('\n').filter(Boolean)
                  lines.splice(i, 1)
                  setFileContent(lines.join('\n'))
                }}>×</button>
              </div>
            )
          })}
          {/* 새로 추가된 파일 */}
          {pendingFiles.map((f, i) => (
            <div key={i} className="file-pending-item new">
              <span>📎 {f.name} <span className="file-size-hint">({formatFileSize(f.size)})</span></span>
              <button className="modal-item-remove" onClick={() => setPendingFiles(prev => prev.filter((_, j) => j !== i))}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* 팁 · 주의 항목 */}
      <div className="modal-items-section">
        <div className="modal-items-header">
          <span className="modal-items-label">항목 추가</span>
          {items.length > 0 && <span className="modal-items-count">{items.length}개</span>}
        </div>
        <div>
          {items.map((item, i) => (
            <div key={item._id} className={`modal-item-row type-${item.type}`}>
              <div className="modal-item-order-btns">
                <button className="process-order-btn" disabled={i === 0} onClick={() => moveItem(i, -1)}>▲</button>
                <button className="process-order-btn" disabled={i === items.length - 1} onClick={() => moveItem(i, 1)}>▼</button>
              </div>
              {item.type === 'file' ? (
                <div className="modal-item-file">
                  {item._file || item.text ? (
                    <span className="modal-item-file-name">
                      {item._file ? item._file.name : item.text.split('|')[0]}
                      {item._file && <span className="file-size-hint"> ({formatFileSize(item._file.size)})</span>}
                    </span>
                  ) : (
                    <label className="modal-item-file-label">
                      파일 선택
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={e => { if (e.target.files[0]) updateItemFile(i, e.target.files[0]) }}
                      />
                    </label>
                  )}
                  {(item._file || item.text) && (
                    <label className="modal-item-file-change">
                      변경
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={e => { if (e.target.files[0]) updateItemFile(i, e.target.files[0]) }}
                      />
                    </label>
                  )}
                </div>
              ) : item.type === 'code'
                ? <AutoTextarea value={item.text} onChange={text => updateItem(i, text)} placeholder="코드를 입력하세요" isCode />
                : <RichEditor value={item.text} onChange={text => updateItem(i, text)} placeholder="내용을 입력하세요" />
              }
              <button className="modal-item-remove" onClick={() => removeItem(i)}>×</button>
            </div>
          ))}
        </div>
        <div className="modal-items-add-btns">
          <button className="modal-item-add-btn" onClick={() => addItem('default')}>일반</button>
          <button className="modal-item-add-btn" onClick={() => addItem('tip')}>팁</button>
          <button className="modal-item-add-btn" onClick={() => addItem('warning')}>주의</button>
          <button className="modal-item-add-btn" onClick={() => addItem('info')}>안내</button>
          <button className="modal-item-add-btn" onClick={() => addItem('code')}>코드</button>
          <button className="modal-item-add-btn" onClick={() => addItem('file')}>파일</button>
        </div>
      </div>
    </Modal>
  )
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function AutoTextarea({ value, onChange, placeholder, isCode }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])
  return (
    <textarea
      ref={ref}
      className={`modal-item-input${isCode ? ' modal-item-code' : ''}`}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      spellCheck={false}
    />
  )
}
