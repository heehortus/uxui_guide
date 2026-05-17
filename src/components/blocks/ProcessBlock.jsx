export default function ProcessBlock({ content }) {
  const lines = (content || '').split('\n').filter(l => l.trim())
  return (
    <div className="process-steps">
      {lines.map((line, i) => {
        const [title, desc] = line.split('|')
        const descText = desc ? desc.trim().replace(/\\n/g, '\n') : ''
        return (
          <div key={i} className="process-step">
            <div className="process-num">{i + 1}</div>
            <div className="process-text">
              <strong>{title?.trim()}</strong>
              {descText && <>{descText.split('\n').map((l, j) => <span key={j}><br />{l}</span>)}</>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
