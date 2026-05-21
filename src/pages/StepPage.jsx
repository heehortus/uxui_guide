import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../hooks/usePlatforms'
import { useStep, useSteps, useDeleteStep } from '../hooks/useSteps'
import { useReorderBlocks, useCreateBlock } from '../hooks/useBlocks'
import Block from '../components/blocks/Block'
import BlockModal from '../components/modals/BlockModal'
import StepModal from '../components/modals/StepModal'
import PageActionsMenu from '../components/ui/PageActionsMenu'
import FabButton from '../components/ui/FabButton'
import { useToast } from '../context/ToastContext'


export default function StepPage() {
  const { platformId, stepId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: platforms = [] } = usePlatforms()
  const { data: step, isLoading } = useStep(stepId)
  const { data: steps = [] } = useSteps(platformId)
  const deleteStep = useDeleteStep()

  const reorderBlocks = useReorderBlocks()
  const createBlock = useCreateBlock()
  const [editStep, setEditStep] = useState(false)
  const [addBlock, setAddBlock] = useState(null)
  const [ctxMenu, setCtxMenu] = useState(null) // { x, y }

  async function handlePaste() {
    setCtxMenu(null)
    const raw = localStorage.getItem('uxui-copied-block')
    if (!raw) return
    const copied = JSON.parse(raw)
    await createBlock.mutateAsync({
      step_id: stepId,
      type: copied.type,
      label: copied.label,
      content: copied.content,
      items: (copied.block_items || []).map(it => ({ type: it.type, text: it.text })),
    })
  }

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return
        if (!localStorage.getItem('uxui-copied-block')) return
        e.preventDefault()
        handlePaste()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [stepId])

  function handleContextMenu(e) {
    if (!localStorage.getItem('uxui-copied-block')) return
    const tag = e.target?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'A' || tag === 'BUTTON') return
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY })
  }

  function handleMoveBlock(blocks, index, dir) {
    const swapIndex = index + dir
    if (swapIndex < 0 || swapIndex >= blocks.length) return
    const a = blocks[index]
    const b = blocks[swapIndex]
    reorderBlocks.mutate({
      step_id: stepId,
      blocks: [
        { id: a.id, order_index: b.order_index },
        { id: b.id, order_index: a.order_index },
      ],
    })
  }

  async function handleDeleteStep() {
    if (!confirm('이 단계를 삭제할까요?')) return
    await deleteStep.mutateAsync({ id: stepId, platform_id: platformId })
    toast('삭제되었습니다.')
    navigate(`/${platformId}`)
  }

  if (isLoading) return <div className="empty-state"><div className="empty-state-desc">불러오는 중…</div></div>
  if (!step) return null

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">{step.title}</div>
            {step.subtitle && <div className="page-desc">{step.subtitle}</div>}
          </div>
          <PageActionsMenu actions={[
            { label: '수정', onClick: () => setEditStep(true) },
            { label: '삭제', onClick: handleDeleteStep, danger: true },
          ]} />
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Content</div>
        <button className="btn btn-primary btn-sm" onClick={() => setAddBlock('default')}>
          + 블록 추가
        </button>
      </div>

      <div className="content-blocks" onContextMenu={handleContextMenu}>
        {(step.blocks ?? []).map((block, i, arr) => (
          <Block
            key={block.id}
            block={block}
            stepId={stepId}
            onMoveUp={i > 0 ? () => handleMoveBlock(arr, i, -1) : null}
            onMoveDown={i < arr.length - 1 ? () => handleMoveBlock(arr, i, 1) : null}
          />
        ))}
      </div>

      {ctxMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setCtxMenu(null)} />
          <div
            style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 9999,
              background: 'var(--surface)', border: '1px solid var(--outline-variant)',
              borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)', padding: '4px 0', minWidth: 140 }}
          >
            <button
              onClick={handlePaste}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px',
                fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-container)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              붙여넣기
            </button>
          </div>
        </>
      )}


      {/* 단계 수정 모달 */}
      <StepModal
        open={editStep}
        onClose={() => setEditStep(false)}
        platforms={platforms}
        platformId={platformId}
        editing={step}
      />

      {/* 이전/다음 단계 네비게이션 */}
      <StepNavigation steps={steps} currentId={stepId} platformId={platformId} />

      {/* 블록 추가 모달 */}
      <BlockModal
        open={addBlock !== null}
        onClose={() => setAddBlock(null)}
        stepId={stepId}
      />
      <FabButton onClick={() => setAddBlock('default')} title="블록 추가" />
    </>
  )
}

function ChevronDouble({ direction }) {
  const flip = direction === 'left'
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M6.5999 6L5.3999 7L9.8999 12L5.3999 17L6.4999 18L11.9999 12L6.5999 6ZM12.5999 6L11.4999 7L15.9999 12L11.4999 17L12.5999 18L18.0999 12L12.5999 6Z" />
    </svg>
  )
}

function StepNavigation({ steps, currentId, platformId }) {
  const navigate = useNavigate()
  const idx = steps.findIndex(s => s.id === currentId)
  if (steps.length < 2 || idx === -1) return null

  const prev = idx > 0 ? steps[idx - 1] : null
  const next = idx < steps.length - 1 ? steps[idx + 1] : null

  return (
    <div className="step-nav">
      <div className="step-nav-btn-wrap">
        {prev && (
          <button className="step-nav-btn step-nav-btn--prev" onClick={() => navigate(`/${platformId}/${prev.id}`)}>
            <ChevronDouble direction="left" />
            <div className="step-nav-meta">
              <span className="step-nav-label">이전 단계</span>
              <span className="step-nav-title">{prev.title}</span>
            </div>
          </button>
        )}
        {next && (
          <button className="step-nav-btn step-nav-btn--next" onClick={() => navigate(`/${platformId}/${next.id}`)}>
            <div className="step-nav-meta">
              <span className="step-nav-label">다음 단계</span>
              <span className="step-nav-title">{next.title}</span>
            </div>
            <ChevronDouble direction="right" />
          </button>
        )}
      </div>
    </div>
  )
}
