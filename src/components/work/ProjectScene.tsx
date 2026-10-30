import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from '@/lib/gsap'
import { ArrowUpRight, Check } from 'lucide-react'
import { waLink, waProject, type Project } from '@/content'
import { Browser, LandscapePhone, Monitor, Phone } from './Devices'
import { openGallery } from './Lightbox'
import { WhatsAppIcon } from '../icons'

type Pose = { left: number; top: number; width: number; z: number; ry: number; rx: number; rz: number }

// dashboards shown in the 3D deck; the rest are one click away in the gallery
const DECK = 3

const FINE = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

// Final resting pose of every device, as % of the stage plus 3D rotation.
// Phone widths are capped by stage height so a tall phone never overflows.
function layout(p: Project, W: number, H: number) {
  const phoneW = (frac: number, hFrac: number, aspect: number) => Math.min(frac, ((hFrac * H) / aspect / W) * 100)
  const poses: Pose[] = []
  const nS = Math.min(p.screens.length, DECK)
  const nP = p.phones.length
  const sm = W < 700 // phones: bigger devices, tighter fan
  if (p.wide) {
    poses.push({ left: 50, top: 40, width: sm ? 98 : 94, z: 0, ry: 12, rx: 5, rz: 0 })
    poses.push({ left: sm ? 62 : 70, top: 73, width: sm ? 62 : 52, z: 170, ry: -16, rx: 6, rz: -2 })
    return poses
  }
  if (nS) {
    for (let i = 0; i < nS; i++)
      poses.push({ left: (sm ? 46 : 41) + i * (sm ? 4 : 6), top: (sm ? 28 : 33) + i * (sm ? 8 : 10), width: sm ? 94 : 80, z: -i * 140, ry: 16, rx: 5, rz: 0 })
    for (let j = 0; j < nP; j++) {
      const a = p.phones[j].h / p.phones[j].w + 0.08
      poses.push({ left: (sm ? 78 : 83) - j * (sm ? 24 : 17), top: 62 + j * 4, width: phoneW(sm ? 36 : 27, sm ? 0.56 : 0.6, a), z: 220 + j * 60, ry: -14, rx: 4, rz: j ? -3 : 2 })
    }
    return poses
  }
  if (nP === 1) {
    const a = p.phones[0].h / p.phones[0].w + 0.08
    poses.push({ left: 52, top: 50, width: phoneW(sm ? 62 : 50, sm ? 0.84 : 0.74, a), z: 0, ry: -14, rx: 5, rz: 2 })
    return poses
  }
  for (let j = 0; j < nP; j++) {
    const a = p.phones[j].h / p.phones[j].w + 0.08
    poses.push({ left: j ? (sm ? 71 : 70) : sm ? 31 : 33, top: j ? 48 : 52, width: phoneW(sm ? 48 : 42, sm ? 0.8 : 0.72, a), z: j ? 120 : 0, ry: j ? -16 : 16, rx: 4, rz: j ? 2 : -2 })
  }
  return poses
}

type SceneProps = { p: Project; index: number; total: number; label?: string; stacked?: boolean; last?: boolean }

export default function ProjectScene({ p, index, total, label = 'Client work', stacked = false, last = true }: SceneProps) {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const rig = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)

  // fetch and decode this scene's screenshots two screens early, so no image decodes mid-scroll
  useEffect(() => {
    const el = root.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        el.querySelectorAll('img').forEach((img) => {
          img.loading = 'eager'
          img.decode?.().catch(() => {})
        })
      },
      { rootMargin: '200% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useGSAP(
    () => {
      const st = stage.current!
      const devices = gsap.utils.toArray<HTMLElement>('.dv', st)
      const mm = gsap.matchMedia()

      const place = () => {
        const poses = layout(p, st.clientWidth, st.clientHeight)
        devices.forEach((el, i) => {
          const q = poses[i]
          gsap.set(el, { left: `${q.left}%`, top: `${q.top}%`, width: `${q.width}%`, xPercent: -50, yPercent: -50 })
        })
        return poses
      }

      mm.add(
        // `any` always matches, so phones (neither desktop nor reduced motion) still run
        { any: '(min-width: 0px)', desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean }
          const poses = place()
          const final = (i: number) => ({ z: poses[i].z, rotationY: poses[i].ry, rotationX: poses[i].rx, rotationZ: poses[i].rz, opacity: 1, y: 0 })
          if (reduce) {
            devices.forEach((el, i) => gsap.set(el, final(i)))
            return
          }
          const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: desktop
              ? { trigger: root.current, start: 'top 85%', end: 'top top', scrub: 0.6, invalidateOnRefresh: true }
              : { trigger: stage.current, start: 'top 90%', end: 'top 20%', scrub: 0.6, invalidateOnRefresh: true },
          })
          devices.forEach((el, i) => {
            tl.fromTo(
              el,
              { z: -900, rotationX: 55, rotationY: poses[i].ry * 2.2, rotationZ: 0, y: 160, opacity: 0 },
              { ...final(i), duration: 1, ease: 'power3.out' },
              i * 0.12,
            )
          })
          if (desktop) {
            // after the arrival, the whole rig turns slowly as you keep scrolling
            // while the card holds, the whole rig turns slowly with the scroll
            const hold = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 } })
            hold.fromTo(rig.current, { rotationY: 5 }, { rotationY: -5 }, 0)
            devices.forEach((el, i) => hold.to(el, { z: `+=${i % 2 ? 50 : -30}` }, 0))
            // the next project slides over this one: sink back and dim, like a card going under a deck
            if (!last) {
              gsap
                .timeline({ scrollTrigger: { trigger: root.current, start: 'bottom 200%', end: 'bottom 100%', scrub: true } })
                .to(panel.current, { scale: 0.9, yPercent: -4, ease: 'none' }, 0)
                .to(shade.current, { opacity: 0.7, ease: 'none' }, 0)
            }
          }
          // text lines rise in once
          gsap.from(root.current!.querySelectorAll('.tx'), {
            y: 26,
            opacity: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: 'power3.out',
            scrollTrigger: { trigger: root.current, start: 'top 65%', toggleActions: 'play none none reverse' },
          })
        },
      )

      // pointer tilt on the rig (mouse only)
      if (FINE && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const rx = gsap.quickTo(stage.current, 'rotationX', { duration: 0.8, ease: 'power3.out' })
        const ry = gsap.quickTo(stage.current, 'rotationY', { duration: 0.8, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = st.getBoundingClientRect()
          ry(((e.clientX - r.left) / r.width - 0.5) * 8)
          rx(-((e.clientY - r.top) / r.height - 0.5) * 6)
        }
        const leave = () => {
          rx(0)
          ry(0)
        }
        st.addEventListener('pointermove', move)
        st.addEventListener('pointerleave', leave)
        return () => {
          st.removeEventListener('pointermove', move)
          st.removeEventListener('pointerleave', leave)
        }
      }
    },
    { scope: root },
  )

  const num = String(index + 1).padStart(2, '0')
  const gallery = [...p.screens, ...p.phones, ...(p.wide ? [p.wide] : [])]
  const open = (k: number) => () => openGallery({ shots: gallery, index: k, title: p.name, accent: p.accent })

  return (
    <article
      ref={root}
      id={`work-${p.id}`}
      aria-labelledby={`work-${p.id}-title`}
      data-tone={p.tone}
      data-accent={p.accent}
      data-name={p.name}
      style={{ zIndex: index + 1 }}
      className={`relative lg:h-[300vh] ${stacked ? 'lg:-mt-[100vh]' : ''}`}
    >
      {/* an opaque card in the project's colours; the next project slides over it */}
      <div
        className="relative overflow-hidden rounded-t-[32px] shadow-[0_-30px_60px_-20px_rgba(0,0,0,.7)] lg:sticky lg:top-0 lg:h-[100dvh] lg:rounded-t-[44px]"
        style={{ background: `linear-gradient(180deg, ${p.tone}, ${p.tone} 60%, #000)` }}
      >
       <div ref={panel} className="relative h-full origin-top">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(55% 60% at 72% 52%, ${p.accent}55, transparent 70%), radial-gradient(40% 40% at 8% 90%, ${p.accent}22, transparent 70%)`,
          }}
          aria-hidden="true"
        />
        {/* the project's name, huge and faint, behind the devices */}
        <span
          className="pointer-events-none absolute -right-[4vw] bottom-[4vh] hidden select-none whitespace-nowrap font-display text-[17vw] font-black leading-none tracking-[-0.08em] lg:block"
          style={{ color: 'transparent', WebkitTextStroke: `1px ${p.accent}40` }}
          aria-hidden="true"
        >
          {p.name}
        </span>
        <div className="relative mx-auto grid h-full max-w-[1500px] grid-cols-1 items-center gap-6 px-5 pb-16 pt-20 sm:px-10 lg:grid-cols-[minmax(340px,0.8fr)_1.45fr] lg:gap-4 lg:px-16 lg:py-0">
          {/* copy */}
          <div className="relative z-10 max-w-xl">
            <div className="tx flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/45">
              <span className="font-display text-sm" style={{ color: p.accent }}>{num}</span>
              <span className="h-px w-8" style={{ background: p.accent }} />
              <span>
                {label} · {String(total).padStart(2, '0')}
              </span>
              {p.status && <span className="rounded-full border border-signal/50 px-2 py-0.5 text-[10px] tracking-[0.12em] text-signal">{p.status}</span>}
            </div>
            <div className="tx mt-6 flex items-center gap-4">
              {p.logo && (
                <span className="flex h-12 items-center rounded-xl bg-bone px-3">
                  <img src={p.logo} alt={`${p.name} logo`} className="h-7 w-auto max-w-[120px] object-contain" loading="lazy" decoding="async" />
                </span>
              )}
              <span className="text-xs text-white/50">
                {p.kind}
                <br />
                {p.where}
              </span>
            </div>
            <h3 id={`work-${p.id}-title`} className="tx mt-5 font-display text-5xl font-light leading-[0.95] tracking-[-0.06em] text-white sm:text-6xl xl:text-7xl">
              {p.name}
            </h3>
            <p className="tx mt-3 font-display text-lg font-light" style={{ color: p.accent }}>
              {p.tagline}
            </p>
            <p className="tx mt-5 text-sm leading-relaxed text-white/65 lg:[@media(max-height:760px)]:line-clamp-3">{p.blurb}</p>
            <ul className="tx mt-6 grid gap-2 text-[13px] text-white/80 sm:grid-cols-2 lg:[@media(max-height:820px)]:hidden">
              {p.built.map((b) => (
                <li key={b} className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: p.accent }} aria-hidden="true" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="tx mt-6 flex flex-wrap gap-1.5">
              {p.platforms.map((s) => (
                <span key={s} className="rounded-full px-3 py-1 text-[11px] font-semibold text-black" style={{ background: p.accent }}>
                  {s}
                </span>
              ))}
              {p.stack.map((s) => (
                <span key={s} className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/65">
                  {s}
                </span>
              ))}
            </div>
            <div className="tx mt-6 flex flex-wrap gap-3">
                {p.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener"
                    className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.04]"
                  >
                    {l.label}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ))}
                <a
                  href={waLink(waProject(p.name))}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                  style={{ borderColor: p.accent }}
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  Build something like {p.name}
                </a>
                <a href={`/work/${p.id}/`} className="inline-flex items-center gap-1 self-center px-1 text-sm text-white/70 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white">
                  Case study
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            {/* every screen, one tap from full size */}
            <div className="tx mt-6">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-white/45">View all {gallery.length} screens</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((g, k) => (
                  <button
                    key={g.src}
                    type="button"
                    onClick={open(k)}
                    aria-label={`Open ${g.alt}`}
                    className="h-14 shrink-0 overflow-hidden rounded-lg border border-white/15 transition-transform hover:-translate-y-0.5 hover:border-white/50"
                  >
                    <img src={g.src.replace('/work/', '/work/md/')} alt="" className="h-full w-auto" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3D stage */}
          <div className="relative h-[128vw] max-h-[820px] sm:h-[84vw] lg:h-[100dvh] lg:max-h-none [perspective:1800px]">
            <div ref={stage} className="absolute inset-0 [transform-style:preserve-3d]">
              <div ref={rig} className="absolute inset-0 [transform-style:preserve-3d]">
                {p.wide ? (
                  <>
                    <Monitor shot={p.wide} className="dv absolute" onOpen={open(gallery.length - 1)} />
                    <LandscapePhone shot={p.wide} className="dv absolute" onOpen={open(gallery.length - 1)} />
                  </>
                ) : (
                  <>
                    {p.screens.slice(0, DECK).map((s, k) => (
                      <Browser key={s.src} shot={s} className="dv absolute" onOpen={open(k)} />
                    ))}
                    {p.phones.map((s, k) => (
                      <Phone key={s.src} shot={s} className="dv absolute" onOpen={open(p.screens.length + k)} />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
       </div>
        <div ref={shade} className="pointer-events-none absolute inset-0 bg-black opacity-0" aria-hidden="true" />
      </div>
    </article>
  )
}
