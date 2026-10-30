import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { nav, site } from '@/content'
import { scrollToHash } from '@/lib/smooth'

export function Logo({ size = 22 }: { size?: number }) {
  // angular S-mark, adapted from the geometric logo in the reference
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
    </svg>
  )
}

export default function Nav({ show }: { show: boolean }) {
  const [open, setOpen] = useState(false)
  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    scrollToHash(href)
  }
  if (!show) return null

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-between p-4 sm:p-5 md:justify-center" aria-label="Main">
        {/* desktop: one centered pill */}
        <div className="nav-drop hidden items-center gap-1 rounded-full border border-white/10 bg-black/60 py-2 pl-3 pr-2 backdrop-blur-md md:flex">
          <a href="#top" onClick={go('#top')} className="mr-2 flex items-center gap-2 text-white" aria-label={`${site.name} — home`}>
            <Logo />
            <span className="font-display text-sm tracking-tight">{site.name}</span>
          </a>
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={go(n.href)}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {n.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={go('#contact')}
            className="ml-1 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
          >
            Let's talk
          </a>
        </div>

        {/* mobile */}
        <a href="#top" onClick={go('#top')} className="nav-drop rounded-full border border-white/10 bg-black/60 p-2.5 text-white backdrop-blur-md md:hidden" aria-label="Home">
          <Logo />
        </a>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="nav-drop rounded-full border border-white/10 bg-black/60 p-2.5 text-white backdrop-blur-md md:hidden"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="fixed left-4 right-4 top-[4.75rem] z-[59] rounded-2xl border border-white/10 bg-black/70 p-5 backdrop-blur-xl md:hidden">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={go(n.href)} className="block border-b border-white/10 py-3 font-display text-lg text-white last:border-0">
              {n.label}
            </a>
          ))}
          <a href="#contact" onClick={go('#contact')} className="mt-4 block rounded-full bg-white py-3 text-center text-sm font-semibold text-gray-900">
            Let's talk
          </a>
        </div>
      )}
    </>
  )
}
