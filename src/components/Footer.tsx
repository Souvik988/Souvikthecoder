import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { site } from '@/content'
import { scrollToHash } from '@/lib/smooth'
import { Logo } from './Nav'

function LocalTime() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setT(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return <>{t.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST</>
}

// The sign-off: one giant line, edge to edge, in the same voice as the hero's name.
const WORDS = "LET'S SHIP"

export default function Footer() {
  const root = useRef<HTMLElement>(null)
  const line = useRef<HTMLDivElement>(null)

  // size the line so it always spans the page width exactly
  useEffect(() => {
    const el = line.current!
    const fit = () => {
      el.style.fontSize = '100px'
      el.style.fontSize = `${(100 * el.parentElement!.clientWidth * 0.97) / el.scrollWidth}px`
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el.parentElement!)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  // letters rise into place as you reach the end of the page
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ft-l',
        { yPercent: 105 },
        { yPercent: 0, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: line.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } },
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <footer ref={root} data-tone="#000000" data-accent="#ff2a1f" className="relative z-[1] overflow-hidden bg-black">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 border-t border-white/10 px-5 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
        <span className="flex items-center gap-2 text-white/80">
          <Logo size={14} /> {site.name} © {new Date().getFullYear()} · {site.role}
        </span>
        <span>
          {site.location} · <LocalTime />
        </span>
        <button type="button" onClick={() => scrollToHash('#top')} className="inline-flex items-center gap-1.5 self-start text-white/80 hover:text-white sm:self-auto">
          Back to top <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="overflow-hidden px-[1.5vw] pb-[1vw]">
        <div ref={line} aria-label="Let's ship." className="inline-flex w-max whitespace-nowrap font-display font-black leading-[0.82] tracking-[-0.06em] text-bone">
          {WORDS.split('').map((ch, i) => (
            <span key={i} aria-hidden="true" className="ft-l inline-block">
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
          <span aria-hidden="true" className="ft-l inline-block text-signal">
            .
          </span>
        </div>
      </div>
    </footer>
  )
}
