import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlatforms } from '../hooks/usePlatforms'
import PlatformModal from '../components/modals/PlatformModal'

export default function Home() {
  const { data: platforms = [], isLoading } = usePlatforms()
  const [addPlatform, setAddPlatform] = useState(false)
  const navigate = useNavigate()

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
        {platforms.map(p => (
          <div key={p.id} className="card platform-entry-card" onClick={() => navigate(`/${p.id}`)}>
            <div className="card-header" style={{ pointerEvents: 'none' }}>
              <div className="card-step-badge accent" style={{ width: '40px', height: '40px', padding: '8px', overflow: 'hidden' }}>
                {p.icon?.startsWith('http')
                  ? <img src={p.icon} alt="" className="platform-icon-img" />
                  : null}
              </div>
              <div className="card-meta">
                <div className="card-title">{p.label}</div>
                <div className="card-subtitle">{p.description}</div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', flexShrink: 0 }}>
                보러가기 ›
              </div>
            </div>
          </div>
        ))}
      </div>

      <PlatformModal open={addPlatform} onClose={() => setAddPlatform(false)} />
    </>
  )
}
