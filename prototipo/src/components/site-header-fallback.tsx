import Image from "next/image";
import Link from "next/link";

export function SiteHeaderFallback() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="NoCountry">
          <Image
            src="/nocountry-logo.png"
            alt="NoCountry"
            width={1229}
            height={207}
            className="site-logo-img"
            priority
          />
        </Link>
        <div className="site-header-actions site-header-actions--placeholder" aria-hidden />
      </div>
    </header>
  );
}
