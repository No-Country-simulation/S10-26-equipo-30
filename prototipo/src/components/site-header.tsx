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
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo">
          <span className="logo-no">No</span>
          <span className="logo-country">Country</span>
        </Link>
        <SiteNav />
        <div className="site-header-actions">
          <button type="button" className="lang-btn" aria-label="Idioma: español">
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
