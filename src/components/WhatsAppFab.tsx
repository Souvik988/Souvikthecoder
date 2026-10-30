import { useEffect, useState } from 'react'
import { contact, waHello, waLink, waProject } from '@/content'
import { WhatsAppIcon } from './icons'
import type { ToneDetail } from './Atmosphere'

// Floating WhatsApp button. Hidden on the hero (the hint pill lives there); afterwards the
// pre-typed message follows the project on screen, so a visitor on Bakaloo asks about Bakaloo.
export default function WhatsAppFab({ show }: { show: boolean }) {
  const [project, setProject] = useState('')
  const [past, setPast] = useState(false)

  useEffect(() => {
    const onTone = (e: Event) => setProject((e as CustomEvent<ToneDetail>).detail.name)
    // visible between the hero and the footer (the footer's sign-off should stay clean)
    const onScroll = () => {
      const y = window.scrollY
      setPast(y > window.innerHeight * 0.8 && y + window.innerHeight < document.documentElement.scrollHeight - 260)
    }
    window.addEventListener('section-tone', onTone)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('section-tone', onTone)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  if (!show) return null
  const msg = project ? waProject(project) : waHello

  return (
    <a
      href={waLink(msg)}
      target="_blank"
      rel="noopener"
      aria-label={`Chat with Souvik on WhatsApp (${contact.whatsappDisplay})`}
      className={`group fixed bottom-5 right-5 z-[55] flex items-center gap-0 overflow-hidden rounded-full bg-[#25d366] p-3.5 text-black shadow-[0_18px_40px_-12px_rgba(37,211,102,.7)] transition-all duration-500 hover:gap-2 hover:pr-5 sm:bottom-7 sm:right-7 ${
        past ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.4s]" aria-hidden="true" />
      <WhatsAppIcon className="relative h-6 w-6" />
      <span className="relative max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-500 group-hover:max-w-[260px]">
        {project ? `Ask about ${project}` : 'Chat on WhatsApp'}
      </span>
    </a>
  )
}
