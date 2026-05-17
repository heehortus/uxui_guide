import { useState } from 'react'
import { LiveProvider, LivePreview, LiveEditor, LiveError } from 'react-live'
import ReactLiveScope from './ReactLiveScope'

export default function CodeBlock({ content }) {
  const [preview, setPreview] = useState(false)

  // 코드가 // live 주석으로 시작하면 미리보기 탭을 기본으로 표시
  const isLive = content?.trimStart().startsWith('// live') || content?.trimStart().startsWith('/* live */')
  // noInline 모드: // noInline 주석이 있으면 render()를 직접 호출하는 방식
  const noInline = content?.includes('// noInline') || content?.includes('/* noInline */')

  return (
    <div className="code-block-wrapper">
      <div className="code-block-toolbar">
        <button
          className={`code-tab-btn${!preview ? ' active' : ''}`}
          onClick={() => setPreview(false)}
        >
          코드
        </button>
        <button
          className={`code-tab-btn${preview ? ' active' : ''}`}
          onClick={() => setPreview(true)}
        >
          미리보기
        </button>
      </div>

      {preview ? (
        <LiveProvider code={content} scope={ReactLiveScope} noInline={noInline}>
          <div className="live-preview-box">
            <LivePreview />
          </div>
          <LiveError className="live-error" />
        </LiveProvider>
      ) : (
        <pre className="code-block-pre"><code>{content}</code></pre>
      )}
    </div>
  )
}
