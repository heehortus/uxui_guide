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

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      {[4, 10, 16].map(cy => [7.5, 12.5].map(cx => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.25} />
      )))}
    </svg>
  )
}

export default function Block({ block, stepId, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const deleteBlock = useDeleteBlock()
  const toast = useToast()

  async function handleDelete() {
    setMenuOpen(false)
    if (!confirm('이 블록을 삭제할까요?')) return
    await deleteBlock.mutateAsync({ id: block.id, step_id: stepId })
    toast('삭제되었습니다.')
  }

  const typeClass = block.type === 'default' ? '' : `block-${block.type}`

  return (
    <>
      <div className={`content-block ${typeClass}`} id={`block-${block.id}`}>
        <div className="block-order-handle">
          <button className="block-order-btn" onClick={onMoveUp} disabled={!onMoveUp} title="위로">▲</button>
          <button className="block-order-btn" onClick={onMoveDown} disabled={!onMoveDown} title="아래로">▼</button>
        </div>

        {/* 데스크탑 액션 버튼 */}
        <div className="block-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>수정</button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--destructive)' }} onClick={handleDelete}>
            삭제
          </button>
        </div>

        {/* 모바일 액션 버튼 */}
        <button className="block-mobile-menu-btn" onClick={() => setMenuOpen(true)}>
          <DotsIcon />
        </button>

        {block.label && <div className="block-label">{block.label}</div>}
        <MediaItems items={block.block_items} />
        <BlockInner block={block} />
        <InlineItems items={block.block_items} />
      </div>

      {/* 모바일 액션 시트 */}
      {menuOpen && (
        <div className="block-action-sheet-overlay" onClick={() => setMenuOpen(false)}>
          <div className="block-action-sheet" onClick={e => e.stopPropagation()}>
            <div className="block-action-sheet-handle" />
            <button className="block-action-sheet-item" onClick={() => { setMenuOpen(false); setEditing(true) }}>
              수정
            </button>
            <button className="block-action-sheet-item block-action-sheet-item--danger" onClick={handleDelete}>
              삭제
            </button>
            {onMoveUp && (
              <button className="block-action-sheet-item" onClick={() => { setMenuOpen(false); onMoveUp() }}>
                위로
              </button>
            )}
            {onMoveDown && (
              <button className="block-action-sheet-item" onClick={() => { setMenuOpen(false); onMoveDown() }}>
                아래로
              </button>
            )}
            <button className="block-action-sheet-item block-action-sheet-item--cancel" onClick={() => setMenuOpen(false)}>
              취소
            </button>
          </div>
        </div>
      )}

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
    case 'links':
    case 'links-file': return <LinksBlock block={block} />
    case 'kakao':   return <KakaoBlock content={block.content} />
    case 'code':    return <CodeBlock content={block.content} />
    case 'file':    return <FileBlock content={block.content} />
    default: {
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
