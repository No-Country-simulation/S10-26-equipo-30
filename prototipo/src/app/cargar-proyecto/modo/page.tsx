import { FormCard } from "@/components/form-card";
import { FlowModeChoices } from "./flow-mode-choices";

export default function ElegirModoFormularioPage() {
  return (
    <main className="page-shell page-shell--wide">
      <FormCard backHref="/cargar-proyecto" hideContinue>
        <header className="flow-mode-header">
          <p className="flow-mode-eyebrow">Antes de empezar</p>
          <h1 className="flow-mode-title">¿Cómo querés cargar el proyecto?</h1>
          <p className="flow-mode-lead">
            Elegí el flujo que vas a testear. Podés volver atrás y cambiar de modelo en cualquier
            momento antes de enviar.
          </p>
        </header>
        <FlowModeChoices />
      </FormCard>
    </main>
  );
}
