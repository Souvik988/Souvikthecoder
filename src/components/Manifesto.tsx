import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, SplitText } from '@/lib/gsap'
import { manifesto, manifestoMarquee } from '@/content'

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const text = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create(text.current, { type: 'words', wordsClass: 'mf-word' })
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          split.words,
          { opacity: 0.12, yPercent: 30 },
          {
            opacity: 1,
            yPercent: 0,
            stagger: 0.1,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: '+=150%', scrub: 0.6, pin: true },
          },
        )
      })
      return () => split.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} data-tone="#000000" data-accent="#ff2a1f" className="relative flex min-h-[100dvh] items-center overflow-hidden bg-black px-5 sm:px-10 md:px-16" aria-label="Manifesto">
      <div className="pointer-events-none absolute inset-x-0 top-10 overflow-hidden whitespace-nowrap opacity-60" aria-hidden="true">
        <div className="marquee inline-block font-display text-[13vw] font-black leading-none tracking-[-0.06em] outline-text">
          {manifestoMarquee.repeat(3)}
        </div>
      </div>
      <p
        ref={text}
        className="relative mx-auto max-w-6xl font-display text-[8.5vw] font-light leading-[1.05] tracking-[-0.05em] text-bone sm:text-[5.6vw] lg:text-[4.6vw]"
      >
        {manifesto}
      </p>
    </section>
  )
}
