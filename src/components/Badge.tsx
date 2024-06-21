import React, { type CSSProperties } from "react";

export type BadgeProps = {
  label?: string;
  style?: CSSProperties;
};

export default function Badge({
  label,
  style = {
    backgroundColor: "black",
    color: "white",
    borderColor: "white",
  },
}: BadgeProps) {
  return (
    <div
      className="flex w-fit flex-row items-center justify-center rounded-[4px] border px-[10px] py-[2px] text-xs"
      style={style}
    >
      <span>{label}</span>
    </div>
  );
}
