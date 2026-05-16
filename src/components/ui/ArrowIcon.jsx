/**
 * 4-direction chevron arrow based on the provided SVG design.
 * Original: 30×18 viewBox, pointing up.
 * Color inherits from parent via currentColor (set stroke color via CSS).
 */
export default function ArrowIcon({ direction = 'right', size, color = 'currentColor', style, ...props }) {
  const horizontal = direction === 'left' || direction === 'right'
  const w = horizontal ? 18 : 30
  const h = horizontal ? 30 : 18

  // Scale: original stroke-width 4 on a 30-wide viewBox → keep proportional
  const paths = {
    up:    'M2.82861 14.8284L14.8286 2.82843L26.8286 14.8284',
    down:  'M2.82861 3.1716L14.8286 15.17157L26.8286 3.1716',
    right: 'M3.1716 2.82861L15.17157 14.8286L3.1716 26.8286',
    left:  'M14.8284 27.17139L2.82843 15.1714L14.8284 3.1714',
  }

  const displayW = size ? (horizontal ? size * (18 / 30) : size) : w
  const displayH = size ? (horizontal ? size : size * (18 / 30)) : h

  return (
    <svg
      width={displayW}
      height={displayH}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      {...props}
    >
      <path
        d={paths[direction]}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
      />
    </svg>
  )
}
