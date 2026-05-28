import { useEffect, useState } from 'react'
import { IMAGE_EXT } from '../../lib/fileUtils'

export default function Lightbox({ items, index: initialIndex, onClose }) {
  const [idx, setIdx] = useState(initialIndex)
  const total = items.length
  const { url, ext, name } = items[idx]

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + total) % total) }
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % total) }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (total > 1 && e.key === 'ArrowLeft') setIdx(i => (i - 1 + total) % total)
      if (total > 1 && e.key === 'ArrowRight') setIdx(i => (i + 1) % total)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, total])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      {total > 1 && (
        <button className="lightbox-nav lightbox-prev" onClick={prev} aria-label="이전">&#8249;</button>
      )}
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {IMAGE_EXT.includes(ext)
          ? <img src={url} alt={name} className="lightbox-img" />
          : <video src={url} controls autoPlay className="lightbox-video" />
        }
        {name && (
          <div className="lightbox-name">
            {name}
            {total > 1 && <span className="lightbox-counter"> ({idx + 1} / {total})</span>}
          </div>
        )}
      </div>
      {total > 1 && (
        <button className="lightbox-nav lightbox-next" onClick={next} aria-label="다음">&#8250;</button>
      )}
    </div>
  )
}
