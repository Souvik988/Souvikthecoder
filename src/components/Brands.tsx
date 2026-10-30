import { brands } from '@/content'

function Tile({ b }: { b: (typeof brands)[number] }) {
  return (
    <li className="flex h-20 shrink-0 items-center justify-center rounded-2xl bg-white px-8 shadow-[0_24px_40px_-22px_rgba(0,0,0,.45)] ring-1 ring-black/5 sm:h-24 sm:px-10">
      {b.logo ? (
        <span className="flex items-center gap-3">
          <img src={b.logo} alt={`${b.name} logo`} className="h-9 w-auto max-w-[170px] object-contain sm:h-11" loading="lazy" decoding="async" draggable={false} />
          {(b.name === 'Radha' || b.name === 'FreshCart') && <span className="font-display text-xl font-bold tracking-tight text-black">{b.name}</span>}
        </span>
      ) : (
        <span className="font-display text-2xl font-black tracking-[-0.05em] text-black">
          {b.name === 'Shotlin' ? (
            <>
              shotlin<span className="text-signal">.</span>
            </>
          ) : (
            <span className="font-serif italic tracking-normal text-[#0b2a6b]">{b.name}</span>
          )}
        </span>
      )}
    </li>
  )
}

// Brand wall on a tilted 3D ribbon: two lanes drifting in opposite directions.
export default function Brands() {
  const lane = [...brands, ...brands]
  return (
    <section aria-labelledby="brands-title" data-tone="#120707" data-accent="#ff2a1f" className="relative overflow-hidden bg-bone py-24 sm:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-16">
        <p className="text-[11px] uppercase tracking-[0.2em] text-black/50">Brands</p>
        <h2 data-drop id="brands-title" className="mt-4 max-w-3xl font-display text-4xl font-light leading-[0.95] tracking-[-0.05em] text-black sm:text-6xl">
          Brands we've built, <span className="text-signal">launched</span> and run.
        </h2>
      </div>
      <div className="mt-14 [perspective:1100px]">
        <div className="space-y-4 [transform:rotateX(22deg)_rotateZ(-3deg)_scale(1.08)] [transform-style:preserve-3d]">
          {[0, 1].map((row) => (
            <div key={row} className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
              <ul className={`brand-lane flex w-max gap-4 pr-4 ${row ? 'brand-lane-rev' : ''}`} aria-hidden={row === 1 || undefined}>
                {(row ? [...lane].reverse() : lane).map((b, i) => (
                  <Tile key={`${b.name}-${i}`} b={b} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
