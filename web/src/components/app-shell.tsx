"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/brand";
import { routes } from "@/lib/routes";

const links = [
  { href: routes.today, label: "급식" },
  { href: routes.explore, label: "둘러보기" },
  { href: routes.schools, label: "학교" },
  { href: routes.me, label: "프로필" },
];

export function AppShell({
  children,
  schoolName,
  level,
}: {
  children: React.ReactNode;
  schoolName?: string | null;
  level?: number;
}) {
  const pathname = usePathname();

  return (
    <div className="app-frame">
      <header className="app-header">
        <Link href={routes.home} className="brand">
          {APP_NAME}
        </Link>
        <div className="header-meta">
          {schoolName ? <span className="school-chip">{schoolName}</span> : null}
          {typeof level === "number" ? (
            <span className="level-chip">Lv.{level}</span>
          ) : null}
        </div>
      </header>

      <main className="app-main">{children}</main>

      <nav className="bottom-nav bottom-nav-4" aria-label="주요 메뉴">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "nav-item active" : "nav-item"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
