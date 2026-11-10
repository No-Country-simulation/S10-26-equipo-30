import Link from "next/link";
import { backLinkClass, formCardClass, formShellClass } from "@/components/form-styles";

export default function RecordatoriosBajaPage() {
  return (
    <main className={formShellClass}>
      <div className={formCardClass}>
        <h1 className="mb-2 text-[1.25rem] font-semibold">Listo, no te vamos a mandar más recordatorios</h1>
        <p className="mb-6 text-[0.92rem] leading-normal text-nc-muted">
          Si más adelante querés terminar tu desafío, podés retomarlo desde Cargar proyecto mientras el
          borrador siga guardado.
        </p>
        <Link href="/" className={backLinkClass}>
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
