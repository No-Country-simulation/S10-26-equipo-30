import Link from "next/link";
import { backLinkClass, formCardClass, formShellClass } from "@/components/form-styles";

export default function RecordatoriosBajaErrorPage() {
  return (
    <main className={formShellClass}>
      <div className={formCardClass}>
        <h1 className="mb-2 text-[1.25rem] font-semibold">No pudimos procesar la baja</h1>
        <p className="mb-6 text-[0.92rem] leading-normal text-nc-muted">
          El enlace no es válido o venció. Respondé el correo que recibiste y te damos de baja a mano.
        </p>
        <Link href="/" className={backLinkClass}>
          ← Volver al inicio
        </Link>
      </div>
    </main>
  );
}
