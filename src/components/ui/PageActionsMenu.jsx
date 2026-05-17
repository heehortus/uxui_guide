import { useState } from 'react'

function DotsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      {[4, 10, 16].map(cy => [7.5, 12.5].map(cx => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.25} />
      )))}
    </svg>
  )
}

/**
 * actions: [{ label, onClick, danger }]
 * 데스크탑: 버튼 나열 / 모바일: DotsIcon → 액션 시트
 */
export default function PageActionsMenu({ actions }) {
  const [open, setOpen] = useState(false)

  function run(fn) {
    setOpen(false)
    fn()
  }

  return (
    <>
      {/* 데스크탑 버튼 */}
      <div className="page-actions-desktop">
        {actions.map(a => (
          <button
            key={a.label}
            className={`btn btn-sm ${a.danger ? 'btn-danger' : 'btn-secondary'}`}
            onClick={a.onClick}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* 모바일 DotsIcon */}
      <button className="page-actions-mobile-btn" onClick={() => setOpen(true)}>
        <DotsIcon />
      </button>

      {/* 모바일 액션 시트 */}
      {open && (
        <div className="block-action-sheet-overlay" onClick={() => setOpen(false)}>
          <div className="block-action-sheet" onClick={e => e.stopPropagation()}>
            <div className="block-action-sheet-handle" />
            {actions.map(a => (
              <button
                key={a.label}
                className={`block-action-sheet-item${a.danger ? ' block-action-sheet-item--danger' : ''}`}
                onClick={() => run(a.onClick)}
              >
                {a.label}
              </button>
            ))}
            <button className="block-action-sheet-item block-action-sheet-item--cancel" onClick={() => setOpen(false)}>
              취소
            </button>
          </div>
        </div>
      )}
    </>
  )
}
