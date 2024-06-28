"use client";
import classNames from "@/helpers/classNames";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TabBar = ({ children }: { children: React.ReactNode }) => (
  <ul className="flex gap-x-2 items-center">{children}</ul>
);

const Tab = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  return (
    <li>
      <Link
        href={href}
        className={classNames(
          "p-2 rounded-md text-sm text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer",
          pathname === href ? "bg-slate-50 dark:bg-slate-700" : ""
        )}
      >
        {children}
      </Link>
    </li>
  );
};

export { TabBar, Tab };
