export const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
export const VIDEO_EXT = ['mp4', 'mov', 'webm', 'avi']
export const DL_ICON = {
  pdf: '📄', zip: '🗜️',
  doc: '📝', docx: '📝',
  xls: '📊', xlsx: '📊',
  ppt: '📋', pptx: '📋',
}

export function getExt(name) {
  return name?.split('.').pop()?.toLowerCase() || ''
}

export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function isMediaFile(item) {
  if (item.type !== 'file') return false
  const ext = getExt((item.text || '').split('|')[0])
  return IMAGE_EXT.includes(ext) || VIDEO_EXT.includes(ext)
}
