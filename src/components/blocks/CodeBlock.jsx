export default function CodeBlock({ content }) {
  return (
    <div className="code-block-wrapper">
      <pre className="code-block-pre"><code>{content}</code></pre>
    </div>
  )
}
