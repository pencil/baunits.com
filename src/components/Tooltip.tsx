import classNames from "@/helpers/classNames";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tooltip?: ReactNode;
  position: "bottom" | "right" | "left";
};
export default function Tooltip({ children, tooltip, position }: Props) {
  if (!tooltip) {
    return <>{children}</>;
  }

  return (
    <div
      className="group relative inline-block cursor-pointer align-middle"
      aria-label={tooltip}
      aria-haspopup="true"
      role="button"
    >
      {children}
      {tooltip ? (
        <span
          className={classNames(
            "font-normal text-xs invisible group-hover:visible opacity-0 group-hover:opacity-100 transition bg-slate-50 dark:bg-slate-600 dark:text-white p-1 rounded absolute mt-2 whitespace-nowrap z-50 shadow-md",
            position == "bottom"
              ? "top-full -translate-x-1/2 left-1/2"
              : position == "right"
                ? "top-0 left-full ml-1"
                : position == "left"
                  ? "top-0 right-full mr-1 -translate-y-1/2"
                  : "",
          )}
          role="tooltip"
        >
          {tooltip}
        </span>
      ) : null}
    </div>
  );
}
