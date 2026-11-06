/** Clases de Tailwind compartidas por las pantallas del formulario de carga. */

export const gradientSurfaceClass =
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border-0 bg-[linear-gradient(90deg,#ec4899_0%,#8b5cf6_45%,#6366f1_100%)] font-semibold text-white shadow-[0_4px_24px_rgba(236,72,153,0.25)]";

const cardBaseClass =
  "rounded-[1.25rem] border border-nc-border bg-nc-card shadow-[0_24px_80px_rgba(0,0,0,0.35)]";

export const formCardClass = `${cardBaseClass} px-6 pt-5 pb-8`;

/** Tarjeta dentro de las pantallas de formulario: más aire en desktop. */
export const formCardShellClass = `${formCardClass} md:px-9 md:pt-7 md:pb-10`;

/** Tarjeta que ocupa el alto disponible y no scrollea (elección de modo). */
export const formCardFitClass = `${cardBaseClass} flex min-h-0 flex-1 flex-col overflow-hidden px-[0.95rem] pt-[0.7rem] pb-3`;

/** Contenedor de las pantallas de formulario cortas: la tarjeta queda centrada en el alto. */
export const formShellClass =
  "mx-auto flex w-full max-w-[960px] flex-1 flex-col justify-center-safe px-6 pt-8 pb-12 md:px-8 md:pt-10 md:pb-16";

/** Contenedor de las pantallas de formulario largas: arranca arriba y la página scrollea. */
export const formShellScrollClass =
  "mx-auto flex w-full max-w-[960px] flex-col px-6 pt-8 pb-20 md:px-8 md:pt-10 md:pb-16";

export const backLinkClass = "text-[0.9rem] text-nc-muted transition-colors hover:text-slate-100";

export const sectionHeadingClass = "mb-6 flex items-center gap-[0.65rem] text-[1.2rem] font-semibold";

export const sectionIconClass =
  "flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-base";

export const formGridClass = "flex flex-col gap-5";

export const formGrid2Class = "grid grid-cols-1 gap-5 sm:grid-cols-2";

export const fieldLabelClass = "mb-[0.45rem] block text-[0.85rem] text-nc-muted";

export const requiredMarkClass = "ml-[0.15rem] text-red-400";

export const optionalMarkClass = "font-normal text-slate-500";

const controlClass =
  "rounded-[0.65rem] border border-nc-border bg-nc-inner px-[0.85rem] py-[0.7rem] text-[0.95rem] text-slate-100 outline-none transition-[border-color,box-shadow] duration-150 focus:border-indigo-500/55 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)]";

export const fieldInputClass = `w-full ${controlClass}`;

export const fieldTextareaClass = `w-full min-h-32 resize-y leading-[1.55] ${controlClass}`;

export const phoneRowClass = "flex gap-2";

export const phoneDialClass = `w-[5.5rem] shrink-0 text-center ${controlClass}`;

export const fieldMetaClass = "mt-[0.35rem] flex justify-end text-xs text-slate-500";

export const formErrorClass =
  "mb-4 rounded-lg border border-red-400/25 bg-red-400/12 px-[0.85rem] py-[0.65rem] text-[0.85rem] text-red-200";

export const guidedTrackClass = "h-[0.45rem] overflow-hidden rounded-full bg-slate-400/16";

export const guidedFillClass =
  "h-full rounded-[inherit] bg-[linear-gradient(90deg,#ec4899_0%,#8b5cf6_45%,#6366f1_100%)] transition-[width] duration-350 ease-[ease]";
