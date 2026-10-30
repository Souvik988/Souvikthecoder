import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Shot } from '@/content'
import { getLenis } from '@/lib/smooth'

export type GalleryDetail = { shots: Shot[]; index: number; title: string; accent: string }

// Call from anywhere: openGallery({ shots, index, title, accent })
export const openGallery = (d: GalleryDetail) => window.dispatchEvent(new CustomEvent<GalleryDetail>('open-gallery', { detail: d }))

// Full-size screenshot viewer: arrows, keys, swipe, and a thumbnail rail.
export default function Lightbox() {
  const [g, setG] = useState<GalleryDetail | null>(null)
  const [i, setI] = useState(0)
  const touch = useRef(0)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)

  const close = useCallback(() => {
    setG(null)
    getLenis()?.start()
    lastFocus.current?.focus()
  }, [])

  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<GalleryDetail>).detail
      lastFocus.current = document.activeElement as HTMLElement
      setG(d)
      setI(d.index)
      getLenis()?.stop()
    }
    window.addEventListener('open-gallery', onOpen)
    return () => window.removeEventListener('open-gallery', onOpen)
  }, [])

  const n = g?.shots.length ?? 0
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n])

  useEffect(() => {
    if (!g) return
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [g, go, close])

  if (!g) return null
  const s = g.shots[i]
  const tall = s.h > s.w

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${g.title} screens`}
      className="fixed inset-0 z-[120] flex flex-col bg-[rgba(4,4,6,.96)] backdrop-blur-md"
      onClick={close}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className="flex items-center justify-between px-5 py-4 text-sm text-white/80 sm:px-8" onClick={(e) => e.stopPropagation()}>
        <span>
          <span className="font-display text-white" style={{ color: g.accent }}>
            {g.title}
          </span>
          <span className="ml-3 text-white/45">
            {i + 1} / {n}
          </span>
        </span>
        <button ref={closeBtn} type="button" onClick={close} className="rounded-full border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          width={s.w}
          height={s.h}
          onClick={(e) => e.stopPropagation()}
          className={`lb-in max-h-full rounded-2xl object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,.9)] ${tall ? 'h-full w-auto' : 'h-auto w-full max-w-6xl'}`}
        />
        {n > 1 && (
          <>
            <button type="button" onClick={(e) => (e.stopPropagation(), go(-1))} className="absolute left-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6" aria-label="Previous screen">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={(e) => (e.stopPropagation(), go(1))} className="absolute right-2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6" aria-label="Next screen">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <p className="px-5 pt-3 text-center text-xs text-white/55" onClick={(e) => e.stopPropagation()}>
        {s.alt}
      </p>
      {n > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
          {g.shots.map((t, k) => (
            <button
              key={t.src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Screen ${k + 1}`}
              className={`h-14 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity ${k === i ? 'opacity-100' : 'border-transparent opacity-50 hover:opacity-90'}`}
              style={k === i ? { borderColor: g.accent } : undefined}
            >
              <img src={t.src.replace('/work/', '/work/md/')} alt="" className="h-full w-auto" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
