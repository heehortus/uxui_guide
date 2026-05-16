import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../hooks/usePlatforms'
import { useStep, useDeleteStep } from '../hooks/useSteps'
import Block from '../components/blocks/Block'
import BlockModal from '../components/modals/BlockModal'
import StepModal from '../components/modals/StepModal'
import { useToast } from '../context/ToastContext'

const BLOCK_TYPES = [
  { value: 'default', label: '일반' },
  { value: 'tip',     label: '팁' },
  { value: 'warning', label: '주의' },
  { value: 'info',    label: '안내' },
  { value: 'process', label: '프로세스' },
  { value: 'links',   label: '링크 목록' },
  { value: 'kakao',   label: '안내 템플릿' },
  { value: 'code',    label: '코드' },
  { value: 'file',    label: '파일 첨부' },
]

export default function StepPage() {
  const { platformId, stepId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: platforms = [] } = usePlatforms()
  const { data: step, isLoading } = useStep(stepId)
  const deleteStep = useDeleteStep()

  const [editStep, setEditStep] = useState(false)
  const [addBlock, setAddBlock] = useState(null) // null | block type string

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
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginTop: 4 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditStep(true)}>수정</button>
            <button className="btn btn-danger btn-sm" onClick={handleDeleteStep}>삭제</button>
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Content</div>
      </div>

      <div className="content-blocks">
        {(step.blocks ?? []).map(block => (
          <Block key={block.id} block={block} stepId={stepId} />
        ))}
      </div>

      {/* 블록 추가 버튼 영역 */}
      <div className="add-block-area">
        <span style={{ fontSize: 12, color: 'var(--on-surface-variant)', alignSelf: 'center', marginRight: 4 }}>
          블록 추가:
        </span>
        {BLOCK_TYPES.map(t => (
          <button key={t.value} className="add-block-btn" onClick={() => setAddBlock(t.value)}>
            {t.label}
          </button>
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
