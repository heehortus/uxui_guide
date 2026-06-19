import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms, useDeletePlatform } from '../hooks/usePlatforms'
import { useSteps, useReorderSteps } from '../hooks/useSteps'
import PlatformModal from '../components/modals/PlatformModal'
import PageActionsMenu from '../components/ui/PageActionsMenu'
import { useToast } from '../context/ToastContext'
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function PlatformPage() {
  const { platformSlug } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: platforms = [] } = usePlatforms()
  const platform = platforms.find(p => (p.slug || p.id) === platformSlug)
  const platformId = platform?.id

  const { data: steps = [], isLoading } = useSteps(platformId)
  const deletePlatform = useDeletePlatform()
  const reorderSteps = useReorderSteps()
  const [editing, setEditing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = steps.findIndex(s => s.id === active.id)
    const newIndex = steps.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(steps, oldIndex, newIndex)
    reorderSteps.mutate({
      platform_id: platformId,
      steps: reordered.map((s, i) => ({ id: s.id, order_index: i })),
    })
  }

  function handleMoveStep(steps, index, dir) {
    const swapIndex = index + dir
    if (swapIndex < 0 || swapIndex >= steps.length) return
    const a = steps[index]
    const b = steps[swapIndex]
    reorderSteps.mutate({
      platform_id: platformId,
      steps: [
        { id: a.id, order_index: b.order_index },
        { id: b.id, order_index: a.order_index },
      ],
    })
  }

  async function handleDelete() {
    if (!confirm(`"${platform?.label}"을 삭제할까요?\n포함된 모든 단계가 함께 삭제됩니다.`)) return
    await deletePlatform.mutateAsync(platformId)
    toast('삭제되었습니다.')
    navigate('/')
  }

  if (!platform) return null

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">{platform.label}</div>
            <div className="page-desc">{platform.description}</div>
          </div>
          <PageActionsMenu actions={[
            { label: '수정', onClick: () => setEditing(true) },
            { label: '삭제', onClick: handleDelete, danger: true },
          ]} />
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">전체 단계</div>
      </div>

      {isLoading ? (
        <div className="empty-state"><div className="empty-state-desc">불러오는 중…</div></div>
      ) : steps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">아직 단계가 없습니다</div>
          <div className="empty-state-desc">상단의 단계 추가 버튼으로 첫 단계를 만들어 보세요.</div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="card-list">
              {steps.map((step, i, arr) => (
                <SortableStepCard
                  key={step.id}
                  step={step}
                  index={i}
                  total={arr.length}
                  platformSlug={platformSlug}
                  onMoveUp={i > 0 ? () => handleMoveStep(arr, i, -1) : null}
                  onMoveDown={i < arr.length - 1 ? () => handleMoveStep(arr, i, 1) : null}
                  onNavigate={() => navigate(`/${platformSlug}/${step.number}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <PlatformModal open={editing} onClose={() => setEditing(false)} editing={platform} />
    </>
  )
}

function SortableStepCard({ step, onMoveUp, onMoveDown, onNavigate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id })
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 10 : undefined,
    position: 'relative',
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  return (
    <div ref={setNodeRef} style={dragStyle} {...listeners} {...attributes} className="card-wrap">
      <div className="step-order-handle">
        <button className="block-order-btn" disabled={!onMoveUp} onClick={onMoveUp} title="위로" onPointerDown={e => e.stopPropagation()}>▲</button>
        <button className="block-order-btn" disabled={!onMoveDown} onClick={onMoveDown} title="아래로" onPointerDown={e => e.stopPropagation()}>▼</button>
      </div>
      <div className="card" onClick={onNavigate}>
        <div className="card-header">
          <div className={`card-step-badge${step.number === '00' ? ' accent' : ''}`}>
            {step.number}
          </div>
          <div className="card-meta">
            <div className="card-title">{step.title}</div>
            {step.subtitle && <div className="card-subtitle">{step.subtitle}</div>}
          </div>
          <div className="step-card-mobile-btns" onClick={e => e.stopPropagation()}>
            <button className="block-order-btn" disabled={!onMoveUp} onClick={onMoveUp}>▲</button>
            <button className="block-order-btn" disabled={!onMoveDown} onClick={onMoveDown}>▼</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', pointerEvents: 'none' }}>›</div>
        </div>
      </div>
    </div>
  )
}
