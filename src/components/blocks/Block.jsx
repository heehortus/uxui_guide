import { useState } from 'react'
import { useDeleteBlock } from '../../hooks/useBlocks'
import { useToast } from '../../context/ToastContext'
import { linkifyText, escHtml } from '../../lib/utils'
import BlockModal from '../modals/BlockModal'

export default function Block({ block, stepId }) {
  const [editing, setEditing] = useState(false)
  const deleteBlock = useDeleteBlock()
  const toast = useToast()

  async function handleDelete() {
    if (!confirm('이 블록을 삭제할까요?')) return
    await deleteBlock.mutateAsync({ id: block.id, step_id: stepId })
    toast('삭제되었습니다.')
  }

  const typeClass = block.type === 'default' ? '' : `block-${block.type}`

  return (
    <>
      <div className={`content-block ${typeClass}`} id={`block-${block.id}`}>
        <div className="block-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>수정</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={handleDelete}>
            삭제
          </button>
        </div>
        {block.label && <div className="block-label">{block.label}</div>}
        <BlockInner block={block} />
        <InlineItems items={block.block_items} />
      </div>

      <BlockModal
        open={editing}
        onClose={() => setEditing(false)}
        stepId={stepId}
        editing={block}
      />
    </>
  )
}

function BlockInner({ block }) {
  switch (block.type) {
    case 'process':  return <ProcessBlock content={block.content} />
    case 'links':    return <LinksBlock content={block.content} />
    case 'kakao':    return <KakaoBlock content={block.content} />
    default:
      return (
        <div
          className="block-content"
          dangerouslySetInnerHTML={{ __html: linkifyText(block.content) }}
        />
      )
  }
}

function ProcessBlock({ content }) {
  const lines = (content || '').split('\n').filter(l => l.trim())
  return (
    <div className="process-steps">
      {lines.map((line, i) => {
        const [title, desc] = line.split('|')
        return (
          <div key={i} className="process-step">
            <div className="process-num">{i + 1}</div>
            <div className="process-text">
              <strong>{title?.trim()}</strong>
              {desc && <><br />{desc.trim()}</>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LinksBlock({ content }) {
  const rows = (content || '').split('\n').filter(l => l.trim())
  const BADGE = {
    쇼핑: 'shop', 예약: 'shop',
    디자인: 'design',
    코딩: 'code', 코드: 'code',
    회원: 'book', 콘텐츠: 'book',
  }
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)' }}>
      <table className="link-table">
        <thead>
          <tr><th>가이드명</th><th>유형</th><th>링크</th><th>비고</th></tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const [name, type, url, note] = row.split('|').map(s => s?.trim())
            const cls = BADGE[type] || 'book'
            return (
              <tr key={i}>
                <td>{name}</td>
                <td><span className={`badge-type ${cls}`}>{type}</span></td>
                <td>
                  {url && (
                    <a href={url} target="_blank" rel="noopener">
                      {url.replace('https://', '').slice(0, 40)}{url.length > 47 ? '…' : ''}
                    </a>
                  )}
                </td>
                <td style={{ color: 'var(--on-surface-variant)' }}>{note}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function KakaoBlock({ content }) {
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
        <button className={`kakao-copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>
      <div className="kakao-bubble-text">{body}</div>
    </div>
  )
}

function InlineItems({ items }) {
  if (!items?.length) return null
  const ICONS = { tip: '💡', warning: '⚠️', info: 'ℹ️', default: '•' }
  return (
    <div className="block-inline-items">
      <div className="tiplist-items">
        {items.map((item, i) => (
          <div key={i} className={`tiplist-item type-${item.type}`}>
            <span className="tiplist-text"
              dangerouslySetInnerHTML={{ __html: linkifyText(item.text) }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
