import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../../hooks/usePlatforms'
import { useSteps } from '../../hooks/useSteps'
import PlatformModal from '../modals/PlatformModal'

export default function Sidebar() {
  const { platformId, stepId } = useParams()
  const navigate = useNavigate()
  const { data: platforms = [] } = usePlatforms()
  const [openGroups, setOpenGroups] = useState(new Set([platformId].filter(Boolean)))
  const [addPlatform, setAddPlatform] = useState(false)

  function toggleGroup(pid) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(pid) ? next.delete(pid) : next.add(pid)
      return next
    })
  }

  function handleNavPlatform(pid) {
    if (!openGroups.has(pid)) {
      setOpenGroups(prev => new Set([...prev, pid]))
    }
    navigate(`/${pid}`)
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-badge">U</div>
            <div>
              <div className="sidebar-title">UXUI 개발 플로우 가이드</div>
            </div>
          </div>
          <div className="sidebar-subtitle">Alpha/Abbg 내부 문서</div>
        </div>

        <nav className="sidebar-nav">
          {/* 홈 */}
          <div
            className={`nav-item${!platformId ? ' active' : ''}`}
            onClick={() => navigate('/')}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>⌂</span>
            <span>홈</span>
          </div>
          <div className="nav-divider" />

          {/* 플랫폼 그룹 */}
          {platforms.map(p => (
            <PlatformGroup
              key={p.id}
              platform={p}
              isOpen={openGroups.has(p.id)}
              activePlatformId={platformId}
              activeStepId={stepId}
              onToggle={() => toggleGroup(p.id)}
              onClickPlatform={() => handleNavPlatform(p.id)}
              onClickStep={(sid) => navigate(`/${p.id}/${sid}`)}
            />
          ))}

          <div className="nav-divider" />
          <button className="nav-add-platform-btn" onClick={() => setAddPlatform(true)}>
            ＋ 가이드북 추가
          </button>
        </nav>
      </aside>

      <PlatformModal open={addPlatform} onClose={() => setAddPlatform(false)} />
    </>
  )
}

function PlatformGroup({ platform, isOpen, activePlatformId, activeStepId, onToggle, onClickPlatform, onClickStep }) {
  const { data: steps = [] } = useSteps(isOpen ? platform.id : null)
  const isActive = activePlatformId === platform.id

  return (
    <div>
      <div
        className={`nav-platform-header${isActive ? ' active' : ''}`}
        onClick={onToggle}
      >
        <span className="nav-platform-label">{platform.label}</span>
        <span className={`nav-chevron${isOpen ? ' open' : ''}`}>›</span>
      </div>

      {isOpen && (
        <div className="nav-group-steps open">
          <div
            className={`nav-item nav-sub-item${isActive && !activeStepId ? ' active' : ''}`}
            onClick={onClickPlatform}
          >
            <span className="nav-step-num">전체</span>
            <span>단계 목록</span>
          </div>
          {steps.map(step => (
            <div
              key={step.id}
              className={`nav-item nav-sub-item${activeStepId === step.id ? ' active' : ''}`}
              onClick={() => onClickStep(step.id)}
            >
              <span className="nav-step-num">[{step.number}]</span>
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
