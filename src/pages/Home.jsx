import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlatforms, useReorderPlatforms } from '../hooks/usePlatforms'
import PlatformModal from '../components/modals/PlatformModal'
import ArrowIcon from '../components/ui/ArrowIcon'
import FabButton from '../components/ui/FabButton'

export default function Home() {
  const { data: platforms = [], isLoading } = usePlatforms()
  const [addPlatform, setAddPlatform] = useState(false)
  const navigate = useNavigate()
  const reorderPlatforms = useReorderPlatforms()

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

      <div className="card-list">
        {platforms.map((p, i, arr) => (
          <div key={p.id} className="card-wrap">
            <div className="step-order-handle">
              <button
                className="block-order-btn"
                disabled={i === 0}
                onClick={() => handleMove(i, -1)}
                title="위로"
              >▲</button>
              <button
                className="block-order-btn"
                disabled={i === arr.length - 1}
                onClick={() => handleMove(i, 1)}
                title="아래로"
              >▼</button>
            </div>
            <div className="card platform-entry-card" onClick={() => navigate(`/${p.id}`)}>
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
                  <button className="block-order-btn" disabled={i === 0} onClick={() => handleMove(i, -1)}>▲</button>
                  <button className="block-order-btn" disabled={i === arr.length - 1} onClick={() => handleMove(i, 1)}>▼</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--on-surface-variant)', flexShrink: 0, pointerEvents: 'none' }}>
                  보러가기
                  <ArrowIcon direction="right" size={14} color="var(--on-surface-variant)" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PlatformModal open={addPlatform} onClose={() => setAddPlatform(false)} />
      <FabButton onClick={() => setAddPlatform(true)} title="가이드북 추가" />
    </>
  )
}
