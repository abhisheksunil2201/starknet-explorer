import { CircleHelp } from "lucide-react";
import React, { type ReactNode } from "react";

interface RowProps {
  label: string;
  children: ReactNode;
}

export default function Row({ label, children }: RowProps) {
  return (
    <>
      <div className="flex max-h-fit min-h-[38px] flex-row">
        <div className="flex w-[250px] flex-row items-center space-x-2">
          <CircleHelp width={17} height={17} />
          <span className="text-xs uppercase">{label}:</span>
        </div>
        <div className="flex h-full w-full flex-row items-center border-b-[1px]  border-[#383838]">
          {children}
        </div>
      </div>
    </>
  );
}
