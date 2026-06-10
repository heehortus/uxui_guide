import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../../hooks/usePlatforms'
import { useSteps } from '../../hooks/useSteps'

export default function Topbar({ onAddStep }) {
  const { platformSlug, stepNumber } = useParams()
  const navigate = useNavigate()
  const { data: platforms = [] } = usePlatforms()

  const platform = platforms.find(p => (p.slug || p.id) === platformSlug)
  const { data: steps = [] } = useSteps(stepNumber ? platform?.id : null)
  const step = stepNumber ? steps.find(s => s.number === stepNumber) : null

  return (
    <div className="topbar">
      <div className="topbar-breadcrumb" id="breadcrumb">
        {!platformSlug ? (
          <span>가이드 홈</span>
        ) : !stepNumber ? (
          <>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>홈</span>
            <span className="sep">›</span>
            <span>{platform?.label}</span>
          </>
        ) : (
          <>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>홈</span>
            <span className="sep">›</span>
            <span onClick={() => navigate(`/${platformSlug}`)} style={{ cursor: 'pointer', color: 'var(--on-surface-variant)' }}>
              {platform?.label}
            </span>
            <span className="sep">›</span>
            <span>[{stepNumber}] {step?.title}</span>
          </>
        )}
      </div>

      <div className="topbar-actions">
        {platformSlug && !stepNumber && (
          <button className="btn btn-primary" onClick={onAddStep}>
            <span>＋</span> 단계 추가
          </button>
        )}
      </div>
    </div>
  )
}
