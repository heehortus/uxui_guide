import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePlatforms } from '../../hooks/usePlatforms'
import { useSteps, useSearchSteps } from '../../hooks/useSteps'
import PlatformModal from '../modals/PlatformModal'
import ArrowIcon from '../ui/ArrowIcon'

export default function Sidebar() {
  const { platformSlug, stepNumber } = useParams()
  const navigate = useNavigate()
  const { data: platforms = [] } = usePlatforms()
  const [openGroups, setOpenGroups] = useState(new Set([platformSlug].filter(Boolean)))
  const [addPlatform, setAddPlatform] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
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

  function handleNavPlatform(pslug) {
    setOpenGroups(new Set([pslug]))
    navigate(`/${pslug}`)
  }

  function handleSelectResult(result) {
    clearSearch()
    const pslug = result.platforms?.slug || result.platform_id
    setOpenGroups(new Set([pslug]))
    navigate(`/${pslug}/${result.number}`)
  }

  function handleGoHome() {
    setOpenGroups(new Set())
    navigate('/')
  }

  const showSearch = debouncedQuery.trim().length > 0

  return (
    <>
      <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div
              className="sidebar-logo"
              onClick={handleGoHome}
              style={{ cursor: 'pointer', flex: 1, minWidth: 0 }}
              title="홈으로"
            >
              <div className="sidebar-title">UXUI 개발 가이드</div>
              <div className="sidebar-subtitle">알파 브라더스/ABBG UXUI팀 문서</div>
            </div>
          )}
          <button
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            <ArrowIcon direction={collapsed ? 'right' : 'left'} size={16} />
          </button>
        </div>

        {!collapsed && (
          <>

            <nav className="sidebar-nav">
              {/* 검색 */}
              <div className="sidebar-search-wrap">
                <div className="sidebar-search-box">
                  <span className="sidebar-search-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="16.5" y1="16.5" x2="22" y2="22" />
                    </svg>
                  </span>
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
                    className={`nav-item${!platformSlug ? ' active' : ''}`}
                    onClick={() => { setOpenGroups(new Set()); navigate('/') }}
                  >
                    <span>홈</span>
                  </div>
                  {/* 플랫폼 그룹 */}
                  {platforms.map(p => {
                    const pslug = p.slug || p.id
                    return (
                      <PlatformGroup
                        key={p.id}
                        platform={p}
                        isOpen={openGroups.has(pslug)}
                        activePlatformSlug={platformSlug}
                        activeStepNumber={stepNumber}
                        onToggle={() => toggleGroup(pslug)}
                        onClickPlatform={() => handleNavPlatform(pslug)}
                        onClickStep={(num) => navigate(`/${pslug}/${num}`)}
                      />
                    )
                  })}
                </>
              )}
            </nav>

            <div className="sidebar-footer">
              Design &amp; Development By. Heehortus
            </div>
          </>
        )}
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
          {r.matchedLinkName && <span className="search-result-link">{r.matchedLinkName}</span>}
        </div>
      ))}
    </div>
  )
}

function PlatformGroup({ platform, isOpen, activePlatformSlug, activeStepNumber, onToggle, onClickPlatform, onClickStep }) {
  const { data: steps = [] } = useSteps(isOpen ? platform.id : null)
  const isActive = activePlatformSlug === (platform.slug || platform.id)

  return (
    <div>
      <div className={`nav-platform-header${isActive ? ' active' : ''}`} onClick={onClickPlatform}>
        <span className="nav-platform-label">{platform.label}</span>
        <span className={`nav-chevron${isOpen ? ' open' : ''}`} onClick={e => { e.stopPropagation(); onToggle() }}>
          <ArrowIcon direction="right" size={14} />
        </span>
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
              className={`nav-item nav-sub-item${activeStepNumber === step.number ? ' active' : ''}`}
              onClick={() => onClickStep(step.number)}
            >
              <span>{step.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
