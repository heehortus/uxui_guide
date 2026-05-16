import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

const TOOLBAR = [
  { cmd: 'toggleBold',          icon: 'B',  title: '굵게',      style: { fontWeight: 700 } },
  { cmd: 'toggleItalic',        icon: 'I',  title: '이탤릭',    style: { fontStyle: 'italic' } },
  { cmd: 'toggleUnderline',     icon: 'U',  title: '밑줄',      style: { textDecoration: 'underline' } },
  { cmd: 'toggleStrike',        icon: 'S',  title: '취소선',    style: { textDecoration: 'line-through' } },
  { sep: true },
  { cmd: 'toggleBulletList',    icon: '≡',  title: '글머리 기호' },
  { cmd: 'toggleOrderedList',   icon: '1.', title: '번호 목록' },
  { sep: true },
  { cmd: 'toggleBlockquote',    icon: '❝',  title: '인용' },
]

function isActive(editor, cmd) {
  if (!editor) return false
  const map = {
    toggleBold: 'bold', toggleItalic: 'italic', toggleUnderline: 'underline',
    toggleStrike: 'strike', toggleBulletList: 'bulletList',
    toggleOrderedList: 'orderedList', toggleBlockquote: 'blockquote',
  }
  return editor.isActive(map[cmd] ?? '')
}

export default function RichEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
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

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        {TOOLBAR.map((btn, i) =>
          btn.sep
            ? <span key={i} className="rich-toolbar-sep" />
            : (
              <button
                key={i}
                type="button"
                title={btn.title}
                style={btn.style}
                className={`rich-toolbar-btn${isActive(editor, btn.cmd) ? ' active' : ''}`}
                onMouseDown={e => {
                  e.preventDefault()
                  editor?.chain().focus()[btn.cmd]().run()
                }}
              >
                {btn.icon}
              </button>
            )
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
