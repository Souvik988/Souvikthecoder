import { ArrowUpRight } from 'lucide-react'
import { ventures, opslinProject } from '@/content'
import ProjectScene from './work/ProjectScene'

export default function Ventures() {
  return (
    <section id="ventures" aria-labelledby="ventures-title" className="relative">
      <div data-tone="#120707" data-accent="#ff2a1f" className="mx-auto max-w-[1500px] px-5 pt-28 sm:px-10 lg:px-16 lg:pt-40">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Ventures</p>
        <h2 data-drop id="ventures-title" className="mt-4 font-display text-5xl font-light leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl">
          Two companies.
          <br />
          <span className="outline-text">One operator.</span>
        </h2>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {ventures.map((v, i) => (
            <article
              key={v.id}
              className="group relative overflow-hidden rounded-[28px] border border-white/10 p-7 sm:p-10"
              style={{ background: `radial-gradient(120% 90% at 100% 0%, ${v.id === 'opslin' ? 'rgba(47,211,138,.22)' : 'rgba(255,42,31,.22)'}, transparent 60%), linear-gradient(160deg,#16171a,#070708)` }}
            >
              {/* oversized wordmark that sits behind the card copy */}
              <span
                className="pointer-events-none absolute -right-6 -top-6 select-none font-display text-[9rem] font-black leading-none tracking-[-0.08em] text-white/[.035] transition-transform duration-700 group-hover:-translate-x-4 sm:text-[12rem]"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative flex items-center justify-between gap-4">
                {v.id === 'opslin' ? (
                  <img src="/brands/opslin-white.webp" alt="Opslin" className="h-8 w-auto" loading="lazy" decoding="async" />
                ) : (
                  <span className="font-display text-3xl font-black tracking-[-0.06em] text-white">
                    shotlin<span className="text-signal">.</span>
                  </span>
                )}
                <span className="rounded-full border border-signal/40 bg-signal/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-signal">{v.role}</span>
              </div>
              <p className="relative mt-8 text-[11px] uppercase tracking-[0.18em] text-white/45">{v.kind}</p>
              <h3 className="relative mt-2 font-display text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">{v.tagline}</h3>
              <p className="relative mt-4 max-w-lg text-sm leading-relaxed text-white/65">{v.blurb}</p>
              <ul className="relative mt-6 grid gap-2 sm:grid-cols-2">
                {v.points.map((pt) => (
                  <li key={pt} className="rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-[13px] text-white/80">
                    {pt}
                  </li>
                ))}
              </ul>
              {v.url ? (
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener"
                  className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.04]"
                >
                  Visit {v.name}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : (
                <a href="#work" className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm text-white transition-colors hover:border-white/60">
                  See what Shotlin shipped
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </article>
          ))}
        </div>
      </div>

      <ProjectScene p={opslinProject} index={0} total={1} label="My product" />
    </section>
  )
}
