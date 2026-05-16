import { useState } from 'react'
import { useDeleteBlock } from '../../hooks/useBlocks'
import { useToast } from '../../context/ToastContext'
import { linkifyText } from '../../lib/utils'
import BlockModal from '../modals/BlockModal'
import ProcessBlock from './ProcessBlock'
import LinksBlock from './LinksBlock'
import KakaoBlock from './KakaoBlock'
import CodeBlock from './CodeBlock'
import FileBlock from './FileBlock'
import { MediaItems, InlineItems } from './MediaItems'

const COPYABLE = ['code', 'kakao']

export default function Block({ block, stepId }) {
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const deleteBlock = useDeleteBlock()
  const toast = useToast()

  async function handleDelete() {
    if (!confirm('이 블록을 삭제할까요?')) return
    await deleteBlock.mutateAsync({ id: block.id, step_id: stepId })
    toast('삭제되었습니다.')
  }

  function handleCopy() {
    const text = block.content || ''
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

  const typeClass = block.type === 'default' ? '' : `block-${block.type}`
  const canCopy = COPYABLE.includes(block.type)

  return (
    <>
      <div className={`content-block ${typeClass}`} id={`block-${block.id}`}>
        <div className="block-actions">
          {canCopy && (
            <button className={`btn btn-ghost btn-sm${copied ? ' copied' : ''}`} onClick={handleCopy}>
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>수정</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--destructive)' }} onClick={handleDelete}>
            삭제
          </button>
        </div>
        {block.label && <div className="block-label">{block.label}</div>}
        <MediaItems items={block.block_items} />
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
    case 'process': return <ProcessBlock content={block.content} />
    case 'links':   return <LinksBlock block={block} />
    case 'kakao':   return <KakaoBlock content={block.content} />
    case 'code':    return <CodeBlock content={block.content} />
    case 'file':    return <FileBlock content={block.content} />
    default: {
      // Tiptap HTML content starts with <p>/<h>/<ul> etc; plain text uses linkifyText
      const isHtml = /^<[a-z]/i.test((block.content || '').trimStart())
      return (
        <div
          className="block-content rich-content"
          dangerouslySetInnerHTML={{ __html: isHtml ? block.content : linkifyText(block.content) }}
        />
      )
    }
  }
}
