import { formShellClass } from "@/components/form-styles";
import { CompanyForm } from "./company-form";

export default function CompaniaPage() {
  return (
    <main className={formShellClass}>
      <CompanyForm />
    </main>
  );
}
