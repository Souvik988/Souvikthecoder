import { projects } from '@/content'
import { scrollToHash } from '@/lib/smooth'
import ProjectScene from './work/ProjectScene'

export default function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="relative">
      <header data-tone="#0a0716" data-accent="#a46bff" className="mx-auto max-w-[1500px] px-5 pb-10 pt-28 sm:px-10 lg:px-16 lg:pt-40">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Built at Shotlin</p>
        <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <h2 data-drop id="work-title" className="font-display text-5xl font-light leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl">
            Products,
            <br />
            <span className="outline-text">not prototypes.</span>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            Quick commerce in Surat and Hyderabad, a marketplace in Delhi, garment care in Pune, retail AI and a game. Real apps, real dashboards, real users. Scroll through each one in 3D.
          </p>
        </div>

        {/* index: every project, one tap away */}
        <nav aria-label="Projects" className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4 lg:grid-cols-7">
          {projects.map((p, i) => (
            <a
              key={p.id}
              href={`#work-${p.id}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToHash(`#work-${p.id}`)
              }}
              className="group flex flex-col gap-3 bg-[#0a0716]/80 p-4 transition-colors hover:bg-white/[.06]"
              style={{ boxShadow: `inset 0 -2px 0 ${p.accent}` }}
            >
              <span className="flex items-center justify-between text-[11px] text-white/40">
                {String(i + 1).padStart(2, '0')}
                <span className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150" style={{ background: p.accent }} />
              </span>
              <span className="font-display text-lg leading-none tracking-tight text-white">{p.name}</span>
              <span className="text-[11px] leading-snug text-white/45">{p.kind}</span>
            </a>
          ))}
        </nav>
      </header>

      {projects.map((p, i) => (
        <ProjectScene
          key={p.id}
          p={p}
          index={i}
          total={projects.length}
          label={p.id === 'rustbloom' ? 'Our game' : 'Client work'}
          stacked={i > 0}
          last={i === projects.length - 1}
        />
      ))}
    </section>
  )
}
