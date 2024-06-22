import type { ReactNode } from "react";

export interface LabelProps {
  children?: ReactNode;
  label?: string;
  className?: string;
  twStyle?: string;
}

export default function Label({
  children,
  label,
  className,
  twStyle,
}: LabelProps) {
  return (
    <div className={className}>
      <label
        className={`mb-2 flex flex-col items-start text-xs font-medium uppercase text-[#AAAAAA] ${twStyle}`}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
