import { useCallback, useEffect, useState } from 'react'
import Loader from '@/components/Loader'
import Nav from '@/components/Nav'
import Cursor from '@/components/Cursor'
import Hero from '@/components/hero/Hero'
import Manifesto from '@/components/Manifesto'
import Ventures from '@/components/Ventures'
import Brands from '@/components/Brands'
import Work from '@/components/Work'
import Capabilities from '@/components/Capabilities'
import Faq from '@/components/Faq'
import Footer from '@/components/Footer'
import About from '@/components/About'
import Stack from '@/components/Stack'
import Contact from '@/components/Contact'
import Atmosphere from '@/components/Atmosphere'
import WhatsAppFab from '@/components/WhatsAppFab'
import Lightbox from '@/components/work/Lightbox'
import { startSmoothScroll } from '@/lib/smooth'
import { ScrollTrigger } from '@/lib/gsap'

export default function App() {
  const [booted, setBooted] = useState(false)
  const onDone = useCallback(() => setBooted(true), [])

  useEffect(() => startSmoothScroll(), [])
  useEffect(() => {
    if (booted) requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [booted])

  return (
    <div className="min-h-screen font-mono tracking-[-0.02em] text-bone">
      <a href="#work" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-black">
        Skip to work
      </a>
      <Loader onDone={onDone} />
      <Atmosphere booted={booted} />
      <Cursor />
      <Nav show={booted} />
      <WhatsAppFab show={booted} />
      <Lightbox />
      <main className="relative z-[1]">
        <Hero booted={booted} />
        <Manifesto />
        <Ventures />
        <Brands />
        <Work />
        <Capabilities />
        <Stack />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
