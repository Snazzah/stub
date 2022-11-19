export default function InlineSnippet({ children }: { children: string }) {
  return <span className="inline-block rounded-md bg-blue-100 p-1 font-mono text-blue-900">{children}</span>;
}
