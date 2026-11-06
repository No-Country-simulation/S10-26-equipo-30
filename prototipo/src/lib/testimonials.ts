export type ClientTestimonial = {
  quote: string;
  name: string;
  role: string;
  org: string;
  place: string;
  date: string;
  /** Ruta en `/public` (ej. `/JorgeCoboAvatar.jpg`). */
  avatarSrc: string;
};

/** Extraídos de nocountry.tech / validación de producto. */
export const clientTestimonials: ClientTestimonial[] = [
  {
    quote:
      "Nos permitió validar múltiples enfoques técnicos sin comprometer recursos. Los equipos entregaron soluciones funcionales que superaron nuestras expectativas.",
    name: "Jorge Cobo",
    role: "Founder",
    org: "Viamatica",
    place: "Ecuador",
    date: "Agosto 2025",
    avatarSrc: "/JorgeCoboAvatar.jpg",
  },
  {
    quote:
      "En 5 semanas obtuvimos 3 prototipos funcionales y claridad sobre el camino técnico a seguir. El ahorro en tiempo y costo fue significativo.",
    name: "Ezequiel Lo Cane",
    role: "Líder",
    org: "Justina",
    place: "Argentina",
    date: "Julio 2024",
    avatarSrc: "/EzequielLoCaneAvatar.jpg",
  },
  {
    quote:
      "La calidad del talento y la velocidad de ejecución nos sorprendió. Encontramos el equipo ideal para continuar construyendo nuestra plataforma.",
    name: "Matias Santibanez",
    role: "CTO",
    org: "KlowHub",
    place: "Argentina",
    date: "Septiembre 2024",
    avatarSrc: "/MatiasSantibanezAvatar.jpg",
  },
  {
    quote:
      "La diversidad de propuestas nos ayudó a identificar soluciones innovadoras que no habíamos considerado. El proceso fue ágil y muy profesional.",
    name: "Eduardo Flamig",
    role: "Director",
    org: "Belgrano Real State",
    place: "Argentina",
    date: "Octubre 2024",
    avatarSrc: "/EduardoFlamingAvatar.jpg",
  },
  {
    quote:
      "Necesitábamos validar una solución blockchain rápidamente. No Country nos conectó con equipos especializados que entregaron demos funcionales en tiempo récord.",
    name: "Monica Segovia",
    role: "Founder",
    org: "IUPI",
    place: "Argentina",
    date: "Marzo 2025",
    avatarSrc: "/MonicaSegoviaAvatar.jpg",
  },
];
