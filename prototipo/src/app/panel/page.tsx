import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { ResearchPanel } from "@/components/research-panel/research-panel";
import { getAuthUser } from "@/lib/supabase/server";

export default function PanelPage() {
  return (
    <main className="page-shell rp-page">
      <Suspense fallback={<p className="rp-lead">Cargando los datos de las pruebas…</p>}>
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
  // El panel es solo para el equipo de research; los testers vuelven al inicio.
  if (!user.isResearcher) {
    redirect("/");
  }
  return <ResearchPanel />;
}
