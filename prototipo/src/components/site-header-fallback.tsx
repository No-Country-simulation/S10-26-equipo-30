import Image from "next/image";
import Link from "next/link";

export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-nc-border bg-[#070b12]/85 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3.5 py-3 md:grid-cols-[1fr_auto_1fr] md:px-6 md:py-3.5">
        <Link
          href="/"
          className="col-start-1 row-start-1 inline-flex items-center justify-self-start"
          aria-label="NoCountry"
        >
          <Image
            src="/nocountry-logo.png"
            alt="NoCountry"
            width={1229}
            height={207}
            className="block h-6 w-auto"
            priority
          />
        </Link>
        <div className="col-start-2 flex justify-end md:col-start-3" aria-hidden />
      </div>
    </header>
  );
}
