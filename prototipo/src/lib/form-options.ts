export const organizationTypes = [
  "Empresa",
  "Institucion educativa",
  "Startup",
  "ONG",
  "Autónomo",
] as const;

export const organizationSizes = ["1 a 10", "11 a 20", "21 a 100", "+100"] as const;

export const deliverables = [
  "Ideas para resolverlo",
  "Investigación de mercado",
  "Documento explicativo",
  "Maqueta para ver la idea (prototipo)",
  "Primera versión que funciona (MVP)",
  "Todavía no lo sé",
] as const;

export const deliverableDescriptions: Record<(typeof deliverables)[number], string> = {
  "Ideas para resolverlo": "Cómo podría resolverse tu desafío, explicado en una presentación.",
  "Investigación de mercado":
    "Qué hace tu competencia, quiénes son tus clientes y qué oportunidades hay.",
  "Documento explicativo":
    "El problema, la solución propuesta y cómo llevarla adelante, por escrito.",
  "Maqueta para ver la idea (prototipo)":
    "Pantallas o un modelo que podés recorrer, aunque todavía no funcione del todo.",
  "Primera versión que funciona (MVP)":
    "Una versión simple pero usable, para probarla con personas reales.",
  "Todavía no lo sé": "Lo definimos juntos cuando validemos tu desafío.",
};

export type SelectOption = { label: string; description?: string };

/** Grupo de opciones; sin `label` se muestra sin título (por ejemplo, "No estoy seguro"). */
export type SelectOptionGroup = { label?: string; options: readonly SelectOption[] };

/** Entre paréntesis va el nombre de la vertical interna de No Country, para poder mapearla. */
export const verticalGroups: readonly SelectOptionGroup[] = [
  {
    label: "Diseño y experiencia",
    options: [
      {
        label: "Diseño de apps y sitios (Product Design)",
        description: "Cómo se ve y cómo se usa tu producto digital.",
      },
      {
        label: "Investigación con usuarios (UX Research)",
        description: "Entrevistas y pruebas para entender a tus clientes.",
      },
      {
        label: "Diseño de juegos (Game Design)",
        description: "Reglas, historia y experiencia de un juego.",
      },
    ],
  },
  {
    label: "Desarrollo",
    options: [
      {
        label: "Página o sistema web (Web App Development)",
        description: "Un sitio o plataforma que se usa desde el navegador.",
      },
      {
        label: "App para celular (Mobile Development)",
        description: "Una aplicación para Android o iPhone.",
      },
      {
        label: "Soluciones sin programar (No Code)",
        description: "Herramientas armadas sin escribir código.",
      },
      {
        label: "Prototipo rápido con IA (Vibe Coding)",
        description: "Una primera versión hecha con ayuda de inteligencia artificial.",
      },
      {
        label: "Desarrollo de videojuegos (Game Development)",
        description: "Programar un juego para que se pueda jugar.",
      },
      {
        label: "Servidores en la nube (Cloud)",
        description: "Dónde y cómo funciona tu sistema en internet.",
      },
      {
        label: "Blockchain y cripto (Web3)",
        description: "Tokens, contratos inteligentes y billeteras digitales.",
      },
      {
        label: "Gestión de clientes con Salesforce (Salesforce)",
        description: "Organizar ventas y clientes en esa plataforma.",
      },
      {
        label: "Seguridad informática (Cybersecurity)",
        description: "Proteger tus sistemas y datos de ataques.",
      },
    ],
  },
  {
    label: "Datos e inteligencia artificial",
    options: [
      {
        label: "Análisis de datos (Data Science)",
        description: "Encontrar patrones y predicciones en tu información.",
      },
      {
        label: "Reportes y tableros (Business Intelligence)",
        description: "Ver tus números de un vistazo para decidir mejor.",
      },
      {
        label: "Inteligencia artificial (AI)",
        description: "Sumar IA a tu producto o proceso.",
      },
      {
        label: "Asistentes automáticos con IA (AI Agent)",
        description: "Bots que responden o hacen tareas por su cuenta.",
      },
    ],
  },
  {
    label: "Marketing y comunicación",
    options: [
      {
        label: "Redes sociales (Social Media)",
        description: "Publicaciones y comunidad en Instagram, TikTok, etc.",
      },
      {
        label: "Contenidos (Content Marketing)",
        description: "Textos, videos o newsletters que atraen clientes.",
      },
      {
        label: "Marca e identidad (Branding)",
        description: "Nombre, logo y forma de comunicar tu negocio.",
      },
      {
        label: "Crecimiento y ventas (Growth)",
        description: "Conseguir más clientes y que vuelvan.",
      },
    ],
  },
  {
    options: [
      {
        label: "No estoy seguro",
        description: "Lo definimos juntos cuando validemos tu desafío.",
      },
    ],
  },
];

export const verticals = verticalGroups.flatMap((group) =>
  group.options.map((option) => option.label),
);

/** Entre paréntesis va el nombre del sector en la taxonomía de No Country, para poder mapearlo. */
export const businessSectorGroups: readonly SelectOptionGroup[] = [
  {
    label: "Comercio y consumo",
    options: [
      {
        label: "Comercio (Commerce)",
        description: "Negocios que venden productos o servicios: locales, distribuidoras, mayoristas.",
      },
      {
        label: "Venta online (E-commerce)",
        description: "Tiendas web, ventas por redes o catálogos digitales.",
      },
      {
        label: "Tiendas y marketplaces (Retail / Marketplaces)",
        description: "Cadenas de locales, supermercados o plataformas que reúnen vendedores.",
      },
      {
        label: "Alimentos y gastronomía (FoodTech)",
        description: "Restaurantes, bares, delivery, producción y venta de alimentos.",
      },
      {
        label: "Moda (FashionTech)",
        description: "Ropa, calzado, accesorios y diseño de indumentaria.",
      },
      {
        label: "Mascotas (PetTech)",
        description: "Veterinarias, pet shops y servicios para mascotas.",
      },
      {
        label: "Turismo y viajes (Turismo / TravelTech)",
        description: "Hoteles, agencias, alojamientos y experiencias turísticas.",
      },
    ],
  },
  {
    label: "Salud y bienestar",
    options: [
      {
        label: "Salud (HealthTech)",
        description: "Clínicas, consultorios, turnos médicos y atención de pacientes.",
      },
      {
        label: "Equipos médicos (MedTech)",
        description: "Dispositivos, instrumental y tecnología para diagnóstico o tratamiento.",
      },
      {
        label: "Biotecnología (BioTech)",
        description: "Laboratorios, investigación biológica y farmacéutica.",
      },
      {
        label: "Salud mental (Salud Mental)",
        description: "Psicología, terapia y bienestar emocional.",
      },
      {
        label: "Salud de la mujer (FemTech)",
        description: "Salud femenina, maternidad y cuidado reproductivo.",
      },
      {
        label: "Bienestar y gimnasios (Fitness / Wellness)",
        description: "Gimnasios, yoga, nutrición y hábitos saludables.",
      },
      {
        label: "Deportes (SportsTech)",
        description: "Clubes, equipos, eventos y entrenamiento deportivo.",
      },
    ],
  },
  {
    label: "Educación y trabajo",
    options: [
      {
        label: "Educación y aprendizaje (EdTech)",
        description: "Escuelas, institutos, cursos, academias y aprendizaje en línea.",
      },
      {
        label: "Educación pública (Educación Pública)",
        description: "Escuelas, colegios y universidades del Estado.",
      },
      {
        label: "Capacitación de empleados (Corporate Training / Upskilling)",
        description: "Formación interna y desarrollo de habilidades en empresas.",
      },
      {
        label: "Recursos humanos (Recursos Humanos / HRTech)",
        description: "Gestión de personal, sueldos, clima laboral y beneficios.",
      },
      {
        label: "Búsqueda de personal (Recruiting)",
        description: "Selección, entrevistas y contratación de personas.",
      },
      {
        label: "Nuevas formas de trabajo (Future of work)",
        description: "Trabajo remoto, freelance y herramientas para equipos.",
      },
    ],
  },
  {
    label: "Finanzas, seguros y legales",
    options: [
      {
        label: "Servicios financieros (Servicios Financieros)",
        description: "Estudios contables, asesoría financiera, créditos e impuestos.",
      },
      {
        label: "Bancos y cooperativas (Banca y Cooperativas)",
        description: "Entidades bancarias, mutuales y cooperativas de crédito.",
      },
      {
        label: "Pagos y finanzas digitales (Fintech)",
        description: "Billeteras virtuales, cobros online y apps financieras.",
      },
      {
        label: "Seguros (Seguros / InsurTech)",
        description: "Aseguradoras, productores y brokers de seguros.",
      },
      {
        label: "Inversiones (Inversión y Capital de Riesgo)",
        description: "Fondos de inversión, inversores y financiamiento de proyectos.",
      },
      {
        label: "Servicios legales (LegalTech)",
        description: "Estudios jurídicos, escribanías y gestión de contratos.",
      },
      {
        label: "Cumplimiento de normas (RegTech)",
        description: "Controles, auditorías y regulaciones que una organización debe cumplir.",
      },
    ],
  },
  {
    label: "Industria, construcción y logística",
    options: [
      {
        label: "Agro y campo (Agrotech)",
        description: "Producción agrícola, ganadería y agroindustria.",
      },
      {
        label: "Fábricas y producción (Manufacturing)",
        description: "Industrias, talleres y producción en planta.",
      },
      {
        label: "Construcción e inmuebles (Construcción / Real Estate)",
        description: "Constructoras, obras, arquitectura y desarrollos inmobiliarios.",
      },
      {
        label: "Inmobiliarias (PropTech)",
        description: "Compra, venta y alquiler de propiedades.",
      },
      {
        label: "Logística y distribución (Supply Chain / LogiTech)",
        description: "Depósitos, envíos, stock y cadena de abastecimiento.",
      },
      {
        label: "Transporte (Transportation)",
        description: "Pasajeros, cargas, flotas y movilidad.",
      },
      {
        label: "Autos y aeronáutica (Aerospace / Automotriz)",
        description: "Fabricación, venta y servicios de vehículos o aviones.",
      },
      {
        label: "Dispositivos conectados (IoT)",
        description: "Sensores, robótica y aparatos que se conectan a internet.",
      },
    ],
  },
  {
    label: "Sector público y social",
    options: [
      {
        label: "ONG y fundaciones (ONG / Fundaciones)",
        description: "Organizaciones sin fines de lucro y causas sociales.",
      },
      {
        label: "ONG de empleabilidad (ONG Empleabilidad)",
        description: "Organizaciones que ayudan a conseguir trabajo o formarse.",
      },
      {
        label: "Economía social (Economía Social)",
        description: "Cooperativas de trabajo, emprendimientos sociales y comunitarios.",
      },
      {
        label: "Gobierno y trámites (GovTech)",
        description: "Municipios, organismos públicos y servicios al ciudadano.",
      },
      {
        label: "Participación ciudadana (CivicTech)",
        description: "Herramientas para que los vecinos opinen, voten o colaboren.",
      },
      {
        label: "Ciudades inteligentes (Smart Cities)",
        description: "Tránsito, alumbrado, residuos y servicios urbanos.",
      },
      {
        label: "Sostenibilidad (Sostenibilidad)",
        description: "Reciclaje, impacto ambiental y prácticas responsables.",
      },
      {
        label: "Clima y energía (ClimateTech)",
        description: "Energías renovables, eficiencia energética y cambio climático.",
      },
    ],
  },
  {
    label: "Medios, marketing y entretenimiento",
    options: [
      {
        label: "Marketing digital (Marketing Digital / Growth)",
        description: "Publicidad online, redes sociales y campañas para vender más.",
      },
      {
        label: "Herramientas de publicidad (MarTech / AdTech)",
        description: "Plataformas para crear, medir o automatizar anuncios.",
      },
      {
        label: "Contenidos y medios (Content & Media)",
        description: "Blogs, podcasts, productoras y creadores de contenido.",
      },
      {
        label: "Medios masivos (Mass Media)",
        description: "Diarios, radios, canales de TV y portales de noticias.",
      },
      {
        label: "Entretenimiento y música (Entretenimiento / Streaming / Música)",
        description: "Espectáculos, plataformas de streaming, sellos y artistas.",
      },
      {
        label: "Videojuegos (Videojuegos / Gaming & Esports)",
        description: "Estudios de juegos, gaming y competencias de esports.",
      },
      {
        label: "Realidad virtual y aumentada (AR / VR / Metaverso)",
        description: "Experiencias inmersivas, simuladores y mundos virtuales.",
      },
    ],
  },
  {
    label: "Tecnología",
    options: [
      {
        label: "Servicios y consultoría IT (IT / Tecnología / Consultoría Tech)",
        description: "Empresas de sistemas, soporte técnico y consultoras tecnológicas.",
      },
      {
        label: "Software por suscripción (SaaS)",
        description: "Programas que se usan online pagando un abono.",
      },
      {
        label: "Inteligencia artificial (AI / Machine Learning)",
        description: "Productos o servicios basados en IA.",
      },
      {
        label: "Datos y reportes (Business Intelligence / Data Analytics)",
        description: "Análisis de datos, tableros e indicadores.",
      },
      {
        label: "Seguridad informática (Ciberseguridad)",
        description: "Protección de sistemas, redes y datos.",
      },
      {
        label: "Servidores en la nube (Cloud & DevOps)",
        description: "Hosting, servidores y operación de sistemas en internet.",
      },
      {
        label: "Infraestructura de software (Software - Infrastructure)",
        description: "Bases de datos, redes y plataformas técnicas.",
      },
      {
        label: "Blockchain y cripto (Blockchain / Web3)",
        description: "Criptomonedas, tokens y contratos inteligentes.",
      },
    ],
  },
  {
    options: [
      {
        label: "Otro sector",
        description: "Si no encontrás el tuyo, contanos cuál en la descripción del desafío.",
      },
    ],
  },
];

export const businessSectors = businessSectorGroups.flatMap((group) =>
  group.options.map((option) => option.label),
);

const optionsFrom = (items: readonly (string | SelectOption)[]): SelectOption[] =>
  items.map((item) => (typeof item === "string" ? { label: item } : item));

const labelsOf = (groups: readonly SelectOptionGroup[]) =>
  groups.flatMap((group) => group.options.map((option) => option.label));

export const projectStageGroups: readonly SelectOptionGroup[] = [
  {
    options: [
      {
        label: "Es solo una idea (Idea)",
        description: "Todavía no hay nada armado; queremos explorar cómo hacerlo.",
      },
      {
        label: "Ya probamos que puede funcionar (POC)",
        description: "Hicimos una prueba chica o un piloto y queremos avanzar.",
      },
      {
        label: "Ya funciona y queremos crecer (Scaling)",
        description: "Tenemos clientes o usuarios y necesitamos que llegue a más.",
      },
      {
        label: "Tenemos un sistema viejo para renovar (Legacy)",
        description: "Algo que usamos hace tiempo y necesita actualizarse.",
      },
    ],
  },
  {
    options: [
      {
        label: "No estoy seguro",
        description: "Lo definimos juntos cuando validemos tu desafío.",
      },
    ],
  },
];

export const projectStages = labelsOf(projectStageGroups);

export const impactGroups: readonly SelectOptionGroup[] = [
  {
    options: [
      {
        label: "Que más gente conozca mi marca (Posicionamiento de marca)",
        description: "Ganar visibilidad y reconocimiento.",
      },
      {
        label: "Llegar a nuevos clientes o lugares (Expansión de mercado)",
        description: "Vender en otras zonas, países o a otro público.",
      },
      {
        label: "Ahorrar tiempo o costos (Eficiencia)",
        description: "Hacer las tareas más rápido, con menos errores o menos gastos.",
      },
      {
        label: "Vender más (Mejorar ingresos)",
        description: "Aumentar las ventas o sumar nuevas fuentes de ingreso.",
      },
      {
        label: "Saber si algo es posible antes de invertir (Validación técnica)",
        description: "Probar una idea en pequeño para ver si funciona.",
      },
      {
        label: "Que mis clientes estén más conformes (Experiencia de usuario)",
        description: "Que les resulte más fácil y agradable usar tu producto o servicio.",
      },
    ],
  },
  {
    options: [
      {
        label: "Otro",
        description: "Contanos cuál en la descripción del desafío.",
      },
    ],
  },
];

export const impactOptions = labelsOf(impactGroups);

/** Entre paréntesis va el nombre del rol en No Country, para poder mapearlo. */
export const roleGroups: readonly SelectOptionGroup[] = [
  {
    label: "Diseño y experiencia",
    options: optionsFrom([
      "Diseño de producto (Product Designer)",
      "Diseño de pantallas e interfaces (UX/UI Designer)",
      "Investigación con usuarios (UX Researcher)",
      "Redacción de textos para apps (Ux Writer)",
      "Diseño gráfico (Graphic Designer)",
      "Animación y motion (Motion Designer)",
      "Diseño de conversaciones y chatbots (Conversational Designer)",
    ]),
  },
  {
    label: "Marketing y contenidos",
    options: optionsFrom([
      "Marketing (Marketing Specialist)",
      "Manejo de redes sociales (Social Media Manager)",
      "Gestión de comunidad (Community Manager)",
      "Creación de contenido (Content Creator)",
      "Redacción publicitaria (Copywriter)",
      "Crecimiento y nuevos clientes (Growth Hacker)",
    ]),
  },
  {
    label: "Gestión de proyecto y producto",
    options: optionsFrom([
      "Gestión de producto (Product Manager)",
      "Responsable de producto (Product Owner)",
      "Gestión de proyectos (Project Manager)",
      "Análisis funcional (Functional Analyst)",
      "Liderazgo técnico (Tech Lead)",
    ]),
  },
  {
    label: "Desarrollo de sitios y apps",
    options: optionsFrom([
      "Desarrollo de la parte visible (Frontend Developer)",
      "Desarrollo de servidores y lógica (Backend Developer)",
      "Desarrollo web completo (Full Stack Developer)",
      "Ingeniería de software (Software Engineer)",
      "Arquitectura de sistemas (Software / Solution Architect)",
      "Apps para celular (Mobile Developer iOS/Android)",
      "Apps con Flutter (Flutter Developer)",
      "Apps con React Native (React Native Developer)",
      "Desarrollo sin código (No Code Developer)",
      "Desarrollo con Bubble (Bubble Developer)",
      "Desarrollo asistido por IA (Vibe Coder)",
      "Control de calidad técnico (QA Engineer)",
      "Pruebas de calidad (QA Tester)",
    ]),
  },
  {
    label: "Datos y reportes",
    options: optionsFrom([
      "Análisis de datos (Data analyst)",
      "Ciencia de datos (Data Scientist)",
      "Ingeniería de datos (Data Engineer)",
      "Arquitectura de datos (Data Architect)",
      "Visualización de datos (Data Visualization Specialist)",
      "Administración de bases de datos (Database Administrator)",
      "Análisis de reportes y tableros (BI Analyst)",
      "Desarrollo de reportes y tableros (BI Developer)",
    ]),
  },
  {
    label: "Inteligencia artificial y automatización",
    options: optionsFrom([
      "Ingeniería de inteligencia artificial (AI Engineer)",
      "Aprendizaje automático (Machine Learning Engineer)",
      "Modelos de lenguaje como ChatGPT (LLM Engineer)",
      "Instrucciones para IA (Prompt Engineer)",
      "Agentes autónomos con IA (Autonomous Agent Engineer)",
      "Automatización de tareas (Automation Specialist)",
    ]),
  },
  {
    label: "Nube e infraestructura",
    options: optionsFrom([
      "Arquitectura en la nube (Cloud Architect)",
      "Desarrollo en la nube (Cloud Developer)",
      "Ingeniería en la nube (Cloud Engineer)",
      "Automatización de publicaciones y servidores (DevOps Engineer)",
    ]),
  },
  {
    label: "Seguridad",
    options: optionsFrom([
      "Seguridad informática (Cybersecurity Engineer)",
      "Seguridad en la nube (Cloud Security Engineer)",
      "Seguridad en el desarrollo (DevSecOps Engineer)",
      "Pruebas de hackeo ético (Ethical Hacker)",
      "Protección de datos personales (Privacy Engineer)",
    ]),
  },
  {
    label: "Blockchain y cripto",
    options: optionsFrom([
      "Desarrollo blockchain (Blockchain Developer)",
      "Ingeniería cripto (Crypto Engineer)",
      "Ingeniería Web3 (Web3 Engineer)",
      "Desarrollo de NFT (NFT developer)",
      "Organizaciones descentralizadas (DAO Strategist)",
      "Economía de tokens (Tokenomics Specialist)",
    ]),
  },
  {
    label: "Videojuegos y sonido",
    options: optionsFrom([
      "Diseño de videojuegos (Game Designer)",
      "Programación de videojuegos (Game Developer)",
      "Arte para videojuegos (Game Artist)",
      "Guion para videojuegos (Game Writer)",
      "Sonido y audio (Sound Engineer)",
    ]),
  },
];

export const roles = labelsOf(roleGroups);

/** Agrupadas por uso, empezando por las que conoce cualquier organización. */
export const toolGroups: readonly SelectOptionGroup[] = [
  {
    label: "De uso cotidiano",
    options: optionsFrom([
      { label: "Excel", description: "Planillas de cálculo." },
      { label: "Google Sheets", description: "Planillas de cálculo en línea." },
      { label: "Notion", description: "Notas, documentos y organización de tareas." },
      { label: "Trello", description: "Tableros para organizar tareas." },
      "Jira",
      "Confluence",
      { label: "Slack", description: "Chat de trabajo en equipo." },
      "Discord",
      { label: "Google Meet", description: "Videollamadas." },
      { label: "Miro", description: "Pizarra digital colaborativa." },
      "Airtable",
      { label: "ChatGPT", description: "Asistente de inteligencia artificial." },
    ]),
  },
  {
    label: "Ventas y clientes",
    options: optionsFrom([
      { label: "Salesforce", description: "Gestión de clientes y ventas (CRM)." },
      { label: "HubSpot", description: "Gestión de clientes, ventas y marketing (CRM)." },
      { label: "Pipedrive", description: "Seguimiento de ventas (CRM)." },
    ]),
  },
  {
    label: "Marketing, redes y email",
    options: optionsFrom([
      { label: "Meta Business Suite", description: "Publicar y medir en Instagram y Facebook." },
      { label: "Hootsuite", description: "Programar publicaciones en redes sociales." },
      { label: "Buffer", description: "Programar publicaciones en redes sociales." },
      { label: "Metricool", description: "Programar y medir redes sociales." },
      { label: "Mailchimp", description: "Envío de emails y newsletters." },
      { label: "Brevo", description: "Envío de emails y mensajes de WhatsApp." },
      { label: "ActiveCampaign", description: "Emails automáticos a clientes." },
      { label: "SEMrush", description: "Posicionamiento en Google (SEO)." },
      { label: "Ahrefs", description: "Posicionamiento en Google (SEO)." },
      "Jasper",
    ]),
  },
  {
    label: "Sitios web sin programar y automatizaciones",
    options: optionsFrom([
      { label: "WordPress", description: "Sitio web o blog propio." },
      { label: "Webflow", description: "Sitio web sin programar." },
      "Lovable",
      "Bolt",
      "v0",
      "Replit",
      { label: "Zapier", description: "Conectar aplicaciones y automatizar tareas." },
      { label: "Make", description: "Conectar aplicaciones y automatizar tareas." },
    ]),
  },
  {
    label: "Diseño gráfico y prototipos",
    options: optionsFrom([
      { label: "Canva", description: "Diseño de piezas gráficas y redes." },
      "Figma",
      "FigJam",
      "Figma Dev Mode",
      "Figma Libraries",
      "Adobe Illustrator",
      "Photoshop",
      "Adobe XD",
      "Sketch",
      "InVision",
      "Claude Design",
    ]),
  },
  {
    label: "Comportamiento de usuarios",
    options: optionsFrom([
      "Hotjar",
      "Crazy Egg",
      "FullStory",
      "Maze",
      "Useberry",
      "Lookback",
      "Optimal Workshop",
      "Amplitude",
      "Mixpanel",
    ]),
  },
  {
    label: "Reportes y tableros",
    options: optionsFrom([
      "Microsoft Power BI",
      "Tableau",
      "Looker",
      "Google Data Studio",
      "Qlik",
      "MicroStrategy",
    ]),
  },
  {
    label: "Video, 3D, sonido y videojuegos",
    options: optionsFrom([
      "After Effects",
      "Blender",
      "3ds Max",
      "Maya",
      "Substance Painter",
      "Unity",
      "Unreal Engine",
      "FMOD",
      "Ableton Live (sound)",
    ]),
  },
  {
    label: "Inteligencia artificial",
    options: optionsFrom([
      "OpenAI API",
      "OpenAI Codex",
      "Claude Code",
      "Gemini CLI",
      "Cursor",
      "Windsurf",
      "Antigravity 2.0",
      "Antigravity IDE",
      "OpenCode",
      "HuggingFace",
      "LangChain",
      "LangGraph",
      "LlamaIndex",
      "Pinecone",
      "Weaviate",
      "ChromaDb",
      "FAISS",
      "Gradio",
      "Streamlit",
      "PyTorch",
      "TensorFlow",
      "scikit-learn",
    ]),
  },
  {
    label: "Lenguajes de programación",
    options: optionsFrom([
      "Python",
      "JavaScript",
      "TypeScript",
      "Java",
      "C#",
      "C++",
      "Go",
      "Rust",
      "Ruby",
      "PHP",
      "Kotlin",
      "Swift",
      "Solidity",
      "HTML",
      "CSS",
    ]),
  },
  {
    label: "Desarrollo de sitios y apps",
    options: optionsFrom([
      "React",
      "Next.js",
      "Vue.js",
      "Nuxt.js",
      "Angular",
      "Svelte",
      "Astro",
      "Gatsby",
      "Node.js",
      "Express.js",
      "NestJS",
      "Django",
      "Flask",
      "FastAPI",
      "Laravel",
      "Ruby on Rails",
      "Spring Boot",
      "ASP.NET Core",
      "React Native",
      "Flutter",
      "Ionic",
      "Xamarin",
      "Tailwind CSS",
      "Bootstrap",
      "Sass",
      "Less",
      "Styled Components",
      "Emotion",
      "Storybook",
      "Visual Studio Code",
      "Chrome DevTools",
      "Firefox Inspector",
      "Postman",
      "Insomnia",
      "Swagger UI",
    ]),
  },
  {
    label: "Bases de datos",
    options: optionsFrom([
      "PostgreSQL",
      "MySQL",
      "SQL Server",
      "SQLite",
      "MongoDB",
      "Redis",
      "DynamoDB",
      "Firebase",
      "Supabase",
    ]),
  },
  {
    label: "Ingeniería de datos",
    options: optionsFrom([
      "Google BigQuery",
      "Snowflake",
      "Databricks",
      "Amazon Redshift",
      "Apache Airflow",
      "Apache Kafka",
      "Airbyte",
      "Fivetran",
      "Dagster",
      "Prefect",
      "dbt (Data Build Tool)",
      "AWS Glue",
      "Azure Data Lake Storage",
    ]),
  },
  {
    label: "Nube y servidores",
    options: optionsFrom([
      "AWS",
      "AWS EC2",
      "AWS Lambda",
      "AWS CloudFormation",
      "Amazon S3",
      "Azure",
      "Google Cloud",
      "Google Cloud Storage",
      "Cloud Functions",
      "Docker",
      "Kubernetes",
      "Kubernetes Engine",
      "Terraform",
      "Pulumi",
      "Ansible",
      "GitHub Actions",
      "GitLab CI",
      "Jenkins",
      "Datadog",
      "New Relic",
      "Splunk",
    ]),
  },
  {
    label: "Pruebas y calidad",
    options: optionsFrom([
      "Cypress",
      "Playwright",
      "Selenium",
      "Jest",
      "Vitest",
      "Testing Library",
      "TestRail",
      "Xray",
    ]),
  },
  {
    label: "Seguridad",
    options: optionsFrom([
      "Burp Suite",
      "OWASP ZAP",
      "Kali Linux",
      "Metasploit",
      "Nmap",
      "Nessus",
      "Wireshark",
      "Elastic Security",
      "AWS Security Hub",
      "Azure Security Center",
    ]),
  },
  {
    label: "Blockchain y cripto",
    options: optionsFrom([
      "MetaMask",
      "WalletConnect",
      "Alchemy",
      "Infura",
      "IPFS",
      "The Graph",
      "Truffle",
      "Remix IDE",
      "Dune Analytics",
    ]),
  },
];

export const tools = labelsOf(toolGroups);
