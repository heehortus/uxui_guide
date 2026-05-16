import { useState, useEffect } from 'react'

export default function CodeModal({ code, title, onClose, onSave, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(code)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleCopy() {
    const text = editing ? draft : code
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function handleSave() {
    await onSave(draft)
    setEditing(false)
  }

  function handleEditToggle() {
    setDraft(code)
    setEditing(true)
  }

  function handleCancel() {
    setDraft(code)
    setEditing(false)
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="code-modal" onClick={e => e.stopPropagation()}>
        <div className="code-modal-header">
          <span className="code-modal-title">{title}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editing && (
              <button className={`btn btn-ghost btn-sm${copied ? ' copied' : ''}`} onClick={handleCopy}>
                {copied ? '복사됨 ✓' : '복사'}
              </button>
            )}
            {onSave && !editing && (
              <button className="btn btn-ghost btn-sm" onClick={handleEditToggle}>수정</button>
            )}
            {onDelete && !editing && (
              <button className="btn btn-ghost btn-sm" style={{ color: '#f38ba8' }} onClick={onDelete}>삭제</button>
            )}
            {editing && (
              <>
                <button className="btn btn-ghost btn-sm" onClick={handleCancel}>취소</button>
                <button className="btn btn-sm" style={{ background: '#89b4fa', color: '#1e1e2e', border: 'none' }} onClick={handleSave}>저장</button>
              </>
            )}
            <button className="lightbox-close" style={{ position: 'static', width: 32, height: 32, fontSize: 16 }} onClick={onClose}>✕</button>
          </div>
        </div>
        {editing ? (
          <textarea
            className="code-modal-textarea"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            spellCheck={false}
            autoFocus
          />
        ) : (
          <pre className="code-modal-pre"><code>{code}</code></pre>
        )}
      </div>
    </div>
  )
}
