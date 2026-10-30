import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

export type ToneDetail = { name: string; accent: string }

// The page colour follows whatever is on screen: every section carries data-tone (deep
// background) and data-accent; this layer crossfades between them. One fixed div, one
// background-color tween per section change — nothing re-renders.
export default function Atmosphere({ booted }: { booted: boolean }) {
  const layer = useRef<HTMLDivElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const head = useRef<HTMLSpanElement>(null)
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (!booted) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const root = document.documentElement
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-tone]').forEach((el) => {
        const apply = () => {
          gsap.to(layer.current, { backgroundColor: el.dataset.tone, duration: reduce ? 0 : 0.9, ease: 'power2.out', overwrite: 'auto' })
          root.style.setProperty('--accent', el.dataset.accent || '#ff2a1f')
          setLabel(el.dataset.name || '')
          window.dispatchEvent(new CustomEvent<ToneDetail>('section-tone', { detail: { name: el.dataset.name || '', accent: el.dataset.accent || '#ff2a1f' } }))
        }
        ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onEnter: apply, onEnterBack: apply })
      })

      // the thread: draws from the top of the page to the bottom as you scroll
      const thread = { start: 0, end: 'max', scrub: reduce ? true : 0.4 }
      gsap.fromTo(fill.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: thread })
      const rail = head.current!.parentElement!
      gsap.fromTo(head.current, { y: 0 }, { y: () => rail.clientHeight, ease: 'none', scrollTrigger: { ...thread, invalidateOnRefresh: true } })

      // headings and marked blocks wipe in from top to bottom
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>('[data-drop]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(0% 0% 100% 0%)', y: -36 },
            { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' } },
          )
        })
      }
    })
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [booted])

  return (
    <>
      <div ref={layer} className="pointer-events-none fixed inset-0 z-0 bg-black" aria-hidden="true" />
      {booted && (
        <div className="pointer-events-none fixed bottom-[12vh] left-2 top-[12vh] z-40 w-px sm:left-4 lg:left-6" aria-hidden="true">
          <div className="absolute inset-0 bg-white/10" />
          <div ref={fill} className="absolute inset-0 origin-top bg-[linear-gradient(180deg,transparent,var(--accent,#ff2a1f))]" style={{ transform: 'scaleY(0)' }} />
          {/* glowing head riding the end of the line */}
          <span ref={head} className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent,#ff2a1f)] shadow-[0_0_14px_3px_var(--accent,#ff2a1f)]" />
          {label && (
            <span className="absolute -bottom-7 left-3 hidden whitespace-nowrap text-[9px] uppercase tracking-[0.25em] text-[var(--accent,#ff2a1f)] lg:block">{label}</span>
          )}
        </div>
      )}
    </>
  )
}
