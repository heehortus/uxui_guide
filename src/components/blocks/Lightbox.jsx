import { useEffect } from 'react'
import { IMAGE_EXT } from '../../lib/fileUtils'

export default function Lightbox({ url, ext, name, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {IMAGE_EXT.includes(ext)
          ? <img src={url} alt={name} className="lightbox-img" />
          : <video src={url} controls autoPlay className="lightbox-video" />
        }
        {name && <div className="lightbox-name">{name}</div>}
      </div>
    </div>
  )
}
