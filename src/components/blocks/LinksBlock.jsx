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
    const [name = '', type = '', url = '', extra = '', code = ''] = r.split('|').map(s => s?.trim() ?? '')
    return { name, type, url, extra, code: code.replace(/\\n/g, '\n') }
  })
}

function serializeRows(rows) {
  return rows.map(r => `${r.name}|${r.type}|${r.url}|${r.extra}|${r.code.replace(/\n/g, '\\n')}`).join('\n')
}

function parseFile(file) {
  if (!file) return null
  const idx = file.indexOf('::')
  const name = idx !== -1 ? file.slice(0, idx) : file
  const url  = idx !== -1 ? file.slice(idx + 2) : file
  const ext  = getExt(name)
  return { name, url, ext }
}

function isFileExtra(extra) {
  return Boolean(extra && extra.includes('::'))
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" role="graphics-symbol" viewBox="0 0 20 20" style={{ width: 16, height: 16, display: 'block', fill: 'currentColor', flexShrink: 0 }}>
      <path d="M3 4.875a.625.625 0 1 0 0 1.25h14a.625.625 0 1 0 0-1.25zm2.125 5.742h9.75a.625.625 0 1 0 0-1.25h-9.75a.625.625 0 1 0 0 1.25m1.5 3.883c0-.345.28-.625.625-.625h5.5a.625.625 0 1 1 0 1.25h-5.5a.625.625 0 0 1-.625-.625" />
    </svg>
  )
}

export default function LinksBlock({ block }) {
  const [codeModal, setCodeModal] = useState(null)
  const [lightbox, setLightbox] = useState(null)
  const [filterType, setFilterType] = useState('전체')
  const [filterOpen, setFilterOpen] = useState(false)
  const update = useUpdateBlock()

  const rows = parseRows(block.content)
  const allRows = rows.map((r, originalIdx) => ({ ...r, originalIdx }))

  // 전체 행 기준으로 컬럼 표시 여부 결정
  const hasType = allRows.some(r => r.type)
  const hasUrl  = allRows.some(r => r.url)
  const hasFile = allRows.some(r => isFileExtra(r.extra))
  const hasCode = allRows.some(r => r.code)
  const hasNote = allRows.some(r => r.extra && !isFileExtra(r.extra))

  const types = hasType
    ? ['전체', ...Array.from(new Set(allRows.map(r => r.type).filter(Boolean)))]
    : []

  const sortedRows = allRows
    .filter(r => filterType === '전체' || r.type === filterType)
    .sort((a, b) => {
      const typeCompare = (a.type || '').localeCompare(b.type || '', 'ko')
      if (typeCompare !== 0) return typeCompare
      return (a.name || '').localeCompare(b.name || '', 'ko')
    })

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
      {types.length > 1 && (
        <div className="link-filter-wrap">
          <div className="link-filter-dropdown">
            <button
              className={`link-filter-trigger${filterType !== '전체' ? ' link-filter-trigger--active' : ''}`}
              onClick={() => setFilterOpen(o => !o)}
              aria-expanded={filterOpen}
            >
              {filterType !== '전체' && <span className="link-filter-trigger-label">{filterType}</span>}
              <FilterIcon />
            </button>
            {filterOpen && (
              <>
                <div className="link-filter-backdrop" onClick={() => setFilterOpen(false)} />
                <div className="link-filter-menu">
                  {types.map(t => (
                    <button
                      key={t}
                      className={`link-filter-option${filterType === t ? ' link-filter-option--active' : ''}`}
                      onClick={() => { setFilterType(t); setFilterOpen(false) }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}>
        <table className="link-table">
          <thead>
            <tr>
              <th>가이드명</th>
              {hasType && <th>유형</th>}
              {hasUrl  && <th>링크</th>}
              {hasFile && <th>파일</th>}
              {hasCode && <th>코드</th>}
              {hasNote && <th>비고</th>}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const cls = BADGE[row.type] || 'book'
              const fileData = isFileExtra(row.extra) ? parseFile(row.extra) : null
              return (
                <tr key={row.originalIdx}>
                  <td>{row.name}</td>
                  {hasType && <td>{row.type && <span className={`badge-type ${cls}`}>{row.type}</span>}</td>}
                  {hasUrl && (
                    <td>
                      {row.url && (
                        <a href={row.url} target="_blank" rel="noopener">
                          {row.url.replace('https://', '').slice(0, 40)}{row.url.length > 47 ? '…' : ''}
                        </a>
                      )}
                    </td>
                  )}
                  {hasFile && (
                    <td className="link-table-file-cell">
                      {fileData && (() => {
                        const isMedia = IMAGE_EXT.includes(fileData.ext) || VIDEO_EXT.includes(fileData.ext)
                        return isMedia
                          ? <button className="link-code-btn link-file-btn" onClick={() => setLightbox(fileData)}>파일 ›</button>
                          : <a href={fileData.url} target="_blank" rel="noopener" download={fileData.name} className="link-code-btn link-file-btn">파일 ›</a>
                      })()}
                    </td>
                  )}
                  {hasCode && (
                    <td>
                      {row.code && (
                        <button
                          className="link-code-btn"
                          onClick={() => setCodeModal({ idx: row.originalIdx, code: row.code, title: row.name })}
                        >
                          코드 ›
                        </button>
                      )}
                    </td>
                  )}
                  {hasNote && (
                    <td><span style={{ fontSize: 13 }}>{!isFileExtra(row.extra) ? row.extra : ''}</span></td>
                  )}
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
