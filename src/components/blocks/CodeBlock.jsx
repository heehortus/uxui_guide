import { useState } from 'react'
import LivePreviewPanel from './LivePreviewPanel'

const COLLAPSE_LINES = 20

export default function CodeBlock({ content }) {
  const [preview, setPreview] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const lines = (content || '').split('\n')
  const isLong = lines.length > COLLAPSE_LINES
  const displayContent = (!expanded && isLong)
    ? lines.slice(0, COLLAPSE_LINES).join('\n')
    : content

  return (
    <div className="code-block-wrapper">
      <div className="code-block-toolbar">
        <button className={`code-tab-btn${!preview ? ' active' : ''}`} onClick={() => setPreview(false)}>코드</button>
        <button className={`code-tab-btn${preview ? ' active' : ''}`} onClick={() => setPreview(true)}>미리보기</button>
      </div>

      {preview ? (
        <LivePreviewPanel code={content} />
      ) : (
        <div className="code-block-collapsible">
          <pre className={`code-block-pre${!expanded && isLong ? ' code-block-pre--collapsed' : ''}`}>
            <code>{displayContent}</code>
          </pre>
          {isLong && (
            <button
              className="code-expand-btn"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? '▲ 접기' : `▼ 펼쳐보기 (총 ${lines.length}줄)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
