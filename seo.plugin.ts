// Build-time SEO / GEO: turns src/content.ts into head tags, JSON-LD, a static pre-render of
// every word on the page (for crawlers and AI agents that don't run JS), one crawlable
// case-study page per product (/work/<id>/), llms.txt, robots.txt, a web manifest and a sitemap.
// Override SITE_URL when the canonical production domain changes.
import type { Plugin } from 'vite'
import { site, hero, ventures, projects, capabilities, faq, about, contact, waLink, waHello, waProject, opslinProject, type Project } from './src/content'

const SITE = (process.env.SITE_URL || 'https://souvikthecoder.in').replace(/\/$/, '')
const abs = (p: string) => (SITE ? SITE + p : p)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ld = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`

const TITLE = `${site.name} — ${site.role} | Flutter, AI & DevOps`
const DESC =
  'Souvik is founder & COO of Shotlin and Opslin. Flutter apps, quick commerce, AI agents, DevOps and system architecture: Bakaloo, FreshCart, Dealker, LNDRY, Radha, Rustbloom.'
const KEYWORDS = [
  'Souvik', 'souvik_the_coder', 'Shotlin', 'Opslin', 'founder', 'COO', 'Flutter app developer India', 'quick commerce app development',
  'grocery delivery app', 'marketplace app', 'AI agents', 'DevOps', 'system architecture', 'VPS deployment', 'Bakaloo', 'FreshCart',
  'Dealker', 'LNDRY', 'Radha AI', 'Rustbloom',
].join(', ')
const cases: Project[] = [opslinProject, ...projects]
const page = (p: Project) => `/work/${p.id}/`
const shotsOf = (p: Project) => [...p.phones, ...p.screens, ...(p.wide ? [p.wide] : [])]
const instagram = contact.instagram ? `https://www.instagram.com/${contact.instagram}/` : ''
const tel = `+${contact.whatsapp}`

const personNode = () => ({
  '@type': 'Person',
  '@id': abs('/#souvik'),
  name: site.name,
  alternateName: [site.handle, 'Souvik the Coder'],
  jobTitle: site.shortRole,
  description: site.description,
  ...(SITE && { url: SITE + '/' }),
  email: `mailto:${site.email}`,
  telephone: tel,
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  worksFor: [{ '@id': abs('/#shotlin') }, { '@id': abs('/#opslin') }],
  knowsAbout: [...new Set(capabilities.flatMap((c) => [c.title, ...c.items]))],
  image: abs('/img/about_cap.webp'),
  ...(instagram && { sameAs: [instagram] }),
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'business enquiries',
    telephone: tel,
    email: site.email,
    url: waLink(waHello),
    availableLanguage: ['English', 'Hindi', 'Bengali'],
  },
})

const appNode = (p: Project) => ({
  '@type': p.id === 'rustbloom' ? 'VideoGame' : 'SoftwareApplication',
  '@id': abs(`${page(p)}#app`),
  name: p.name,
  url: abs(page(p)),
  description: `${p.blurb} ${p.built.join('. ')}.`,
  applicationCategory:
    p.id === 'rustbloom' ? 'GameApplication' : p.id === 'opslin' ? 'DeveloperApplication' : p.id === 'radha' ? 'BusinessApplication' : 'ShoppingApplication',
  operatingSystem: p.platforms.join(', '),
  ...(p.links[0] && { sameAs: p.links.map((l) => l.href) }),
  ...(p.status && { creativeWorkStatus: p.status }),
  areaServed: p.where,
  image: shotsOf(p).map((s) => abs(s.src)),
  creator: [{ '@id': abs('/#shotlin') }, { '@id': abs('/#souvik') }],
})

function homeLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': abs('/#website'), name: `${site.name} — ${site.handle}`, ...(SITE && { url: SITE + '/' }), inLanguage: 'en', publisher: { '@id': abs('/#souvik') } },
      { '@type': 'ProfilePage', '@id': abs('/#profile'), name: TITLE, description: DESC, mainEntity: { '@id': abs('/#souvik') }, isPartOf: { '@id': abs('/#website') } },
      personNode(),
      { '@type': 'Organization', '@id': abs('/#shotlin'), name: 'Shotlin', description: ventures[0].blurb, founder: { '@id': abs('/#souvik') }, email: site.email, telephone: tel },
      {
        '@type': 'Organization',
        '@id': abs('/#opslin'),
        name: 'Opslin',
        url: 'https://www.opslin.com/',
        description: ventures[1].blurb,
        founder: { '@id': abs('/#souvik') },
        logo: abs('/brands/opslin.webp'),
      },
      { '@type': 'ItemList', name: `Products built by ${site.name}, Shotlin and Opslin`, itemListElement: cases.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: appNode(p) })) },
      { '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  }
}

function meta(o: { title: string; desc: string; path: string; image: string; alt: string; type?: string }) {
  return [
    `<title>${esc(o.title)}</title>`,
    `<meta name="description" content="${esc(o.desc)}" />`,
    `<meta name="author" content="${esc(site.name)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    SITE && `<link rel="canonical" href="${SITE}${o.path}" />`,
    `<meta property="og:type" content="${o.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${esc(site.name)} — ${esc(site.handle)}" />`,
    `<meta property="og:title" content="${esc(o.title)}" />`,
    `<meta property="og:description" content="${esc(o.desc)}" />`,
    SITE && `<meta property="og:url" content="${SITE}${o.path}" />`,
    `<meta property="og:image" content="${abs(o.image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(o.alt)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(o.title)}" />`,
    `<meta name="twitter:description" content="${esc(o.desc)}" />`,
    `<meta name="twitter:image" content="${abs(o.image)}" />`,
    instagram && `<link rel="me" href="${instagram}" />`,
    `<link rel="manifest" href="/manifest.webmanifest" />`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`,
    `<link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable summary" />`,
  ]
    .filter(Boolean)
    .join('\n    ')
}

function head() {
  return [
    meta({ title: TITLE, desc: DESC, path: '/', image: '/og/souvik.jpg', alt: `${site.name}, ${site.role}`, type: 'profile' }),
    `<meta name="keywords" content="${esc(KEYWORDS)}" />`,
    ld(homeLd()),
  ].join('\n    ')
}

// The whole page as plain semantic HTML. React replaces it on mount; crawlers without JS read it.
function prerender() {
  const li = (xs: string[]) => xs.map((x) => `<li>${esc(x)}</li>`).join('')
  const a = (href: string, label: string) => `<a href="${esc(href)}">${esc(label)}</a>`
  return `<div class="ssg">
  <header><p>${esc(hero.eyebrow)}</p><h1>${esc(site.name)} — ${esc(site.role)}</h1><p>${esc(site.description)}</p>
  <nav><a href="#ventures">Ventures</a> <a href="#work">Work</a> <a href="#skills">Skills</a> <a href="#about">About</a> <a href="#faq">FAQ</a> <a href="#contact">Contact</a></nav></header>
  <main>
  <section id="ventures"><h2>Ventures</h2>${ventures
    .map((v) => `<article><h3>${esc(v.name)} — ${esc(v.role)}</h3><p>${esc(v.kind)}. ${esc(v.tagline)}</p><p>${esc(v.blurb)}</p><ul>${li(v.points)}</ul>${v.url ? a(v.url, v.url) : ''}</article>`)
    .join('')}</section>
  <section id="work"><h2>Work: products built at Shotlin</h2>${cases
    .map(
      (p) => `<article id="work-${p.id}"><h3>${a(page(p), `${p.name} — ${p.kind}`)}</h3><p>${esc(p.where)}${p.status ? ` · ${esc(p.status)}` : ''}. ${esc(p.tagline)}</p><p>${esc(p.blurb)}</p><ul>${li(p.built)}</ul><p>Platforms: ${esc(p.platforms.join(', '))}. Stack: ${esc(p.stack.join(', '))}.</p>${p.links.map((l) => a(l.href, l.label)).join(' ')}</article>`,
    )
    .join('')}</section>
  <section id="skills"><h2>Capabilities</h2>${capabilities.map((c) => `<h3>${esc(c.title)}</h3><p>${esc(c.note)}</p><ul>${li(c.items)}</ul>`).join('')}</section>
  <section id="about"><h2>About</h2>${about.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</section>
  <section id="faq"><h2>FAQ</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}</section>
  <section id="contact"><h2>Contact</h2><p>${a(waLink(waHello), `WhatsApp ${contact.whatsappDisplay}`)} · <a href="mailto:${site.email}">${site.email}</a>${instagram ? ` · ${a(instagram, 'Instagram')}` : ''}</p></section>
  </main></div>`
}

// A standalone, crawlable case study: no JS, styled in the project's own colours.
function casePage(p: Project) {
  const others = cases.filter((x) => x !== p)
  const title = `${p.name} — ${p.kind} | ${site.name}, Shotlin`
  const desc = `${p.tagline} ${p.blurb}`.slice(0, 158)
  const crumbs = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: site.name, item: abs('/') },
          { '@type': 'ListItem', position: 2, name: 'Work', item: abs('/#work') },
          { '@type': 'ListItem', position: 3, name: p.name, item: abs(page(p)) },
        ],
      },
      appNode(p),
      { '@type': 'WebPage', '@id': abs(page(p)), name: title, description: desc, about: { '@id': abs(`${page(p)}#app`) }, author: personNode() },
    ],
  }
  const shots = shotsOf(p)
    .map((s) => `<figure class="${s.h > s.w ? 'ph' : 'wd'}"><img src="${s.src}" alt="${esc(s.alt)}" width="${s.w}" height="${s.h}" loading="${s === shotsOf(p)[0] ? 'eager' : 'lazy'}" decoding="async" /><figcaption>${esc(s.alt)}</figcaption></figure>`)
    .join('')
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="${p.tone}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    ${meta({ title, desc, path: page(p), image: `/og/${p.id}.jpg`, alt: `${p.name} by Shotlin`, type: 'article' })}
    ${ld(crumbs)}
    <style>
      :root { --a: ${p.accent}; --t: ${p.tone} }
      * { box-sizing: border-box }
      body { margin: 0; background: radial-gradient(70% 50% at 80% 0%, color-mix(in srgb, var(--a) 35%, transparent), transparent 70%), var(--t); color: #ecebe6; font: 16px/1.65 ui-monospace, "JetBrains Mono", Consolas, monospace }
      a { color: var(--a) }
      .w { max-width: 1100px; margin: 0 auto; padding: 32px 20px 80px }
      nav { display: flex; gap: 16px; font-size: 13px; opacity: .8 } nav a { color: #ecebe6 }
      .k { margin-top: 64px; color: var(--a); font-size: 12px; letter-spacing: .2em; text-transform: uppercase }
      h1 { font: 300 clamp(48px, 9vw, 112px)/.95 system-ui, sans-serif; letter-spacing: -.05em; margin: 12px 0 8px }
      .tg { color: var(--a); font-size: 20px; margin: 0 0 24px }
      ul { padding-left: 18px } li::marker { color: var(--a) }
      .chips span { display: inline-block; margin: 0 6px 6px 0; padding: 4px 12px; border: 1px solid color-mix(in srgb, var(--a) 60%, transparent); border-radius: 99px; font-size: 12px }
      .cta { display: flex; flex-wrap: wrap; gap: 12px; margin: 28px 0 }
      .cta a { padding: 12px 20px; border-radius: 99px; text-decoration: none; font-weight: 600 }
      .wa { background: #25d366; color: #000 } .ln { background: #ecebe6; color: #000 } .bk { border: 1px solid var(--a); color: #ecebe6 }
      .g { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 40px; align-items: flex-start }
      figure { margin: 0 } figure img { display: block; width: 100%; height: auto; border-radius: 18px; box-shadow: 0 30px 60px -25px #000 }
      .ph { width: min(260px, 45%) } .wd { width: 100% }
      figcaption { font-size: 11px; opacity: .55; margin-top: 8px }
      .more { margin-top: 64px; border-top: 1px solid #ffffff22; padding-top: 24px } .more a { display: inline-block; margin: 0 16px 8px 0 }
    </style>
  </head>
  <body>
    <div class="w">
      <nav aria-label="Breadcrumb"><a href="/">${esc(site.name)}</a> / <a href="/#work">Work</a> / <span>${esc(p.name)}</span></nav>
      <p class="k">${p.id === 'opslin' ? 'My product' : String(projects.indexOf(p) + 1).padStart(2, '0')} · ${esc(p.kind)} · ${esc(p.where)}${p.status ? ` · ${esc(p.status)}` : ''}</p>
      <h1>${esc(p.name)}</h1>
      <p class="tg">${esc(p.tagline)}</p>
      <p>${esc(p.blurb)}</p>
      <h2>What we built</h2>
      <ul>${p.built.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      <div class="chips">${[...p.platforms, ...p.stack].map((s) => `<span>${esc(s)}</span>`).join('')}</div>
      <div class="cta">
        <a class="wa" href="${esc(waLink(waProject(p.name)))}">WhatsApp: build something like ${esc(p.name)}</a>
        ${p.links.map((l) => `<a class="ln" href="${esc(l.href)}" rel="noopener">${esc(l.label)} ↗</a>`).join('')}
        <a class="bk" href="/#work-${p.id}">See it in 3D ↗</a>
      </div>
      <div class="g">${shots}</div>
      <p class="more">Built by <a href="/">${esc(site.name)}</a>, ${esc(site.role)}. More work: ${others.map((o) => `<a href="${page(o)}">${esc(o.name)}</a>`).join('')}</p>
    </div>
  </body>
</html>
`
}

function llms() {
  return `# ${site.name} — ${site.role}

> ${site.description}

Handle: ${site.handle}. Location: ${site.location}. Contact: WhatsApp ${contact.whatsappDisplay} (${waLink(waHello)}), email ${site.email}${instagram ? `, Instagram ${instagram}` : ''}.

## Ventures
${ventures.map((v) => `- **${v.name}** (${v.role}) — ${v.kind}. ${v.blurb}${v.url ? ` ${v.url}` : ''}`).join('\n')}

## Products and case studies
${cases
  .map((p) => `- [${p.name}](${abs(page(p))}) — ${p.kind}, ${p.where}${p.status ? ` (${p.status})` : ''}. ${p.blurb} Built: ${p.built.join('; ')}. Platforms: ${p.platforms.join(', ')}. Stack: ${p.stack.join(', ')}.${p.links.map((l) => ` ${l.href}`).join('')}`)
  .join('\n')}

## Capabilities
${capabilities.map((c) => `- **${c.title}**: ${c.items.join(', ')}`).join('\n')}

## FAQ
${faq.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}
`
}

function robots() {
  const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended', 'CCBot']
  return `User-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}\n${SITE ? `\nSitemap: ${SITE}/sitemap.xml\n` : ''}`
}

function sitemap() {
  const url = (path: string, imgs: string[]) =>
    `  <url>\n    <loc>${esc(abs(path))}</loc>\n${[...new Set(imgs)].map((s) => `    <image:image><image:loc>${esc(abs(s))}</image:loc></image:image>`).join('\n')}\n  </url>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${url('/', ['/og/souvik.jpg', '/img/about_cap.webp'])}
${cases.map((p) => url(page(p), [`/og/${p.id}.jpg`, ...shotsOf(p).map((s) => s.src)])).join('\n')}
</urlset>
`
}

const manifest = () =>
  JSON.stringify(
    {
      name: `${site.name} — ${site.role}`,
      short_name: site.name,
      description: DESC,
      start_url: '/',
      display: 'standalone',
      background_color: '#000000',
      theme_color: '#000000',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  )

export default function seo(): Plugin {
  return {
    name: 'portfolio-seo',
    transformIndexHtml(html) {
      return html.replace('<!--seo-head-->', head()).replace('<!--ssg-->', prerender())
    },
    // dev: serve the case-study pages too, so links work before a build
    configureServer(server) {
      const files: Record<string, [string, () => string]> = {
        '/manifest.webmanifest': ['application/manifest+json', manifest],
        '/llms.txt': ['text/plain; charset=utf-8', llms],
        '/robots.txt': ['text/plain; charset=utf-8', robots],
      }
      server.middlewares.use((req, res, next) => {
        const f = files[req.url?.split('?')[0] ?? '']
        if (f) {
          res.setHeader('Content-Type', f[0])
          return res.end(f[1]())
        }
        const m = req.url?.match(/^\/work\/([a-z]+)\/?(\?.*)?$/)
        const p = m && cases.find((c) => c.id === m[1])
        if (!p) return next()
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(casePage(p))
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llms() })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() })
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifest() })
      for (const p of cases) this.emitFile({ type: 'asset', fileName: `work/${p.id}/index.html`, source: casePage(p) })
      if (SITE) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap() })
    },
  }
}
