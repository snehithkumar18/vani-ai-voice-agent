import type { CSSProperties } from "react";

interface Props {
  html: string;
  className?: string;
  style?: CSSProperties;
}

export function HtmlPage({ html, className, style }: Props) {
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
