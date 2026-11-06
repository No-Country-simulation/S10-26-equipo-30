import { formShellScrollClass } from "@/components/form-styles";
import { ProjectDetailsForm } from "./project-details-form";

export default function DetallesPage() {
  return (
    <main className={formShellScrollClass}>
      <ProjectDetailsForm />
    </main>
  );
}
