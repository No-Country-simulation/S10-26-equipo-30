import { FormCard } from "@/components/form-card";
import { FlowModeChoices } from "./flow-mode-choices";

export default function ElegirModoFormularioPage() {
  return (
    <main className="mx-auto flex min-h-0 w-full max-w-[960px] flex-1 flex-col overflow-hidden px-[1.15rem] pt-[0.7rem] pb-[0.8rem]">
      <FormCard variant="fit" backHref="/cargar-proyecto" hideContinue>
        <header className="mb-[0.55rem] shrink-0">
          <p className="mb-[0.35rem] text-xs tracking-[0.08em] text-nc-muted uppercase">
            Antes de empezar
          </p>
          <h1 className="mb-[0.2rem] text-[1.25rem] font-bold tracking-[-0.02em]">
            ¿Cómo querés cargar el proyecto?
          </h1>
          <p className="max-w-[52ch] text-[0.82rem] leading-[1.35] text-nc-muted max-[720px]:hidden">
            Elegí el flujo que vas a testear. Podés volver atrás y cambiar de modelo en cualquier
            momento antes de enviar.
          </p>
        </header>
        <FlowModeChoices />
      </FormCard>
    </main>
  );
}
