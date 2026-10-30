import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react'
import { useFloating, useHover, useFocus, useInteractions, offset, flip, shift, arrow, FloatingArrow, FloatingPortal, autoUpdate } from '@floating-ui/react'
import { about } from '@/content'

function TiltPortrait() {
  const reduced = useReducedMotion()
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 140, damping: 18 })
  const sy = useSpring(my, { stiffness: 140, damping: 18 })
  const rotY = useTransform(sx, [0, 1], [-14, 14])
  const rotX = useTransform(sy, [0, 1], [12, -12])
  const glareX = useTransform(sx, [0, 1], ['0%', '100%'])
  const glareY = useTransform(sy, [0, 1], ['0%', '100%'])
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,.22), transparent 55%)`)

  return (
    <div className="[perspective:1200px]">
      <motion.div
        onPointerMove={(e) => {
          if (reduced) return
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onPointerLeave={() => {
          mx.set(0.5)
          my.set(0.5)
        }}
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
        className="relative aspect-[4/5] w-full max-w-[460px] rounded-[28px]"
        data-cursor="Tilt me"
      >
        <img
          src="/img/about_cap.webp"
          alt="Souvik, founder and COO of Shotlin and Opslin, in a cap with a red rim light"
          className="absolute inset-0 h-full w-full rounded-[28px] object-cover"
          loading="lazy"
          style={{ transform: 'translateZ(0px)' }}
        />
        <motion.div className="pointer-events-none absolute inset-0 rounded-[28px]" style={{ background: glare }} />
        {/* floating HUD layers at different depths */}
        <div className="pointer-events-none absolute inset-4 rounded-[20px] border border-white/15" style={{ transform: 'translateZ(40px)' }} />
        <div className="pointer-events-none absolute -left-4 top-8 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-[11px] text-white" style={{ transform: 'translateZ(90px)' }}>
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-signal" />
          Founder &amp; COO
        </div>
        <div className="pointer-events-none absolute -right-3 bottom-10 rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-[11px] leading-tight text-white/80" style={{ transform: 'translateZ(120px)' }}>
          <div className="font-display text-2xl text-white">2</div>
          companies, 7 brands
        </div>
      </motion.div>
    </div>
  )
}

function Tool({ name, note }: { name: string; note: string }) {
  const [open, setOpen] = useState(false)
  const arrowRef = useRef<SVGSVGElement>(null)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 8 }), arrow({ element: arrowRef })],
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([useHover(context, { move: false }), useFocus(context)])

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-bone transition-colors hover:border-signal hover:text-white focus-visible:border-signal focus-visible:outline-none"
      >
        {name}
      </button>
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-[80] max-w-[240px] rounded-xl border border-white/10 bg-graphite px-3 py-2 text-xs text-white/85 shadow-2xl"
          >
            {note}
            <FloatingArrow ref={arrowRef} context={context} className="fill-graphite" />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export default function About() {
  return (
    <section id="about" data-tone="#1a0707" data-accent="#ff2a1f" className="relative px-5 py-28 sm:px-10 md:px-16 md:py-40">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-[1fr_1.1fr]">
        <TiltPortrait />
        <div>
          <h2 data-drop className="font-display text-4xl font-light leading-[1.05] tracking-[-0.05em] text-white sm:text-6xl">
            The operator
            <br />
            behind the products.
          </h2>
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-white/70">
            {about.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          <h3 className="mt-12 text-sm text-white/40">What I bring, hover for detail</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {about.toolbox.map((t) => (
              <Tool key={t.name} {...t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
