import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

interface MarkdownViewProps {
  content: string
}

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
      skipHtml
      components={{
        h2: ({ children }) => <h2 className="mt-8 text-2xl font-semibold">{children}</h2>,
        h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold">{children}</h3>,
        p: ({ children }) => <p className="mt-4 leading-7 text-muted-foreground">{children}</p>,
        ul: ({ children }) => (
          <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-7">{children}</li>,
        a: ({ children, href }) => (
          <a className="text-primary underline" href={href} rel="noreferrer" target="_blank">
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        blockquote: ({ children }) => (
          <blockquote className="mt-4 border-l-4 pl-4 text-muted-foreground">{children}</blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">{children}</code>
        ),
        table: ({ children }) => (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">{children}</table>
          </div>
        ),
        th: ({ children }) => <th className="border px-2 py-1 text-left">{children}</th>,
        td: ({ children }) => <td className="border px-2 py-1">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
