"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/simulation", label: "Simulación Laboral" },
  { href: "/", label: "Cargar Proyecto" },
  { href: "#", label: "Mis Proyectos", disabled: true as const },
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
    return pathname === href;
  }

  return (
    <nav className="site-nav" aria-label="Principal">
      {navItems.map((item) =>
        "disabled" in item && item.disabled ? (
          <span key={item.label} className="site-nav-link site-nav-link--disabled">
            {item.label}
          </span>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            className={isActive(item.href) ? "site-nav-link is-active" : "site-nav-link"}
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  );
}
