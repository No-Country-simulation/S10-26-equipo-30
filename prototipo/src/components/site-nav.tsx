"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Simulación Laboral" },
  { href: "/cargar-proyecto", label: "Cargar Proyecto" },
  { href: "/mis-proyectos", label: "Mis Proyectos" },
];

export function SiteNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/cargar-proyecto") {
      return pathname === "/cargar-proyecto" || pathname.startsWith("/cargar-proyecto/");
    }
    if (href === "/mis-proyectos") {
      return pathname === "/mis-proyectos" || pathname.startsWith("/mis-proyectos/");
    }
    return pathname === href;
  }

  return (
    <nav
      className="col-span-2 row-start-2 flex min-w-0 justify-between gap-2 md:col-span-1 md:col-start-2 md:row-start-1 md:justify-center md:gap-7"
      aria-label="Principal"
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={
              active
                ? "shrink pb-[0.15rem] text-[clamp(0.7rem,3.5vw,0.85rem)] whitespace-nowrap text-nc-cyan shadow-[inset_0_-2px_0_#22d3ee] md:text-[0.9rem]"
                : "shrink text-[clamp(0.7rem,3.5vw,0.85rem)] whitespace-nowrap text-nc-muted transition-colors hover:text-slate-100 md:text-[0.9rem]"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
