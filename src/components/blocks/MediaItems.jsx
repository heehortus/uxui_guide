import { useState } from 'react'
import { IMAGE_EXT, VIDEO_EXT, DL_ICON, getExt, formatFileSize, isMediaFile } from '../../lib/fileUtils'
import { linkifyText } from '../../lib/utils'
import Lightbox from './Lightbox'

export function MediaItems({ items }) {
  const [lightbox, setLightbox] = useState(null)
  const media = (items || []).filter(isMediaFile)
  if (!media.length) return null

  return (
    <>
      <div className="inline-media-items">
        {media.map((item, i) => {
          const [name, url] = (item.text || '').split('|').map(s => s?.trim())
          const ext = getExt(name)
          return IMAGE_EXT.includes(ext)
            ? <img key={i} src={url} alt={name} className="file-preview-img file-preview-clickable" onClick={() => setLightbox({ url, ext, name })} />
            : <video key={i} src={url} controls className="file-preview-video file-preview-clickable" onClick={() => setLightbox({ url, ext, name })} />
        })}
      </div>
      {lightbox && <Lightbox {...lightbox} onClose={() => setLightbox(null)} />}
    </>
  )
}

export function InlineItems({ items }) {
  const nonMedia = (items || []).filter(it => !isMediaFile(it))
  if (!nonMedia.length) return null

  return (
    <div className="block-inline-items">
      <div className="tiplist-items">
        {nonMedia.map((item, i) => (
          <div key={i} className={`tiplist-item type-${item.type}`}>
            {item.type === 'code'
              ? <code className="inline-code tiplist-code">{item.text}</code>
              : item.type === 'file'
              ? (() => {
                  const [name, url, sizeStr] = (item.text || '').split('|').map(s => s?.trim())
                  const ext = getExt(name)
                  return (
                    <a href={url} target="_blank" rel="noopener" download={name} className="tiplist-file">
                      <span>{DL_ICON[ext] || '📎'} {name}</span>
                      {sizeStr && <span className="file-size-hint">({formatFileSize(Number(sizeStr))})</span>}
                      <span className="file-dl">↓</span>
                    </a>
                  )
                })()
              : (() => {
                  const isHtml = /^<[a-z]/i.test((item.text || '').trimStart())
                  return <span className="tiplist-text rich-content" dangerouslySetInnerHTML={{ __html: isHtml ? item.text : linkifyText(item.text) }} />
                })()
            }
          </div>
        ))}
      </div>
    </div>
  )
}
