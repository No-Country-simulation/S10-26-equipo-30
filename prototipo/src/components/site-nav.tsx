"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/simulation", label: "Simulación Laboral" },
  { href: "/", label: "Cargar Proyecto" },
  { href: "/mis-proyectos", label: "Mis Proyectos" },
];

export function SiteNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/" || pathname.startsWith("/cargar-proyecto");
    }
    if (href === "/simulation") {
      return pathname === "/simulation" || pathname.startsWith("/simulation/");
    }
    if (href === "/mis-proyectos") {
      return pathname === "/mis-proyectos" || pathname.startsWith("/mis-proyectos/");
    }
    return pathname === href;
  }

  return (
    <nav className="site-nav" aria-label="Principal">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={isActive(item.href) ? "site-nav-link is-active" : "site-nav-link"}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
