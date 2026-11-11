import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SubmissionReviewDetailView } from "@/components/review-queue/submission-review-detail-view";
import { getAuthUser } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ submissionId: string }>;
};

export default function SubmissionReviewDetailPage({ params }: PageProps) {
  return (
    <main className="mx-auto w-full max-w-[1180px] flex-[1_0_auto] px-5 pt-5 pb-12">
      <Suspense fallback={<p className="leading-normal text-nc-muted">Cargando el proyecto…</p>}>
        <DetailGate params={params} />
      </Suspense>
    </main>
  );
}

async function DetailGate({ params }: { params: Promise<{ submissionId: string }> }) {
  await connection();
  const user = await getAuthUser();
  if (!user) {
    redirect("/login?next=/panel/revision");
  }
  if (!user.isResearcher) {
    redirect(user.canSeeLeads ? "/panel/leads" : "/");
  }
  const { submissionId } = await params;
  return <SubmissionReviewDetailView submissionId={submissionId} />;
}
