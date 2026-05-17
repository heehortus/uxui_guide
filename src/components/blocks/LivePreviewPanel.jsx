import { useRef, useEffect } from 'react'
import { LiveProvider, LivePreview, LiveError } from 'react-live'
import ReactLiveScope from './ReactLiveScope'

// // react 또는 // noInline 주석이 있으면 React 모드
function isReactCode(code) {
  const trimmed = (code || '').trimStart()
  return trimmed.startsWith('// react') || trimmed.startsWith('// noInline') || trimmed.startsWith('/* noInline */')
}

function IframePreview({ code }) {
  const ref = useRef(null)

  useEffect(() => {
    const iframe = ref.current
    if (!iframe) return
    function resize() {
      try {
        const h = iframe.contentDocument?.documentElement?.scrollHeight
        if (h) iframe.style.height = h + 'px'
      } catch {}
    }
    iframe.addEventListener('load', resize)
    return () => iframe.removeEventListener('load', resize)
  }, [code])

  return (
    <iframe
      ref={ref}
      className="live-preview-iframe"
      srcDoc={code}
      sandbox="allow-scripts allow-same-origin"
      title="미리보기"
    />
  )
}

export default function LivePreviewPanel({ code, style }) {
  if (!code?.trim()) return null

  if (isReactCode(code)) {
    const noInline = code.includes('// noInline') || code.includes('/* noInline */')
    return (
      <div style={style}>
        <LiveProvider code={code} scope={ReactLiveScope} noInline={noInline}>
          <div className="live-preview-box">
            <LivePreview />
          </div>
          <LiveError className="live-error" />
        </LiveProvider>
      </div>
    )
  }

  return (
    <div className="live-preview-box" style={{ padding: 0, ...style }}>
      <IframePreview code={code} />
    </div>
  )
}
