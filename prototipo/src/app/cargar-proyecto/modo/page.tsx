import { FormCard } from "@/components/form-card";
import { formShellClass } from "@/components/form-styles";
import { remainingSeconds } from "@/lib/guided-steps";
import { FlowModeChoices } from "./flow-mode-choices";

const estimatedMinutes = Math.round(remainingSeconds(0) / 60);

export default function ElegirModoFormularioPage() {
  return (
    <main className={formShellClass}>
      <FormCard backHref="/cargar-proyecto" hideContinue>
        <header className="mb-5">
          <p className="mb-[0.35rem] text-xs tracking-[0.08em] text-nc-muted uppercase">
            Antes de empezar
          </p>
          <h1 className="mb-1 text-[1.35rem] font-bold tracking-[-0.02em]">
            ¿Cómo querés cargar el proyecto?
          </h1>
          <p className="max-w-[60ch] text-[0.88rem] leading-[1.45] text-nc-muted">
            Las dos opciones piden la misma información y te llevan unos {estimatedMinutes} minutos.
            Elegí la que te resulte más cómoda; podés volver atrás y cambiar antes de enviar.
          </p>
        </header>
        <FlowModeChoices />
      </FormCard>
    </main>
  );
}
