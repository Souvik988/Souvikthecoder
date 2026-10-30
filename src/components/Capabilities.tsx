import { useRef } from 'react'
import { capabilities } from '@/content'

const FINE = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

// A card that leans toward the cursor. Writes two CSS variables; the browser does the rest.
function Card({ c, i }: { c: (typeof capabilities)[number]; i: number }) {
  const el = useRef<HTMLElement>(null)
  return (
    <article
      ref={el}
      onPointerMove={(e) => {
        if (!FINE || !el.current) return
        const r = el.current.getBoundingClientRect()
        el.current.style.setProperty('--rx', `${(-(e.clientY - r.top) / r.height + 0.5) * 10}deg`)
        el.current.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`)
        el.current.style.setProperty('--gx', `${((e.clientX - r.left) / r.width) * 100}%`)
        el.current.style.setProperty('--gy', `${((e.clientY - r.top) / r.height) * 100}%`)
      }}
      onPointerLeave={() => {
        el.current?.style.setProperty('--rx', '0deg')
        el.current?.style.setProperty('--ry', '0deg')
      }}
      style={{ ['--c' as string]: c.color }}
      className={`cap-card group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[.035] p-6 sm:p-7 ${i === 0 ? 'md:col-span-2' : ''} ${i === capabilities.length - 1 ? 'md:col-span-2' : ''}`}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(380px circle at var(--gx,50%) var(--gy,50%), ${c.color}33, transparent 60%)` }}
        aria-hidden="true"
      />
      <span className="absolute inset-x-0 top-0 h-px opacity-70" style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }} aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="font-display text-xs" style={{ color: c.color }}>{String(i + 1).padStart(2, '0')}</span>
        <span className="h-2 w-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 16px 2px ${c.color}` }} aria-hidden="true" />
      </div>
      <h3 className="relative mt-8 font-display text-2xl font-light tracking-[-0.04em] text-white sm:text-3xl">{c.title}</h3>
      <p className="relative mt-2 text-[13px] text-white/50">{c.note}</p>
      <ul className="relative mt-6 flex flex-wrap gap-1.5">
        {c.items.map((s) => (
          <li key={s} className="rounded-full border border-white/12 bg-white/[.03] px-3 py-1 text-[12px] text-white/80 transition-colors group-hover:border-[color:var(--c)] group-hover:text-white">
            {s}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function Capabilities() {
  return (
    <section id="skills" aria-labelledby="skills-title" data-tone="#0b0720" data-accent="#8c74ff" className="relative px-5 py-28 sm:px-10 lg:px-16 lg:py-40">
      <div className="mx-auto max-w-[1500px]">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Capabilities</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 data-drop id="skills-title" className="font-display text-5xl font-light leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl">
            From the app
            <br />
            <span className="outline-text">to the server.</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            Mobile, AI, DevOps, architecture and the operations to run it all. The full stack of a product company, not just the front of it.
          </p>
        </div>
        <div className="mt-14 grid gap-4 [perspective:1400px] md:grid-cols-3">
          {capabilities.map((c, i) => (
            <Card key={c.id} c={c} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
