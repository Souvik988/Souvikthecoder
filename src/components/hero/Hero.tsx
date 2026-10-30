import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { useGSAP } from '@gsap/react'
import { ArrowUpRight } from 'lucide-react'
import PortraitScene, { type HeroCtrl } from './PortraitScene'
import ArcStats from './ArcStats'
import { hero } from '@/content'

type Mode = 'away' | 'locked' | 'burning'

const FINE = typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
const HINT: Record<Mode, string> = {
  away: 'Scroll, he will look at you',
  locked: FINE ? 'Hover his face' : 'Touch his face',
  burning: FINE ? 'Stay there. Let it spread.' : 'Hold it. Let it spread.',
}
// leave the page alone this long and he goes back to looking away
const IDLE_MS = 4000
const NAV_KEYS = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home']

export default function Hero({ booted }: { booted: boolean }) {
  const root = useRef<HTMLElement>(null)
  const ctrl = useRef<HeroCtrl>({
    gaze: 0, glitch: 0, intro: 0, scroll: 0, px: 0, py: 0,
    pointerIn: false, armed: false, fire: 0, spread: 0,
    reduced: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  })
  const [mode, setMode] = useState<Mode>('away')
  const [active, setActive] = useState(true)
  const turned = useRef(false)
  const onFace = useRef(false)
  const lastActive = useRef(0)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // render the GL scene only while the hero is on screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 })
    if (root.current) io.observe(root.current)
    return () => io.disconnect()
  }, [])

  const { contextSafe } = useGSAP(
    () => {
      if (!booted) return
      const c = ctrl.current
      gsap.to(c, { intro: 1, duration: c.reduced ? 0.01 : 2.4, ease: 'power3.out' })
      gsap.to(c, {
        scroll: 1,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root, dependencies: [booted] },
  )

  // the turn: a fast glitch-cut from the side profile to dead-on eye contact
  const turn = contextSafe(() => {
    lastActive.current = performance.now()
    if (turned.current) return
    turned.current = true
    const c = ctrl.current
    const k = c.reduced ? 0.01 : 1
    tl.current?.kill()
    tl.current = gsap.timeline({ onComplete: () => { c.armed = true } })
      .to(c, { glitch: 0.9, duration: 0.12 * k, ease: 'power2.out' }, 0)
      .to(c, { gaze: 2, duration: 0.8 * k, ease: 'power3.inOut' }, 0)
      .to(c, { glitch: 0, duration: 0.5 * k, ease: 'power2.in' }, 0.45 * k)
    setMode('locked')
  })

  // nobody's touching the page: he loses interest and looks away again
  const lookAway = contextSafe(() => {
    if (!turned.current || onFace.current) return
    turned.current = false
    const c = ctrl.current
    c.armed = false
    const k = c.reduced ? 0.01 : 1
    tl.current?.kill()
    tl.current = gsap.timeline()
      .to(c, { glitch: 0.6, duration: 0.12 * k }, 0)
      .to(c, { gaze: 0, duration: 0.9 * k, ease: 'power3.inOut' }, 0)
      .to(c, { glitch: 0, duration: 0.5 * k, ease: 'power2.in' }, 0.45 * k)
    setMode('away')
  })

  const fns = useRef({ turn, lookAway })
  fns.current = { turn, lookAway }

  // scrolling (or trying to, at the very top) is what catches his attention
  useEffect(() => {
    if (!booted) return
    lastActive.current = performance.now()
    const wake = () => fns.current.turn()
    const touch = () => (lastActive.current = performance.now())
    const onKey = (e: KeyboardEvent) => NAV_KEYS.includes(e.key) && wake()
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('wheel', wake, { passive: true })
    window.addEventListener('touchmove', wake, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', touch, { passive: true })
    const idle = window.setInterval(() => {
      const heroInView = window.scrollY < window.innerHeight * 0.6
      if (heroInView && performance.now() - lastActive.current > IDLE_MS) fns.current.lookAway()
    }, 400)
    return () => {
      window.removeEventListener('scroll', wake)
      window.removeEventListener('wheel', wake)
      window.removeEventListener('touchmove', wake)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', touch)
      window.clearInterval(idle)
    }
  }, [booted])

  // pointer in hero space; a mouse "hovers", a finger only counts while it is down
  useEffect(() => {
    const c = ctrl.current
    const place = (e: PointerEvent) => {
      const r = root.current?.getBoundingClientRect()
      if (!r) return false
      c.px = ((e.clientX - r.left) / r.width) * 2 - 1
      c.py = -(((e.clientY - r.top) / r.height) * 2 - 1)
      return e.clientY >= r.top && e.clientY <= r.bottom
    }
    const move = (e: PointerEvent) => {
      const inside = place(e)
      if (e.pointerType === 'mouse') c.pointerIn = inside
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && place(e)) c.pointerIn = true
    }
    const up = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') c.pointerIn = false
    }
    const leave = () => (c.pointerIn = false)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', up, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])

  // the scene tells us when the cursor lands on his face
  useEffect(() => {
    ctrl.current.onFace = (on) => {
      onFace.current = on
      if (on) fns.current.turn()
      if (turned.current) setMode(on ? 'burning' : 'locked')
    }
  }, [])

  return (
    <section ref={root} id="top" data-tone="#000000" data-accent="#ff2a1f" className="relative h-[100dvh] min-h-[560px] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <PortraitScene ctrl={ctrl} active={active} />
      </div>

      {/* readability falloff under the copy */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black via-black/70 to-transparent sm:from-black/80" />

      <ArcStats start={booted} />

      {/* copy */}
      {booted && (
        <div className="absolute bottom-20 left-5 right-5 z-50 sm:right-auto sm:bottom-16 sm:left-8 sm:max-w-md md:bottom-20 md:left-12">
          <p className="hero-rise text-[11px] font-semibold tracking-[0.12em] text-white/90 sm:text-xs" style={{ animationDelay: '0.15s' }}>
            {hero.eyebrow}
          </p>
          <h1
            className="hero-rise mt-3 font-display text-4xl font-light leading-[1.05] tracking-[-0.06em] text-white sm:mt-4 sm:text-5xl md:text-6xl"
            style={{ animationDelay: '0.3s' }}
          >
            {hero.human.map((l, i) => (
              <span key={i} className="block whitespace-nowrap">
                {l}
              </span>
            ))}
          </h1>
          <p className="hero-rise mt-5 hidden text-sm leading-relaxed text-white/80 sm:block sm:text-[15px]" style={{ animationDelay: '0.5s' }}>
            {hero.body}
          </p>
          <div className="hero-rise mt-6 flex flex-wrap items-center gap-3 sm:mt-7" style={{ animationDelay: '0.7s' }}>
            <a
              href="#work"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-[1.04] active:scale-95 sm:px-8 sm:py-3.5"
            >
              <span className="relative z-10">See the work</span>
              <ArrowUpRight className="relative z-10 h-4 w-4" />
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href="#contact"
              className="rounded-full border border-white/15 bg-black/60 px-5 py-3 text-sm text-white transition-colors sm:px-6 hover:border-white/50 sm:py-3.5"
            >
              Get in touch
            </a>
          </div>
        </div>
      )}

      {/* what to do next — kept in the corner, off his face */}
      {booted && (
        <div
          aria-live="polite"
          className="hero-rise pointer-events-none absolute bottom-7 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/70 px-4 py-2 text-[11px] tracking-wide text-white/90 sm:bottom-8 sm:left-auto sm:right-8 sm:translate-x-0 md:right-12"
          style={{ animationDelay: '1.2s' }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
          </span>
          {HINT[mode]}
        </div>
      )}
    </section>
  )
}
