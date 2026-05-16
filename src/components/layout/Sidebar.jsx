import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../../hooks/usePlatforms'
import { useSteps, useSearchSteps } from '../../hooks/useSteps'
import PlatformModal from '../modals/PlatformModal'

export default function Sidebar() {
  const { platformId, stepId } = useParams()
  const navigate = useNavigate()
  const { data: platforms = [] } = usePlatforms()
  const [openGroups, setOpenGroups] = useState(new Set([platformId].filter(Boolean)))
  const [addPlatform, setAddPlatform] = useState(false)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const searchRef = useRef(null)
  const timerRef = useRef(null)

  function handleQueryChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(val), 250)
  }

  function clearSearch() {
    setQuery('')
    setDebouncedQuery('')
  }

  function toggleGroup(pid) {
    setOpenGroups(prev => {
      const next = new Set(prev)
      next.has(pid) ? next.delete(pid) : next.add(pid)
      return next
    })
  }

  function handleNavPlatform(pid) {
    setOpenGroups(new Set([pid]))
    navigate(`/${pid}`)
  }

  function handleSelectResult(result) {
    clearSearch()
    setOpenGroups(new Set([result.platform_id]))
    navigate(`/${result.platform_id}/${result.id}`)
  }

  const showSearch = debouncedQuery.trim().length > 0

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div>
              <div className="sidebar-title">UXUI 개발 가이드</div>
            </div>
          </div>
          <div className="sidebar-subtitle">알파 브라더스/ABBG UXUI팀 문서</div>
        </div>

        <nav className="sidebar-nav">
          {/* 검색 */}
          <div className="sidebar-search-wrap">
            <div className="sidebar-search-box">
              <span className="sidebar-search-icon">⌕</span>
              <input
                ref={searchRef}
                className="sidebar-search-input"
                value={query}
                onChange={handleQueryChange}
                placeholder="궁금한 내용을 입력하세요."
              />
              {query && (
                <button className="sidebar-search-clear" onClick={clearSearch}>✕</button>
              )}
            </div>
            {showSearch && <SearchResults query={debouncedQuery} onSelect={handleSelectResult} />}
          </div>

          {/* 홈 */}
          {!showSearch && (
            <>
              <div
                className={`nav-item${!platformId ? ' active' : ''}`}
                onClick={() => { setOpenGroups(new Set()); navigate('/') }}
              >
                <span>홈</span>
              </div>
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
            </>
          )}
        </nav>
      </aside>

      <PlatformModal open={addPlatform} onClose={() => setAddPlatform(false)} />
    </>
  )
}

function SearchResults({ query, onSelect }) {
  const { data: results = [], isLoading } = useSearchSteps(query)

  if (isLoading) return <div className="search-results-empty">검색 중…</div>
  if (!results.length) return <div className="search-results-empty">결과 없음</div>

  return (
    <div className="search-results">
      {results.map(r => (
        <div key={r.id} className="search-result-item" onClick={() => onSelect(r)}>
          <span className="search-result-platform">{r.platforms?.label}</span>
          <span className="search-result-title">[{r.number}] {r.title}</span>
          {r.subtitle && <span className="search-result-sub">{r.subtitle}</span>}
        </div>
      ))}
    </div>
  )
}

function PlatformGroup({ platform, isOpen, activePlatformId, activeStepId, onToggle, onClickPlatform, onClickStep }) {
  const { data: steps = [] } = useSteps(isOpen ? platform.id : null)
  const isActive = activePlatformId === platform.id

  return (
    <div>
      <div className={`nav-platform-header${isActive ? ' active' : ''}`}>
        <span className="nav-platform-label" onClick={onClickPlatform}>{platform.label}</span>
        <span className={`nav-chevron${isOpen ? ' open' : ''}`} onClick={onToggle}>›</span>
      </div>

      {isOpen && (
        <div className="nav-group-steps open">
          <div
            className={`nav-item nav-sub-item${isActive && !activeStepId ? ' active' : ''}`}
            onClick={onClickPlatform}
          >
            <span>프로세스 목록</span>
          </div>
          {steps.map(step => (
            <div
              key={step.id}
              className={`nav-item nav-sub-item${activeStepId === step.id ? ' active' : ''}`}
              onClick={() => onClickStep(step.id)}
            >
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
