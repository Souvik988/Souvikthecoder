// Everything a visitor (or a crawler) reads lives here. The same data feeds the page,
// the static pre-render in index.html, JSON-LD and llms.txt (see vite.config.ts).

export const site = {
  name: 'Souvik',
  handle: 'souvik_the_coder',
  role: 'Founder & COO, Shotlin and Opslin',
  shortRole: 'Founder & COO',
  location: 'India',
  email: 'hello@shotlin.in',
  description:
    'Souvik is the founder and COO of Shotlin, a product studio, and Opslin, a VPS deployment platform. He leads teams that ship Flutter apps, quick-commerce platforms, AI products, DevOps tooling and games.',
}

// WhatsApp opens a chat with a message already typed for the visitor
export const contact = {
  whatsapp: '916297831930',
  whatsappDisplay: '+91 62978 31930',
  instagram: '', // handle without @, e.g. 'souvik_the_coder' — the Instagram icon appears once this is set
  email: site.email,
}
export const waLink = (msg: string) => `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(msg)}`
export const waHello = "Hi Souvik! 👋 I just went through your portfolio and I'd love to talk about a project."
export const waProject = (name: string) => `Hi Souvik! 👋 I saw ${name} on your portfolio and I want to build something like it. Can we talk?`

export const nav = [
  { label: 'Ventures', href: '#ventures' },
  { label: 'Work', href: '#work' },
  { label: 'Skills', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export const hero = {
  eyebrow: "Hi, I'm Souvik. Founder & COO, Shotlin & Opslin.",
  human: ['Code that', 'looks back', 'at you.'],
  body: 'I run Shotlin and Opslin, shipping quick-commerce apps, AI products, DevOps platforms and games. Scroll and he notices you. Hover his face to see what burns underneath.',
}

// Arc stats on the hero (format from the cyberpunk reference).
export const arcStats = [
  { r: 330, a0: -92, a1: 16, dot: -46, num: '15', suf: '+', label: 'APPS & PANELS SHIPPED' },
  { r: 395, a0: -56, a1: 60, dot: 2, num: '2', suf: '', label: 'COMPANIES · FOUNDER & COO' },
  { r: 460, a0: -14, a1: 72, dot: 44, num: '7', suf: '', label: 'BRANDS BUILT WITH' },
]

export const manifesto =
  "I don't just build apps. I build the companies, teams and systems behind them — from the first screen to the server it runs on."
export const manifestoMarquee = 'SHOTLIN ✦ OPSLIN ✦ FLUTTER ✦ AI ✦ DEVOPS ✦ '

export type Shot = { src: string; alt: string; w: number; h: number; url?: string; tint?: string; dark?: boolean }

export const ventures = [
  {
    id: 'shotlin',
    name: 'Shotlin',
    role: 'Founder & COO',
    kind: 'Independent product studio',
    tagline: 'A studio for ambitious software.',
    blurb:
      'Shotlin connects product thinking, interface design, mobile and web engineering, business dashboards and the infrastructure behind them. Every project on this page shipped through Shotlin.',
    points: ['Customer, vendor & rider apps', 'Admin HQs, POS & CRMs', 'AI workflows & automation', 'Cloud, DevOps & launch'],
    url: '',
    shots: [] as Shot[],
  },
  {
    id: 'opslin',
    name: 'Opslin',
    role: 'Founder & COO',
    kind: 'VPS deployment platform · Live beta',
    tagline: 'Your server. Your rules.',
    blurb:
      'Opslin deploys websites, APIs and backends to a Linux VPS you own in about five minutes: domains, SSL, databases, logs, monitoring and one-click rollback from one dashboard, plus a permissioned MCP beta so AI assistants can operate deployments.',
    points: ['Git push → health-checked release', 'Outbound-only Go agent', 'PostgreSQL, MySQL, MongoDB, Redis', 'Opslin MCP for ChatGPT, Claude & Gemini'],
    url: 'https://www.opslin.com/',
    shots: [
      { src: '/work/opslin-overview.webp', alt: 'Opslin fleet overview with servers online, apps running, deploy activity and server fleet', w: 1600, h: 831, url: 'dash.opslin.com/overview' },
      { src: '/work/opslin-servers.webp', alt: 'Opslin servers screen with a connected VPS, uptime, CPU and one-click deploy, terminal and logs', w: 1600, h: 831, url: 'dash.opslin.com/servers' },
      { src: '/work/opslin-databases.webp', alt: 'Opslin databases screen with quick start for PostgreSQL, pgvector, MySQL, MongoDB and Redis', w: 1600, h: 817, url: 'dash.opslin.com/databases' },
    ] as Shot[],
  },
]

export type Project = {
  id: string
  name: string
  logo?: string
  kind: string
  where: string
  tagline: string
  blurb: string
  built: string[]
  platforms: string[]
  stack: string[]
  links: { label: string; href: string }[]
  status?: string
  accent: string
  tone: string // deep page colour while this project is on screen
  phones: Shot[]
  screens: Shot[]
  wide?: Shot
}

export const projects: Project[] = [
  {
    id: 'bakaloo',
    name: 'Bakaloo',
    logo: '/brands/bakaloo.webp',
    kind: 'Grocery quick commerce',
    where: 'Surat, Gujarat',
    tagline: 'Local stores, delivered in under an hour.',
    blurb:
      'A Surat-based hyperlocal grocery quick-commerce brand. The customer app handles fast discovery, festive campaigns and wallet rewards; behind it sits an admin HQ with a visual storefront builder, a live store-coverage map, a customer activity timeline and a WhatsApp CRM with agentic AI.',
    built: [
      'Flutter customer app with a 59-minute delivery promise',
      'Theme & section builder for B2B and B2C storefronts',
      'Store coverage map drawn from real delivered addresses',
      'Customer activity timeline & WhatsApp CRM with AI handoff',
    ],
    platforms: ['Android', 'iOS', 'Web admin'],
    stack: ['Flutter', 'Node.js', 'WhatsApp API', 'Agentic AI', 'Maps'],
    links: [],
    accent: '#a46bff',
    tone: '#12072a',
    phones: [
      { src: '/work/bakaloo-home.webp', alt: 'Bakaloo customer app home with categories, free delivery strip and collections', w: 720, h: 1548, tint: '#e1d1fd' },
      { src: '/work/bakaloo-festive.webp', alt: 'Bakaloo app with a Diwali spin-and-win campaign and fresh arrivals', w: 720, h: 1548, tint: '#e1d1fd' },
    ],
    screens: [
      { src: '/work/bakaloo-builder.webp', alt: 'Bakaloo storefront section builder with live phone preview, layout variants and publishing', w: 1800, h: 923, url: 'dash.bakaloo.in/theme-builder' },
      { src: '/work/bakaloo-coverage.webp', alt: 'Bakaloo store coverage map around Surat with pincode clusters and delivery radius', w: 1800, h: 925, url: 'dash.bakaloo.in/hq/coverage-map' },
      { src: '/work/bakaloo-activity.webp', alt: 'Bakaloo customer activity timeline listing notifications, carts and wallet events', w: 1800, h: 934, url: 'dash.bakaloo.in/hq/customer-activity' },
      { src: '/work/bakaloo-coverage-dense.webp', alt: 'Bakaloo coverage map zoomed in with every delivered customer plotted', w: 1800, h: 929, url: 'dash.bakaloo.in/hq/coverage-map' },
      { src: '/work/bakaloo-builder-layout.webp', alt: 'Bakaloo builder switching a seasonal mosaic section to a product grid layout', w: 1800, h: 931, url: 'dash.bakaloo.in/theme-builder' },
    ],
  },
  {
    id: 'freshcart',
    name: 'FreshCart',
    logo: '/brands/freshcart.webp',
    kind: 'Meat, fish & seafood quick commerce',
    where: 'Hyderabad, Telangana',
    tagline: 'Fresh cuts in 30 minutes.',
    blurb:
      'A Hyderabad-based quick-commerce brand for meat, fish, seafood and eggs, with B2C and B2B shopping modes. Customers order hygienic cuts by weight; vendors run requests, supplies and earnings from the FreshCuts vendor app.',
    built: [
      'Customer app with B2C / B2B modes and weight-based cuts',
      'FreshCuts vendor app: requests, supplies & earnings',
      'Location-aware delivery and voice search',
      'Customer, vendor and rider operations',
    ],
    platforms: ['Android', 'iOS'],
    stack: ['Flutter', 'REST APIs', 'Maps', 'Payments'],
    links: [],
    accent: '#ff4d4d',
    tone: '#1d0507',
    phones: [
      { src: '/work/freshcart-home.webp', alt: 'FreshCart customer app with chicken, fish, mutton and eggs categories and premium cuts', w: 720, h: 1548, tint: '#e6d4b9' },
      { src: '/work/freshcart-vendor.webp', alt: 'FreshCuts vendor app with new requests, active supplies, monthly value and earnings chart', w: 720, h: 1548, tint: '#ffffff' },
    ],
    screens: [],
  },
  {
    id: 'dealker',
    name: 'Dealker',
    logo: '/brands/dealker.webp',
    kind: 'Electronics e-commerce',
    where: 'Delhi, India',
    tagline: 'Shop. Bid. Repair.',
    blurb:
      'A Delhi-based electronics marketplace for phones, parts, accessories and gadgets. Brand-led discovery, live deals and zero-fee promos sit next to auctions and repair booking, backed by vendor and rider apps and an operations dashboard.',
    built: ['Customer marketplace with brand discovery', 'Auctions and repair booking in one app', 'Vendor & rider apps', 'Backend and operations dashboard'],
    platforms: ['Android', 'iOS'],
    stack: ['Flutter', 'Node.js', 'Marketplace'],
    links: [],
    accent: '#7d66ff',
    tone: '#0a0724',
    phones: [{ src: '/work/dealker-home.webp', alt: 'Dealker app with mobile categories, big phone sale, zero fees and Apple and Samsung brands', w: 720, h: 1548, tint: '#0b0114', dark: true }],
    screens: [],
  },
  {
    id: 'lndry',
    name: 'LNDRY',
    logo: '/brands/lndry.webp',
    kind: "India's first garment-care marketplace",
    where: 'Pune, Maharashtra',
    tagline: 'Drop your dirty work.',
    blurb:
      'LNDRY matches customers with verified laundry partners for doorstep pickup, live order tracking and OTP handover. Three apps and a full counter POS run the whole loop: customer, partner (vendor) and rider apps, and the LNDRY management system for stores.',
    built: [
      'Customer app: book, track and OTP handover',
      'Partner app: revenue, orders & quick actions',
      'LNDRY management system: booking, POS & GST finance',
      'Marketing website at lndry.in',
    ],
    platforms: ['Android', 'iOS', 'Web POS', 'Website'],
    stack: ['Flutter', 'Next.js', 'Node.js', 'WhatsApp'],
    links: [{ label: 'lndry.in', href: 'https://lndry.in/' }],
    accent: '#8c74ff',
    tone: '#0d0a2e',
    phones: [
      { src: '/work/lndry-customer.webp', alt: 'LNDRY customer app with laundry and dry-cleaning services and schedule pickup', w: 720, h: 1548, tint: '#9dbcaa' },
      { src: '/work/lndry-partner.webp', alt: 'LNDRY partner app with today revenue, order requests, bookings and quick actions', w: 720, h: 1548, tint: '#fefefe' },
    ],
    screens: [
      { src: '/work/lndry-pos-dashboard.webp', alt: 'LNDRY management system dashboard with order requests, pending orders and quick actions', w: 1535, h: 692, url: 'pos.lndry.in/dashboard' },
      { src: '/work/lndry-pos-booking.webp', alt: 'LNDRY order booking with garment catalogue, prices and GST totals', w: 1535, h: 691, url: 'pos.lndry.in/order-booking' },
      { src: '/work/lndry-pos-finance.webp', alt: 'LNDRY finance and compliance with net sales, GST collected and outstanding', w: 1535, h: 693, url: 'pos.lndry.in/finance' },
    ],
  },
  {
    id: 'radha',
    name: 'Radha',
    logo: '/brands/radha.webp',
    kind: 'Retail intelligence & nutrition AI',
    where: 'India',
    tagline: 'Scan. Track. Act.',
    blurb:
      'RADHA turns a barcode scan into a store action. Shop owners list inventory, track every product’s expiry, run audits and see store health at a glance; everyday users scan packaged food to understand its nutrients.',
    built: ['Inventory & expiry tracking with alerts', 'Barcode + OCR scanning', 'Operational health score & 7-day activity', 'Nutrient scanning for consumers'],
    platforms: ['Android', 'iOS', 'Website'],
    stack: ['Flutter', 'Computer vision', 'OCR', 'AI'],
    links: [{ label: 'Radha AI website', href: 'https://radha-website-main-new-final.vercel.app/' }],
    accent: '#ffa040',
    tone: '#1d0e03',
    phones: [{ src: '/work/radha-store.webp', alt: 'Radha store app with operational health 82/100, 7-day scans and tasks, and expiring items', w: 720, h: 1561, tint: '#e4e2de' }],
    screens: [],
  },
  {
    id: 'jimmywax',
    name: 'Jimmy & Wax',
    kind: 'Premium shoe-care commerce',
    where: 'India',
    tagline: 'Shine that lasts.',
    blurb:
      'A premium shoe-care storefront app: polishes, care kits, accessories and gift packs, presented with a rich navy-and-gold catalogue, best sellers and a smooth cart and orders flow.',
    built: ['Customer shopping app', 'Category & best-seller merchandising', 'Cart, orders & profile'],
    platforms: ['Android', 'iOS'],
    stack: ['Flutter', 'Commerce'],
    links: [],
    accent: '#e2bd62',
    tone: '#03102a',
    phones: [{ src: '/work/jimmywax-home.webp', alt: 'Jimmy & Wax app with Shine That Lasts banner, care categories and best sellers', w: 720, h: 1227, tint: '#041c4b', dark: true }],
    screens: [],
  },
  {
    id: 'rustbloom',
    name: 'Rustbloom',
    kind: 'Story-mode 2D / 2.5D game',
    where: 'Android & desktop',
    tagline: 'A world of overgrown clockwork.',
    blurb:
      'Our story-mode platformer, in development for Android and desktop: a flowering clockwork garden built in layered 2.5D, with traversal, combat, touch and keyboard controls, and full audio and graphics settings.',
    built: ['Story mode & level design', 'Layered 2.5D environments', 'Touch + desktop controls', 'Settings, graphics & frame-rate options'],
    platforms: ['Android', 'Windows'],
    stack: ['Unity', 'Godot', 'Game design'],
    links: [],
    status: 'In development',
    accent: '#ff8a70',
    tone: '#1c0b09',
    phones: [],
    screens: [],
    wide: { src: '/work/rustbloom.webp', alt: 'Rustbloom gameplay: a small red-cloaked hero in a flowering clockwork garden', w: 1600, h: 639 },
  },
]

// Opslin gets the same 3D treatment as the client work.
export const opslinProject: Project = {
  id: 'opslin',
  name: 'Opslin',
  logo: '/brands/opslin.webp',
  kind: ventures[1].kind,
  where: 'opslin.com',
  tagline: ventures[1].tagline,
  blurb: ventures[1].blurb,
  built: ventures[1].points,
  platforms: ['Web dashboard', 'Linux agent', 'MCP'],
  stack: ['Go', 'Docker', 'Nginx', 'PostgreSQL', 'Cloudflare'],
  links: [
    { label: 'opslin.com', href: 'https://www.opslin.com/' },
    { label: 'Start free beta', href: 'https://dash.opslin.com/register' },
  ],
  accent: '#2fd38a',
  tone: '#03170f',
  phones: [],
  screens: ventures[1].shots,
}

export const brands = [
  { name: 'Shotlin', logo: '' },
  { name: 'Opslin', logo: '/brands/opslin.webp' },
  { name: 'Bakaloo', logo: '/brands/bakaloo.webp' },
  { name: 'FreshCart', logo: '/brands/freshcart.webp' },
  { name: 'Dealker', logo: '/brands/dealker.webp' },
  { name: 'LNDRY', logo: '/brands/lndry.webp' },
  { name: 'Radha', logo: '/brands/radha.webp' },
  { name: 'Agnix Studio', logo: '/brands/agnix.webp' },
  { name: 'Jimmy & Wax', logo: '' },
]

export const capabilities = [
  { id: 'mobile', color: '#4aa8ff', title: 'Flutter & mobile', note: 'Customer, vendor and rider apps for Android and iOS', items: ['Flutter', 'Dart', 'Android', 'iOS', 'State management', 'Push & payments', 'Maps & live tracking', 'Offline-first'] },
  { id: 'ai', color: '#b47cff', title: 'AI & machine learning', note: 'Intelligence that does real work', items: ['LLM apps', 'AI agents', 'MCP servers', 'RAG & embeddings', 'Computer vision', 'OCR', 'Recommendations', 'Automation'] },
  { id: 'devops', color: '#2fd38a', title: 'DevOps & cloud', note: 'The infrastructure Opslin is built on', items: ['Docker', 'CI/CD', 'Linux VPS', 'Nginx', 'Cloudflare', 'AWS', 'Monitoring & alerts', 'Go agents'] },
  { id: 'arch', color: '#ffb547', title: 'System architecture', note: 'Platforms that keep scaling after launch', items: ['Multi-tenant SaaS', 'Marketplaces', 'Event-driven', 'Real-time', 'PostgreSQL', 'MongoDB', 'Redis', 'RBAC & audit'] },
  { id: 'web', color: '#ff5c8a', title: 'Web & product', note: 'Dashboards, POS systems and sites like this one', items: ['React', 'Next.js', 'TypeScript', 'Node.js', 'Three.js', 'WebGL', 'GSAP', 'Tailwind'] },
  { id: 'lead', color: '#ff2a1f', title: 'Leadership & operations', note: 'The COO side of the work', items: ['Product strategy', 'Delivery', 'Hiring & teams', 'Client success', 'Launch ops', 'Unit economics'] },
  { id: 'games', color: '#ff8a70', title: 'Game development', note: 'Rustbloom and beyond', items: ['Unity', 'Godot', '2D / 2.5D', 'Level design', 'Mobile & PC'] },
]

export const about = {
  lines: [
    "I'm Souvik, founder and COO of Shotlin and Opslin. I sit where product, engineering and operations meet: deciding what to build, shaping how it feels and making sure it ships and keeps running.",
    'With Shotlin we have built quick-commerce platforms for Surat and Hyderabad, an electronics marketplace, a garment-care marketplace in Pune, retail AI and a game. With Opslin we are making it simple to deploy software on a server you own.',
  ],
  toolbox: [
    { name: 'Flutter', note: 'Customer, vendor and rider apps for Android and iOS' },
    { name: 'AI agents', note: 'Agentic workflows, MCP, RAG and human handoff' },
    { name: 'DevOps', note: 'Docker, CI/CD, VPS, monitoring — the Opslin stack' },
    { name: 'Architecture', note: 'Marketplaces, multi-tenant SaaS, real-time systems' },
    { name: 'React', note: 'Dashboards, POS systems and immersive sites' },
    { name: 'Three.js', note: 'Real-time 3D and shaders, like the hero above' },
    { name: 'Operations', note: 'Running delivery, teams and launches as COO' },
    { name: 'Games', note: 'Unity and Godot, 2D and 2.5D, mobile and PC' },
  ],
}

// the orbiting skill sphere
export const stack = [
  'Flutter', 'Dart', 'React', 'Next.js', 'TypeScript', 'Node.js', 'Go', 'Python', 'AI agents', 'MCP', 'RAG', 'LLMs',
  'Computer vision', 'OCR', 'Docker', 'CI/CD', 'Linux', 'Nginx', 'AWS', 'Cloudflare', 'PostgreSQL', 'MongoDB', 'Redis',
  'Three.js', 'WebGL', 'GSAP', 'Tailwind', 'Firebase', 'Unity', 'Godot', 'System design', 'Microservices',
]

// live products, shown in the contact dock
export const links = [
  { id: 'opslin', label: 'Opslin', href: 'https://www.opslin.com/', logo: '/brands/opslin-white.webp' },
  { id: 'lndry', label: 'LNDRY', href: 'https://lndry.in/', logo: '/brands/lndry.webp' },
  { id: 'radha', label: 'Radha AI', href: 'https://radha-website-main-new-final.vercel.app/', logo: '/brands/radha.webp' },
]

export const faq = [
  { q: 'Who is Souvik?', a: 'Souvik (souvik_the_coder) is the founder and COO of Shotlin, an independent product studio, and Opslin, a VPS deployment platform, based in India.' },
  { q: 'What is Shotlin?', a: 'Shotlin is a product studio that designs and builds mobile apps, websites, business dashboards, AI workflows and the infrastructure behind them. Its work includes Bakaloo, FreshCart, Dealker, LNDRY, Radha, Jimmy & Wax and the game Rustbloom.' },
  { q: 'What is Opslin?', a: 'Opslin is a managed VPS deployment platform: connect a Linux server you own and your code, and go live in about five minutes with domains, SSL, databases, logs, monitoring, rollback and a permissioned MCP beta for AI assistants. It is available at opslin.com.' },
  { q: 'Which apps has Souvik built?', a: 'Bakaloo (grocery quick commerce, Surat), FreshCart (meat, fish and seafood quick commerce, Hyderabad), Dealker (electronics marketplace, Delhi), LNDRY (garment-care marketplace and POS, Pune), Radha (retail intelligence and nutrition scanning), Jimmy & Wax (shoe-care commerce) and Rustbloom (a story-mode game for Android and desktop).' },
  { q: 'What can Souvik and Shotlin build for me?', a: 'Flutter apps for Android and iOS, web dashboards and POS systems, AI agents and automation, system architecture for marketplaces and SaaS, and cloud / DevOps deployment — from the first idea to a running product.' },
]
