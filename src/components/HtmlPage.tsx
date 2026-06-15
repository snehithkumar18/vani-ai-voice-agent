interface Props {
  html: string;
  className?: string;
}

export function HtmlPage({ html, className }: Props) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
