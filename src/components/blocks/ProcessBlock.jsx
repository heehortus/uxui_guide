export default function ProcessBlock({ content }) {
  const lines = (content || '').split('\n').filter(l => l.trim())
  return (
    <div className="process-steps">
      {lines.map((line, i) => {
        const [title, desc] = line.split('|')
        return (
          <div key={i} className="process-step">
            <div className="process-num">{i + 1}</div>
            <div className="process-text">
              <strong>{title?.trim()}</strong>
              {desc && <><br />{desc.trim()}</>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
