import { useState } from 'react'

export default function KakaoBlock({ content }) {
  const messages = (content || '')
    .split(/\n---\n|^---$/m)
    .map(s => s.trim())
    .filter(Boolean)

  return (
    <div className="kakao-messages">
      {messages.map((msg, i) => {
        const lines = msg.split('\n')
        let title = ''
        let body = msg
        if (lines[0]?.startsWith('# ')) {
          title = lines[0].slice(2).trim()
          body = lines.slice(1).join('\n').trim()
        }
        return <KakaoBubble key={i} title={title || `메시지 ${i + 1}`} body={body} />
      })}
    </div>
  )
}

function KakaoBubble({ title, body }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(body).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = body
      ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="kakao-bubble">
      <div className="kakao-bubble-header">
        <span className="kakao-bubble-title">{title}</span>
        <button className={`btn btn-ghost btn-sm${copied ? ' copied' : ''}`} onClick={handleCopy}>
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>
      <div className="kakao-bubble-text">{body}</div>
    </div>
  )
}
