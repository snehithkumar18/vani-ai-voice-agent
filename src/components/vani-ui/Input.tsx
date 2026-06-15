import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, iconLeft, iconRight, error, className = "", containerClassName = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {iconLeft && (
          <span className="absolute inset-y-0 left-3 flex items-center text-outline pointer-events-none">
            {iconLeft}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 rounded-lg border border-border-subtle bg-white text-on-surface placeholder:text-outline focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all ${iconLeft ? "pl-11" : ""} ${iconRight ? "pr-11" : ""} ${error ? "border-error focus:border-error focus:ring-error/10" : ""} ${className}`}
          {...rest}
        />
        {iconRight && (
          <span className="absolute inset-y-0 right-3 flex items-center text-outline">
            {iconRight}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
});
