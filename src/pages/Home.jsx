import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlatforms, useReorderPlatforms } from '../hooks/usePlatforms'
import PlatformModal from '../components/modals/PlatformModal'
import ArrowIcon from '../components/ui/ArrowIcon'
import FabButton from '../components/ui/FabButton'
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function Home() {
  const { data: platforms = [], isLoading } = usePlatforms()
  const [addPlatform, setAddPlatform] = useState(false)
  const navigate = useNavigate()
  const reorderPlatforms = useReorderPlatforms()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = platforms.findIndex(p => p.id === active.id)
    const newIndex = platforms.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(platforms, oldIndex, newIndex)
    reorderPlatforms.mutate(reordered.map((p, i) => ({ id: p.id, order_index: i })))
  }

  function handleMove(index, dir) {
    const swapIndex = index + dir
    if (swapIndex < 0 || swapIndex >= platforms.length) return
    const a = platforms[index]
    const b = platforms[swapIndex]
    reorderPlatforms.mutate([
      { id: a.id, order_index: b.order_index },
      { id: b.id, order_index: a.order_index },
    ])
  }

  if (isLoading) return <div className="empty-state"><div className="empty-state-desc">불러오는 중…</div></div>

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <div className="page-title">홈페이지 개발 플로우 가이드</div>
            <div className="page-desc">UXUI팀의 홈페이지 개발 가이드북입니다. 자유롭게 둘러보세요.</div>
          </div>
          <button className="btn btn-primary" style={{ flexShrink: 0, marginTop: 4 }} onClick={() => setAddPlatform(true)}>
            ＋ 가이드북 추가
          </button>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">가이드북 목록</div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={platforms.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="card-list">
            {platforms.map((p, i, arr) => (
              <SortablePlatformCard
                key={p.id}
                platform={p}
                onMoveUp={i > 0 ? () => handleMove(i, -1) : null}
                onMoveDown={i < arr.length - 1 ? () => handleMove(i, 1) : null}
                onNavigate={() => navigate(`/${p.slug || p.id}`)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <PlatformModal open={addPlatform} onClose={() => setAddPlatform(false)} />
      <FabButton onClick={() => setAddPlatform(true)} title="가이드북 추가" />
    </>
  )
}

function SortablePlatformCard({ platform: p, onMoveUp, onMoveDown, onNavigate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id })
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
      <div className="card platform-entry-card" onClick={onNavigate}>
        <div className="card-header">
          <div className="card-step-badge accent" style={{ width: '40px', height: '40px', padding: '8px', overflow: 'hidden' }}>
            {p.icon?.startsWith('http')
              ? <img src={p.icon} alt="" className="platform-icon-img" />
              : null}
          </div>
          <div className="card-meta">
            <div className="card-title">{p.label}</div>
            <div className="card-subtitle">{p.description}</div>
          </div>
          <div className="step-card-mobile-btns" onClick={e => e.stopPropagation()}>
            <button className="block-order-btn" disabled={!onMoveUp} onClick={onMoveUp}>▲</button>
            <button className="block-order-btn" disabled={!onMoveDown} onClick={onMoveDown}>▼</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--on-surface-variant)', flexShrink: 0, pointerEvents: 'none' }}>
            보러가기
            <ArrowIcon direction="right" size={14} color="var(--on-surface-variant)" />
          </div>
        </div>
      </div>
    </div>
  )
}
