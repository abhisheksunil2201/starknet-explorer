import React, { type Dispatch, type SetStateAction } from "react";
import { cn } from "~/lib/utils";

interface FilterProps {
  setFilterState: Dispatch<SetStateAction<string>>;
  filterState: string;
}

const filterStates = [
  { value: "ALL", label: "All" },
  { value: "DECLARE", label: "declare" },
  { value: "DEPLOY", label: "deploy" },
  { value: "DEPLOY_ACCOUNT", label: "deploy_account" },
  { value: "INVOKE", label: "invoke" },
  { value: "L1_HANDLER", label: "l1_handler" },
];

export default function Filter({ filterState, setFilterState }: FilterProps) {
  return (
    <div className="mb-8 flex overflow-auto">
      {filterStates.map((state, index) => (
        <button
          onClick={() => {
            setFilterState(state.value);
          }}
          key={state.value}
          className={cn([
            "inline-flex h-9 items-center justify-center whitespace-nowrap border border-[#4B4B4B] px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-[#383838] focus-visible:outline-none  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            index === filterStates.length - 1 ? "border-l-1" : "border-r-0",
            filterState === state.value ? "bg-[#4B4B4B]" : "",
          ])}
        >
          {state.label}
        </button>
      ))}
    </div>
  );
}
