import { CompanyForm } from "./company-form";

export default function CompaniaPage() {
  return (
    <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col justify-center-safe px-6 pt-4 pb-5 md:px-8 md:pt-5 md:pb-6">
      <CompanyForm />
    </main>
  );
}
