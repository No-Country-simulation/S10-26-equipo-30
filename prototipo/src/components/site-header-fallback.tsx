import Link from "next/link";

export function SiteHeaderFallback() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          <span className="logo-no">No</span>
          <span className="logo-country">Country</span>
        </Link>
        <div className="site-header-actions site-header-actions--placeholder" aria-hidden />
      </div>
    </header>
  );
}
