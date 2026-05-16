import { useState, useEffect, useRef } from 'react'
import Modal from '../ui/Modal'
import { useCreateBlock, useUpdateBlock } from '../../hooks/useBlocks'
import { useToast } from '../../context/ToastContext'

const TYPES = [
  { value: 'default', label: '일반' },
  { value: 'tip',     label: '팁' },
  { value: 'warning', label: '주의' },
  { value: 'info',    label: '안내' },
  { value: 'process', label: '프로세스' },
  { value: 'links',   label: '링크 목록' },
  { value: 'kakao',   label: '카톡 템플릿' },
]
const SPECIAL = ['links', 'kakao']
const ITEM_ICONS = { tip: '💡', warning: '⚠️', info: 'ℹ️', default: '•' }

export default function BlockModal({ open, onClose, stepId, editing }) {
  const [type, setType] = useState('default')
  const [label, setLabel] = useState('')
  const [content, setContent] = useState('')
  const [linksContent, setLinksContent] = useState('')
  const [kakaoContent, setKakaoContent] = useState('')
  const [items, setItems] = useState([])

  const toast = useToast()
  const create = useCreateBlock()
  const update = useUpdateBlock()
  const isPending = create.isPending || update.isPending

  useEffect(() => {
    if (open) {
      setType(editing?.type ?? 'default')
      setLabel(editing?.label ?? '')
      if (editing?.type === 'links') {
        setLinksContent(editing?.content ?? '')
        setContent('')
      } else if (editing?.type === 'kakao') {
        setKakaoContent(editing?.content ?? '')
        setContent('')
      } else {
        setContent(editing?.content ?? '')
        setLinksContent('')
        setKakaoContent('')
      }
      setItems((editing?.block_items ?? []).map(it => ({ type: it.type, text: it.text })))
    }
  }, [open, editing])

  function addItem(itemType) {
    setItems(prev => [...prev, { type: itemType, text: '' }])
  }
  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }
  function updateItem(idx, text) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, text } : it))
  }

  async function handleSave() {
    const actualContent = type === 'links' ? linksContent : type === 'kakao' ? kakaoContent : content
    const validItems = items.filter(it => it.text.trim())
    if (!actualContent.trim() && validItems.length === 0) {
      toast('내용이나 항목을 입력해주세요.')
      return
    }
    const payload = {
      step_id: stepId,
      type,
      label: label.trim(),
      content: actualContent.trim(),
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
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
            {isPending ? '저장 중…' : '저장'}
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
          <textarea className="form-textarea" value={content} onChange={e => setContent(e.target.value)}
            placeholder="내용을 입력하세요. URL은 자동으로 링크 처리됩니다." />
          <span className="form-hint">줄 바꿈 그대로 반영됩니다. URL은 자동 링크됩니다.</span>
        </div>
      )}

      {/* 링크 목록 */}
      {type === 'links' && (
        <div className="form-group">
          <label className="form-label">링크 목록</label>
          <div className="form-hint" style={{ marginBottom: 8 }}>
            한 줄에 하나씩: <code style={{ background: 'var(--surface-container)', padding: '1px 6px', borderRadius: 4 }}>가이드명 | 유형 | URL | 비고(선택)</code>
          </div>
          <textarea className="form-textarea" value={linksContent}
            onChange={e => setLinksContent(e.target.value)}
            placeholder={'쇼핑 위젯 설정 | 쇼핑 | https://imweb.me/...\n구글 지도 삽입 | 디자인 | https://imweb.me/...'}
          />
        </div>
      )}

      {/* 카카오 템플릿 */}
      {type === 'kakao' && (
        <div className="form-group">
          <label className="form-label">카카오 메시지</label>
          <div className="form-hint" style={{ marginBottom: 8 }}>
            여러 메시지는 <code style={{ background: 'var(--surface-container)', padding: '1px 6px', borderRadius: 4 }}>---</code>로 구분.{' '}
            제목은 첫 줄에 <code style={{ background: 'var(--surface-container)', padding: '1px 6px', borderRadius: 4 }}># 제목</code> (선택)
          </div>
          <textarea className="form-textarea" value={kakaoContent}
            onChange={e => setKakaoContent(e.target.value)}
            style={{ minHeight: 180 }}
            placeholder={'# 스킨 제안 안내\n안녕하세요 :)\n---\n# 커스텀 문의 결과\n비용은 20만원입니다.'}
          />
        </div>
      )}

      {/* 팁 · 주의 항목 */}
      <div className="modal-items-section">
        <div className="modal-items-header">
          <span className="modal-items-label">팁 · 주의 항목</span>
          {items.length > 0 && <span className="modal-items-count">{items.length}개</span>}
        </div>
        <div>
          {items.map((item, i) => (
            <div key={i} className={`modal-item-row type-${item.type}`}>
              <span className="modal-item-icon">{ITEM_ICONS[item.type] || '•'}</span>
              <AutoTextarea
                value={item.text}
                onChange={text => updateItem(i, text)}
                placeholder="내용을 입력하세요"
              />
              <button className="modal-item-remove" onClick={() => removeItem(i)}>×</button>
            </div>
          ))}
        </div>
        <div className="modal-items-add-btns">
          <button className="modal-item-add-btn type-tip"     onClick={() => addItem('tip')}>💡 팁 추가</button>
          <button className="modal-item-add-btn type-warning" onClick={() => addItem('warning')}>⚠️ 주의 추가</button>
          <button className="modal-item-add-btn type-info"    onClick={() => addItem('info')}>ℹ️ 안내 추가</button>
          <button className="modal-item-add-btn type-default" onClick={() => addItem('default')}>• 일반 추가</button>
        </div>
      </div>
    </Modal>
  )
}

function AutoTextarea({ value, onChange, placeholder }) {
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
      className="modal-item-input"
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  )
}
