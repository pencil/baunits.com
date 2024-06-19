import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tooltip: string;
};
export default function TextTooltip({ children, tooltip }: Props) {
  return (
    <button className="group relative inline-block">
      {children}
      {tooltip ? (
        <span className="text-xs invisible group-hover:visible group-focus:visible opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition bg-slate-200 dark:bg-slate-600 dark:text-white p-1 rounded absolute top-full mt-2 whitespace-nowrap z-10 -translate-x-1/2 left-1/2">
          {tooltip}
        </span>
      ) : null}
    </button>
  );
}
