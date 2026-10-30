import { useEffect, useRef, useState } from 'react'

// A lagging ring that reads `data-cursor` from whatever it hovers.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const [enabled] = useState(() => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)

  useEffect(() => {
    if (!enabled) return
    document.body.classList.add('has-cursor')
    const pos = { x: -100, y: -100 }
    const lag = { x: -100, y: -100 }
    let raf = 0
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const t = (e.target as HTMLElement).closest<HTMLElement>('a,button,[data-cursor]')
      const interactive = t && (t.tagName === 'A' || t.tagName === 'BUTTON')
      setLabel(interactive ? '' : t?.dataset.cursor ?? '')
      ring.current?.classList.toggle('scale-150', !!interactive)
    }
    const loop = () => {
      lag.x += (pos.x - lag.x) * 0.16
      lag.y += (pos.y - lag.y) * 0.16
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`
      if (ring.current) ring.current.style.translate = `${lag.x}px ${lag.y}px`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      document.body.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[95]" aria-hidden="true">
      <div ref={dot} className="absolute -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-white" />
      <div ref={ring} className="absolute -ml-5 -mt-5 h-10 w-10 rounded-full border border-white/70 transition-transform duration-300">
        {label && (
          <span className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-medium text-black">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
