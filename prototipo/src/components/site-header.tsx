import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AuthControls } from "@/components/auth-controls";
import { SiteNav } from "@/components/site-nav";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getAuthUser } from "@/lib/supabase/server";

export async function SiteHeader() {
  await connection();
  const supabaseEnabled = isSupabaseConfigured();
  const user = supabaseEnabled ? await getAuthUser() : null;

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-nc-border bg-[#070b12]/85 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3.5 py-3 md:max-w-[1120px] md:grid-cols-[1fr_auto_1fr] md:px-6 md:py-3.5">
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
        <SiteNav />
        <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 justify-self-end md:col-start-3">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent text-[0.85rem] text-nc-muted"
            aria-label="Idioma: español"
          >
            <GlobeIcon />
            ES
          </button>
          <AuthControls user={user} supabaseEnabled={supabaseEnabled} />
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
