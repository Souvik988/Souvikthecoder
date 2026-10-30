import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'
import { Mail, ArrowUpRight, Globe } from 'lucide-react'
import { MagneticDock, type DockItemData } from '@/components/ui/magnetic-dock'
import { site, contact, waLink, waHello } from '@/content'
import { WhatsAppIcon, InstagramIcon } from './icons'

function MagneticButton({ children, href, external }: { children: React.ReactNode; href: string; external?: boolean }) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 14 })
  const sy = useSpring(y, { stiffness: 200, damping: 14 })
  return (
    <motion.a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener' })}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (reduced) return
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - r.left - r.width / 2) * 0.35)
        y.set((e.clientY - r.top - r.height / 2) * 0.35)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className="group relative inline-flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-[#25d366] text-center text-sm font-semibold text-black shadow-[0_30px_70px_-20px_rgba(37,211,102,.75)] sm:h-48 sm:w-48"
    >
      <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-out group-hover:translate-y-0" />
      <span className="relative flex flex-col items-center gap-1">{children}</span>
    </motion.a>
  )
}

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const open = (href: string) => () => window.open(href, '_blank', 'noopener')
  const items: DockItemData[] = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <WhatsAppIcon />, onClick: open(waLink(waHello)) },
    ...(contact.instagram
      ? [{ id: 'instagram', label: 'Instagram', icon: <InstagramIcon />, onClick: open(`https://www.instagram.com/${contact.instagram}/`) }]
      : []),
    { id: 'mail', label: 'Email', icon: <Mail className="h-full w-full" />, onClick: () => (window.location.href = `mailto:${site.email}`) },
    { id: 'opslin', label: 'Opslin', icon: <Globe className="h-full w-full" />, onClick: open('https://www.opslin.com/') },
  ]

  return (
    <section id="contact" ref={ref} data-tone="#170303" data-accent="#ff2a1f" className="relative overflow-hidden px-5 pb-24 pt-28 sm:px-10 md:px-16 md:pt-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_50%_40%,rgba(255,42,31,.22),transparent_70%)]" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl">
        <h2 data-drop className="font-display text-[13vw] font-light leading-[0.9] tracking-[-0.07em] text-white md:text-[9vw]">
          Let's build
          <br />
          <span className="outline-text">something</span>
          <br />
          that looks back.
        </h2>

        <div className="mt-16 flex flex-col items-start gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md text-[15px] leading-relaxed text-white/70">
            Building a product, a marketplace or the infrastructure under one? Shotlin and Opslin take ideas from first screen to running server. Tell me what you're making.
            <a href={waLink(waHello)} target="_blank" rel="noopener" className="mt-6 flex items-center gap-3 font-display text-xl text-white transition-colors hover:text-[#25d366] sm:text-2xl">
              <WhatsAppIcon className="h-6 w-6 text-[#25d366]" />
              {contact.whatsappDisplay}
              <ArrowUpRight className="h-5 w-5" />
            </a>
            <a href={`mailto:${site.email}`} className="mt-3 flex items-center gap-3 font-display text-lg text-white/80 underline decoration-white/20 underline-offset-8 transition-colors hover:decoration-signal">
              <Mail className="h-5 w-5" />
              {site.email}
            </a>
          </div>
          <MagneticButton href={waLink(waHello)} external>
            <WhatsAppIcon className="mb-1 h-7 w-7" />
            Chat on
            <br />
            WhatsApp
          </MagneticButton>
        </div>

        <div className="mt-20 flex justify-center">
          <MagneticDock items={items} iconSize={48} maxScale={1.6} variant="glass" className="dark:bg-white/5 dark:border-white/10" />
        </div>

      </div>
    </section>
  )
}
