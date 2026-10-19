import Link from "next/link";

const navItems = [
  { href: "#", label: "Simulación Laboral", active: false },
  { href: "/", label: "Cargar Proyecto", active: true },
  { href: "#", label: "Mis Proyectos", active: false },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          <span className="logo-no">No</span>
          <span className="logo-country">Country</span>
        </Link>
        <nav className="site-nav" aria-label="Principal">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.active ? "site-nav-link is-active" : "site-nav-link"}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <button type="button" className="lang-btn" aria-label="Idioma: español">
            <GlobeIcon />
            ES
          </button>
          <div className="avatar" aria-hidden />
        </div>
      </div>
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  );
}
