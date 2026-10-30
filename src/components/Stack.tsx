import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { stack } from '@/content'

const StackScene = lazy(() => import('./StackScene'))

export default function Stack() {
  const root = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // build the 3D scene well before it scrolls in (so shader compile and font loading never
  // land mid-scroll), but only render frames while it is actually on screen
  useEffect(() => {
    const warm = new IntersectionObserver(([e]) => e.isIntersecting && setMounted(true), { rootMargin: '250% 0px' })
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '0px' })
    // or simply whenever the browser is idle after load, whichever comes first
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500))
    const idle = ric(() => setMounted(true), { timeout: 8000 })
    if (root.current) {
      warm.observe(root.current)
      io.observe(root.current)
    }
    return () => {
      window.cancelIdleCallback?.(idle)
      warm.disconnect()
      io.disconnect()
    }
  }, [])

  return (
    <section id="stack" ref={root} data-tone="#000000" data-accent="#ff2a1f" className="relative h-[100dvh] min-h-[600px] overflow-hidden bg-black" data-cursor="Drag to spin">
      <div className="pointer-events-none absolute left-5 top-24 z-10 max-w-sm sm:left-10 md:left-16">
        <h2 className="font-display text-5xl font-light leading-[0.95] tracking-[-0.06em] text-white sm:text-7xl">
          The stack
          <br />
          in orbit
        </h2>
        <p className="mt-6 text-sm leading-relaxed text-white/60">Every tool across Shotlin and Opslin. Drag the sphere; the core reacts to your pointer.</p>
      </div>
      <div className="absolute inset-0">{mounted && <Suspense fallback={null}><StackScene active={visible} /></Suspense>}</div>
      {/* accessible list for screen readers / no-GL */}
      <ul className="sr-only">
        {stack.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </section>
  )
}
