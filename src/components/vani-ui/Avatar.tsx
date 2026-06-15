interface Props {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = 40, className = "" }: Props) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) };
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={style}
      className={`rounded-full bg-secondary text-white flex items-center justify-center font-semibold ${className}`}
    >
      {initials(name)}
    </div>
  );
}
