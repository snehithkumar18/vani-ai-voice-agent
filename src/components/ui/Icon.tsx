interface Props {
  name: string;
  filled?: boolean;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, filled = false, weight = 400, className = "", style }: Props) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}`,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
