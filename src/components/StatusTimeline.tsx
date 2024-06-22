import { Check, Loader2 } from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

const items = [
  { label: "Received", pending: false },
  { label: "Accepted on L2", pending: false },
  { label: "Accepted on L1", pending: true },
];

const TimelineItem = ({
  label,
  pending,
  isNextLoading,
}: {
  label: string;
  pending: boolean;
  isNextLoading: boolean;
}) => (
  <>
    {!pending && (
      <>
        <div className="flex h-7 items-center gap-1 rounded-full bg-[#117D49] px-3 py-1 text-xs">
          <Check width={15} height={15} />
          {label}
        </div>
        <div
          className={cn([
            "mt-[12px] h-[2px] w-10 bg-[#117D49]",
            isNextLoading && "bg-gray-700",
          ])}
        ></div>
      </>
    )}
    {pending && (
      <>
        <div className="group flex h-7 w-7 items-center gap-1 rounded-full border-2 border-gray-700 p-1 text-xs hover:w-36">
          <Loader2 className="animate-spin text-gray-400" />
          <p className="hidden text-xs text-gray-400 group-hover:block">
            {label}
          </p>
        </div>
      </>
    )}
  </>
);

export default function StatusTimeline() {
  return (
    <div className="flex">
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          {...item}
          isNextLoading={items[index + 1]?.pending === true}
        />
      ))}
    </div>
  );
}
