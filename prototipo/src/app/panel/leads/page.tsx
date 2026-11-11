import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { QualifiedLeadsView } from "@/components/leads/qualified-leads-view";
import { getAuthUser } from "@/lib/supabase/server";

export default function LeadsPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-[1_0_auto] px-5 pt-5 pb-12">
      <Suspense fallback={<p className="leading-normal text-nc-muted">Cargando los leads…</p>}>
        <LeadsGate />
      </Suspense>
    </main>
  );
}

async function LeadsGate() {
  await connection();
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/panel/leads");
  }
  // Solo marketing y el equipo de research. La base vuelve a chequear el rol en cada consulta.
  if (!user.canSeeLeads) {
    redirect("/");
  }
  return <QualifiedLeadsView showPanelLink={user.isResearcher} />;
}
