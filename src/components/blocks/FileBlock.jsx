import { useState } from 'react'
import { IMAGE_EXT, VIDEO_EXT, DL_ICON, getExt, formatFileSize } from '../../lib/fileUtils'
import Lightbox from './Lightbox'

export default function FileBlock({ content }) {
  const [lightbox, setLightbox] = useState(null)
  const rows = (content || '').split('\n').filter(l => l.trim()).map(r => {
    const [name, url, sizeStr] = r.split('|').map(s => s?.trim())
    return { name, url, sizeStr, ext: getExt(name) }
  })
  const media = rows.filter(r => IMAGE_EXT.includes(r.ext) || VIDEO_EXT.includes(r.ext))
  const files = rows.filter(r => !IMAGE_EXT.includes(r.ext) && !VIDEO_EXT.includes(r.ext))

  return (
    <>
      <div className="file-block-content">
        {media.map((r, i) =>
          IMAGE_EXT.includes(r.ext)
            ? <img key={i} src={r.url} alt={r.name} className="file-preview-img file-preview-clickable" onClick={() => setLightbox(r)} />
            : <video key={i} src={r.url} controls className="file-preview-video file-preview-clickable" onClick={() => setLightbox(r)} />
        )}
        {files.length > 0 && (
          <div className="file-list">
            {files.map((r, i) => (
              <a key={i} href={r.url} target="_blank" rel="noopener" className="file-item" download={r.name}>
                <span className="file-icon">{DL_ICON[r.ext] || '📎'}</span>
                <span className="file-name">{r.name}</span>
                {r.sizeStr && <span className="file-size">({formatFileSize(Number(r.sizeStr))})</span>}
                <span className="file-dl">↓</span>
              </a>
            ))}
          </div>
        )}
      </div>
      {lightbox && <Lightbox url={lightbox.url} ext={lightbox.ext} name={lightbox.name} onClose={() => setLightbox(null)} />}
    </>
  )
}
