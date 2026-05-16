import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../../hooks/usePlatforms'
import { useStep } from '../../hooks/useSteps'

export default function Topbar({ onAddStep }) {
  const { platformId, stepId } = useParams()
  const navigate = useNavigate()
  const { data: platforms = [] } = usePlatforms()
  const { data: step } = useStep(stepId)

  const platform = platforms.find(p => p.id === platformId)

  return (
    <div className="topbar">
      <div className="topbar-breadcrumb" id="breadcrumb">
        {!platformId ? (
          <span>가이드 홈</span>
        ) : !stepId ? (
          <>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>홈</span>
            <span className="sep">›</span>
            <span>{platform?.label}</span>
          </>
        ) : (
          <>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>홈</span>
            <span className="sep">›</span>
            <span onClick={() => navigate(`/${platformId}`)} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              {platform?.label}
            </span>
            <span className="sep">›</span>
            <span>[{step?.number}] {step?.title}</span>
          </>
        )}
      </div>

      <div className="topbar-actions">
        {platformId && !stepId && (
          <button className="btn btn-primary" onClick={onAddStep}>
            <span>＋</span> 단계 추가
          </button>
        )}
      </div>
    </div>
  )
}
