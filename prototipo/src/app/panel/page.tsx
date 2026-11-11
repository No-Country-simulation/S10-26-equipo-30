import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ResearchPanel } from "@/components/research-panel/research-panel";
import { getAuthUser } from "@/lib/supabase/server";

export default function PanelPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-[1_0_auto] px-5 pt-5 pb-12">
      <Suspense
        fallback={<p className="leading-normal text-nc-muted">Cargando los datos de las pruebas…</p>}
      >
        <PanelGate />
      </Suspense>
    </main>
  );
}

async function PanelGate() {
  await connection();
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/panel");
  }
  // El panel es solo para el equipo de research; marketing va a su lista de leads
  // y los testers vuelven al inicio.
  if (!user.isResearcher) {
    redirect(user.canSeeLeads ? "/panel/leads" : "/");
  }
  return <ResearchPanel />;
}
