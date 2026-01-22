"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";

type NavLinkProps = LinkProps & {
  className?: string;
  activeClassName?: string;
};

export function NavLink({ className, activeClassName, href, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const hrefValue = typeof href === "string" ? href : href.pathname;
  const isActive = !!hrefValue && pathname === hrefValue;

  return <Link href={href} className={cn(className, isActive && activeClassName)} {...props} />;
}
