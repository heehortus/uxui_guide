import { useState } from 'react'
import { useUpdateBlock } from '../../hooks/useBlocks'
import CodeModal from './CodeModal'

const BADGE = {
  쇼핑: 'shop', 예약: 'shop',
  디자인: 'design',
  코딩: 'code', 코드: 'code',
  회원: 'book', 콘텐츠: 'book',
}

function parseRows(content) {
  return (content || '').split('\n').filter(l => l.trim()).map(r => {
    const [name = '', type = '', url = '', note = '', code = ''] = r.split('|').map(s => s?.trim() ?? '')
    return { name, type, url, note, code: code.replace(/\\n/g, '\n')}
  })
}

function serializeRows(rows) {
  return rows.map(r => `${r.name}|${r.type}|${r.url}|${r.note}|${r.code.replace(/\n/g, '\\n')}`).join('\n')
}

export default function LinksBlock({ block }) {
  const [codeModal, setCodeModal] = useState(null) // { idx, code, title }
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
            <tr><th>가이드명</th><th>유형</th><th>링크</th><th>비고</th><th>코드</th></tr>
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
                  <td>{row.note}</td>
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
