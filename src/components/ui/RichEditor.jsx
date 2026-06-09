import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'

const HIGHLIGHT_COLORS = [
  { color: '#FFF176', label: '노란색' },
  { color: '#A5D6A7', label: '초록색' },
  { color: '#90CAF9', label: '파란색' },
  { color: '#F48FB1', label: '분홍색' },
  { color: '#FFCC80', label: '주황색' },
]

const TEXT_COLORS = [
  { color: null,      label: '기본' },
  { color: '#d32f2f', label: '빨간색' },
  { color: '#1565C0', label: '파란색' },
  { color: '#2E7D32', label: '초록색' },
  { color: '#6A1B9A', label: '보라색' },
  { color: '#E65100', label: '주황색' },
]

function HighlightPicker({ editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function onOut(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  const isActive = editor?.isActive('highlight')

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        title="하이라이트"
        className={`rich-toolbar-btn${isActive ? ' active' : ''}`}
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
        style={{ fontSize: 13 }}
      >
        <span style={{ background: '#FFF176', padding: '0 3px', borderRadius: 2 }}>A</span>
      </button>
      {open && (
        <div className="rich-color-picker">
          <div className="rich-color-picker-label">하이라이트</div>
          <div className="rich-color-swatches">
            <button
              type="button"
              className="rich-color-swatch rich-color-swatch--none"
              title="제거"
              onMouseDown={e => {
                e.preventDefault()
                editor?.chain().focus().unsetHighlight().run()
                setOpen(false)
              }}
            >✕</button>
            {HIGHLIGHT_COLORS.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                className="rich-color-swatch"
                title={label}
                style={{ background: color }}
                onMouseDown={e => {
                  e.preventDefault()
                  editor?.chain().focus().setHighlight({ color }).run()
                  setOpen(false)
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ColorPicker({ editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function onOut(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onOut)
    return () => document.removeEventListener('mousedown', onOut)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        title="글자 색상"
        className="rich-toolbar-btn"
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o) }}
        style={{ fontSize: 13 }}
      >
        <span style={{ borderBottom: `3px solid ${editor?.getAttributes('textStyle').color || '#0c0a08'}`, paddingBottom: 1 }}>A</span>
      </button>
      {open && (
        <div className="rich-color-picker">
          <div className="rich-color-picker-label">글자 색상</div>
          <div className="rich-color-swatches">
            {TEXT_COLORS.map(({ color, label }) => (
              <button
                key={label}
                type="button"
                className={`rich-color-swatch${!color ? ' rich-color-swatch--none' : ''}`}
                title={label}
                style={color ? { background: color } : {}}
                onMouseDown={e => {
                  e.preventDefault()
                  if (color) editor?.chain().focus().setColor(color).run()
                  else editor?.chain().focus().unsetColor().run()
                  setOpen(false)
                }}
              >
                {!color && '기본'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LinkButton({ editor }) {
  const isActive = editor?.isActive('link')

  function handleLink() {
    if (isActive) {
      editor?.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('링크 URL을 입력하세요:', 'https://')
    if (!url) return
    editor?.chain().focus().setLink({ href: url, target: '_blank' }).run()
  }

  return (
    <button
      type="button"
      title={isActive ? '링크 제거' : '링크 삽입'}
      className={`rich-toolbar-btn${isActive ? ' active' : ''}`}
      onMouseDown={e => { e.preventDefault(); handleLink() }}
      style={{ fontSize: 13 }}
    >
      🔗
    </button>
  )
}

const TOOLBAR = [
  { cmd: 'toggleBold',        icon: 'B',  title: '굵게',    style: { fontWeight: 700 } },
  { cmd: 'toggleItalic',      icon: 'I',  title: '이탤릭',  style: { fontStyle: 'italic' } },
  { cmd: 'toggleUnderline',   icon: 'U',  title: '밑줄',    style: { textDecoration: 'underline' } },
  { cmd: 'toggleStrike',      icon: 'S',  title: '취소선',  style: { textDecoration: 'line-through' } },
  { cmd: 'toggleCode',        icon: '<>', title: '인라인 코드' },
  { sep: true },
  { special: 'highlight' },
  { special: 'color' },
  { sep: true },
  { cmd: 'toggleHeading2',    icon: 'H2', title: '제목 2', style: { fontSize: 11, fontWeight: 700 } },
  { cmd: 'toggleHeading3',    icon: 'H3', title: '제목 3', style: { fontSize: 11, fontWeight: 700 } },
  { sep: true },
  { cmd: 'toggleBulletList',  icon: '≡',  title: '글머리 기호' },
  { cmd: 'toggleOrderedList', icon: '1.', title: '번호 목록' },
  { sep: true },
  { cmd: 'toggleBlockquote',  icon: '❝',  title: '인용' },
  { special: 'link' },
]

function isActive(editor, cmd) {
  if (!editor) return false
  const map = {
    toggleBold: 'bold', toggleItalic: 'italic', toggleUnderline: 'underline',
    toggleStrike: 'strike', toggleCode: 'code',
    toggleBulletList: 'bulletList', toggleOrderedList: 'orderedList',
    toggleBlockquote: 'blockquote',
    toggleHeading2: ['heading', { level: 2 }],
    toggleHeading3: ['heading', { level: 3 }],
  }
  const v = map[cmd]
  if (!v) return false
  return Array.isArray(v) ? editor.isActive(...v) : editor.isActive(v)
}

function runCmd(editor, cmd) {
  if (!editor) return
  const chain = editor.chain().focus()
  if (cmd === 'toggleHeading2') return chain.toggleHeading({ level: 2 }).run()
  if (cmd === 'toggleHeading3') return chain.toggleHeading({ level: 3 }).run()
  return chain[cmd]().run()
}

export default function RichEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: placeholder || '내용을 입력하세요.' }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'rich-editor-content' },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== (value || '')) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {TOOLBAR.map((btn, i) => {
          if (btn.sep) return <span key={i} className="rich-toolbar-sep" />
          if (btn.special === 'highlight') return <HighlightPicker key={i} editor={editor} />
          if (btn.special === 'color')     return <ColorPicker key={i} editor={editor} />
          if (btn.special === 'link')      return <LinkButton key={i} editor={editor} />
          return (
            <button
              key={i}
              type="button"
              title={btn.title}
              style={btn.style}
              className={`rich-toolbar-btn${isActive(editor, btn.cmd) ? ' active' : ''}`}
              onMouseDown={e => { e.preventDefault(); runCmd(editor, btn.cmd) }}
            >
              {btn.icon}
            </button>
          )
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
