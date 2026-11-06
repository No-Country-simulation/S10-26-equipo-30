"use client";

import Link from "next/link";
import type { AuthUserSummary } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import { clearResearchSession } from "@/lib/research-persistence";

type AuthControlsProps = {
  user: AuthUserSummary | null;
  supabaseEnabled: boolean;
};

export function AuthControls({ user, supabaseEnabled }: AuthControlsProps) {
  if (!supabaseEnabled) {
    return (
      <span
        className="rounded-full border border-nc-border px-2 py-0.5 text-[0.7rem] text-slate-500"
        title="Configurá Supabase en .env.local"
      >
        Auth off
      </span>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login?next=/cargar-proyecto"
        className="rounded-full border border-nc-cyan/35 px-2.5 py-1 text-[0.85rem] font-semibold text-nc-cyan transition-colors hover:border-nc-cyan/55 hover:bg-nc-cyan/10"
      >
        Iniciar sesión
      </Link>
    );
  }

  const label =
    user.fullName ||
    (user.isAnonymous ? "Invitado" : user.email.split("@")[0] || "Tester");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearResearchSession();
    // Recarga completa: Next deja montadas las páginas anteriores y seguirían creyendo que hay sesión.
    window.location.assign("/");
  }

  return (
    <div className="flex max-w-none items-center gap-2 md:max-w-48">
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          className="h-8 w-8 rounded-full border border-nc-border object-cover"
          width={32}
          height={32}
        />
      ) : (
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-nc-border bg-indigo-500/25 text-[0.85rem] font-bold"
          aria-hidden
        >
          {label.charAt(0).toUpperCase()}
        </span>
      )}
      <span
        className="hidden overflow-hidden text-[0.8rem] text-ellipsis whitespace-nowrap text-nc-muted md:inline"
        title={user.isAnonymous ? "Sesión de invitado" : user.email}
      >
        {label}
      </span>
      {user.isResearcher ? (
        <Link href="/panel" className="px-1.5 py-0.5 text-[0.75rem] font-semibold text-nc-cyan">
          Panel
        </Link>
      ) : null}
      <button
        type="button"
        className="cursor-pointer rounded-md border-0 bg-transparent px-1.5 py-0.5 text-[0.75rem] text-slate-400 hover:bg-slate-500/15 hover:text-slate-100"
        onClick={() => void signOut()}
      >
        Salir
      </button>
    </div>
  );
}
