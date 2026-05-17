import { useState } from 'react'
import { useUpdateBlock } from '../../hooks/useBlocks'
import { IMAGE_EXT, VIDEO_EXT, getExt } from '../../lib/fileUtils'
import CodeModal from './CodeModal'
import Lightbox from './Lightbox'

const BADGE = {
  쇼핑: 'shop', 예약: 'shop',
  디자인: 'design',
  코딩: 'code', 코드: 'code',
  회원: 'book', 콘텐츠: 'book',
}

function parseRows(content) {
  return (content || '').split('\n').filter(l => l.trim()).map(r => {
    const [name = '', type = '', url = '', file = '', code = ''] = r.split('|').map(s => s?.trim() ?? '')
    return { name, type, url, file, code: code.replace(/\\n/g, '\n') }
  })
}

function serializeRows(rows) {
  return rows.map(r => `${r.name}|${r.type}|${r.url}|${r.file}|${r.code.replace(/\n/g, '\\n')}`).join('\n')
}

function parseFile(file) {
  if (!file) return null
  // 저장 형식: "filename::url" (구분자 ::)
  const idx = file.indexOf('::')
  const name = idx !== -1 ? file.slice(0, idx) : file
  const url  = idx !== -1 ? file.slice(idx + 2) : file
  const ext  = getExt(name)
  return { name, url, ext }
}

export default function LinksBlock({ block }) {
  const [codeModal, setCodeModal] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const update = useUpdateBlock()

  const rows = parseRows(block.content)

  async function handleCodeSave(idx, newCode) {
    const next = rows.map((r, i) => i === idx ? { ...r, code: newCode } : r)
    await update.mutateAsync({
      id: block.id, step_id: block.step_id,
      type: block.type, label: block.label,
      content: serializeRows(next), items: [],
    })
    setCodeModal(null)
  }

  async function handleRowDelete(idx) {
    if (!confirm('이 항목을 삭제할까요?')) return
    const next = rows.filter((_, i) => i !== idx)
    await update.mutateAsync({
      id: block.id, step_id: block.step_id,
      type: block.type, label: block.label,
      content: serializeRows(next), items: [],
    })
    setCodeModal(null)
  }

  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}>
        <table className="link-table">
          <thead>
            <tr><th>가이드명</th><th>유형</th><th>링크</th><th>파일</th><th>코드</th></tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const cls = BADGE[row.type] || 'book'
              return (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td><span className={`badge-type ${cls}`}>{row.type}</span></td>
                  <td>
                    {row.url && (
                      <a href={row.url} target="_blank" rel="noopener">
                        {row.url.replace('https://', '').slice(0, 40)}{row.url.length > 47 ? '…' : ''}
                      </a>
                    )}
                  </td>
                  <td className="link-table-file-cell">
                    {(() => {
                      const f = parseFile(row.file)
                      if (!f) return null
                      const isMedia = IMAGE_EXT.includes(f.ext) || VIDEO_EXT.includes(f.ext)
                      if (isMedia) {
                        return (
                          <button className="link-code-btn link-file-btn" onClick={() => setLightbox(f)}>
                            파일 ›
                          </button>
                        )
                      }
                      return (
                        <a href={f.url} target="_blank" rel="noopener" download={f.name} className="link-code-btn link-file-btn">
                          파일 ›
                        </a>
                      )
                    })()}
                  </td>
                  <td>
                    {row.code && (
                      <button
                        className="link-code-btn"
                        onClick={() => setCodeModal({ idx: i, code: row.code, title: row.name })}
                      >
                        코드 ›
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {lightbox && (
        <Lightbox {...lightbox} onClose={() => setLightbox(null)} />
      )}

      {codeModal && (
        <CodeModal
          code={codeModal.code}
          title={codeModal.title}
          onClose={() => setCodeModal(null)}
          onSave={newCode => handleCodeSave(codeModal.idx, newCode)}
          onDelete={() => handleRowDelete(codeModal.idx)}
        />
      )}
    </>
  )
}
