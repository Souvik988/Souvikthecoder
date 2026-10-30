import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { gsap } from '@/lib/gsap'

const BOOT = ['mounting neural mesh', 'decoding depth maps', 'calibrating gaze vector', 'stoking the fire', 'subject online']

export default function Loader({ onDone }: { onDone: () => void }) {
  const { progress, active } = useProgress()
  const [shown, setShown] = useState(0)
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const started = useRef(performance.now())
  const exiting = useRef(false)

  // ease the visible counter toward real progress so it never jumps
  useEffect(() => {
    let raf = 0
    const tick = () => {
      setShown((s) => {
        const elapsed = (performance.now() - started.current) / 1800
        const target = Math.min(progress, elapsed * 100)
        return s + (target - s) * 0.12
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [progress])

  useEffect(() => {
    if (exiting.current || shown < 99.5 || active) return
    exiting.current = true
    gsap.timeline({ onComplete: () => setGone(true) })
      .to('.ld-line', { opacity: 0, duration: 0.25, stagger: 0.03 })
      .to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, 0.2)
      .add(onDone, 0.55)
  }, [shown, active, onDone])

  if (gone) return null
  const pct = Math.min(100, Math.round(shown))
  const step = Math.min(BOOT.length - 1, Math.floor((pct / 100) * BOOT.length))

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-black p-5 text-bone sm:p-10"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
      role="status"
      aria-label={`Loading ${pct}%`}
    >
      <div className="ld-line flex justify-between text-[11px] tracking-[0.2em] text-white/50">
        <span>souvik.exe</span>
        <span>v.2026</span>
      </div>
      <div className="ld-line">
        <div className="mb-6 space-y-1 text-[11px] text-white/40">
          {BOOT.slice(0, step + 1).map((b, i) => (
            <div key={b} className={i === step ? 'text-white' : ''}>
              {i === step ? '> ' : '  '}
              {b}
              {i === step && <span className="blink">_</span>}
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between gap-6">
          <div className="font-display text-[22vw] font-light leading-[0.8] tracking-[-0.08em] sm:text-[14vw]">
            {String(pct).padStart(3, '0')}
          </div>
          <div className="mb-3 hidden w-1/3 sm:block">
            <div className="h-px w-full bg-white/10">
              <div className="h-px bg-signal" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
