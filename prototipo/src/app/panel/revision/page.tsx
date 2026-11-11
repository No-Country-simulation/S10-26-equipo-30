import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SubmissionReviewQueueView } from "@/components/review-queue/submission-review-queue-view";
import { getAuthUser } from "@/lib/supabase/server";

export default function RevisionQueuePage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-[1_0_auto] px-5 pt-5 pb-12">
      <Suspense
        fallback={<p className="leading-normal text-nc-muted">Cargando la cola de revisión…</p>}
      >
        <RevisionGate />
      </Suspense>
    </main>
  );
}

async function RevisionGate() {
  await connection();
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/panel/revision");
  }
  if (!user.isResearcher) {
    redirect(user.canSeeLeads ? "/panel/leads" : "/");
  }
  return <SubmissionReviewQueueView />;
}
