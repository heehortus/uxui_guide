import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms, useDeletePlatform } from '../hooks/usePlatforms'
import { useSteps } from '../hooks/useSteps'
import PlatformModal from '../components/modals/PlatformModal'
import PageActionsMenu from '../components/ui/PageActionsMenu'
import { useToast } from '../context/ToastContext'

export default function PlatformPage() {
  const { platformId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const { data: platforms = [] } = usePlatforms()
  const { data: steps = [], isLoading } = useSteps(platformId)
  const deletePlatform = useDeletePlatform()
  const [editing, setEditing] = useState(false)

  const platform = platforms.find(p => p.id === platformId)

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
        <div className="card-list">
          {steps.map(step => (
            <div
              key={step.id}
              className="card"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/${platformId}/${step.id}`)}
            >
              <div className="card-header" style={{ pointerEvents: 'none' }}>
                <div className={`card-step-badge${step.number === '00' ? ' accent' : ''}`}>
                  {step.number}
                </div>
                <div className="card-meta">
                  <div className="card-title">{step.title}</div>
                  {step.subtitle && <div className="card-subtitle">{step.subtitle}</div>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>›</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PlatformModal open={editing} onClose={() => setEditing(false)} editing={platform} />
    </>
  )
}
