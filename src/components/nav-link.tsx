"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
};

export default function NavLink({
  href,
  exact,
  className,
  activeClassName,
  children,
}: Props) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={`${className ?? ""} ${isActive ? activeClassName ?? "" : ""}`.trim()}>
      {children}
    </Link>
  );
}
