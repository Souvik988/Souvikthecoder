import { Plus } from 'lucide-react'
import { faq } from '@/content'

// Plain <details>: works without JS, readable by every crawler and answer engine.
export default function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" data-tone="#03131f" data-accent="#3fb6ff" className="relative px-5 py-28 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Answers</p>
          <h2 data-drop id="faq-title" className="mt-4 font-display text-4xl font-light leading-[0.95] tracking-[-0.05em] text-white sm:text-6xl">
            A few useful
            <br />
            answers.
          </h2>
        </div>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {faq.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-display text-lg font-light text-white sm:text-xl [&::-webkit-details-marker]:hidden">
                <h3 className="font-light">{f.q}</h3>
                <Plus className="h-5 w-5 shrink-0 text-white/50 transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
