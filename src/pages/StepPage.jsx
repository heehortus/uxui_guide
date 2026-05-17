import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../hooks/usePlatforms'
import { useStep, useDeleteStep } from '../hooks/useSteps'
import { useReorderBlocks } from '../hooks/useBlocks'
import Block from '../components/blocks/Block'
import BlockModal from '../components/modals/BlockModal'
import StepModal from '../components/modals/StepModal'
import PageActionsMenu from '../components/ui/PageActionsMenu'
import { useToast } from '../context/ToastContext'


export default function StepPage() {
  const { platformId, stepId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: platforms = [] } = usePlatforms()
  const { data: step, isLoading } = useStep(stepId)
  const deleteStep = useDeleteStep()

  const reorderBlocks = useReorderBlocks()
  const [editStep, setEditStep] = useState(false)
  const [addBlock, setAddBlock] = useState(null) // null | block type string

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

      <div className="content-blocks">
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

      {/* 단계 수정 모달 */}
      <StepModal
        open={editStep}
        onClose={() => setEditStep(false)}
        platforms={platforms}
        platformId={platformId}
        editing={step}
      />

      {/* 블록 추가 모달 */}
      <BlockModal
        open={addBlock !== null}
        onClose={() => setAddBlock(null)}
        stepId={stepId}
      />
    </>
  )
}
