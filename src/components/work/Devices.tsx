import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { Shot } from '@/content'

// Device mockups are plain DOM, so screenshots stay pixel-sharp and the 3D comes from CSS
// transforms on the GPU. Sizes are container-relative (cqw) so one component works at any scale.

type Props = { shot: Shot; className?: string; style?: CSSProperties; eager?: boolean; onOpen?: () => void }

// scenes show the lighter display copy; the lightbox opens the full-resolution file
const md = (src: string) => src.replace('/work/', '/work/md/')

// a device that opens the lightbox: clickable, focusable, Enter/Space work too
const opener = (onOpen?: () => void, label?: string) =>
  onOpen
    ? {
        onClick: onOpen,
        onKeyDown: (e: ReactKeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen()),
        role: 'button',
        tabIndex: 0,
        'aria-label': `Open full screen: ${label}`,
        'data-cursor': 'View',
      }
    : {}

function Signal({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 54 12" className="h-full w-auto" fill={color} aria-hidden="true">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
      <path d="M27.5 2.2a9.6 9.6 0 0 1 6.9 2.9l-1.3 1.3a7.8 7.8 0 0 0-11.2 0l-1.3-1.3a9.6 9.6 0 0 1 6.9-2.9Zm0 3.6a5.9 5.9 0 0 1 4.3 1.8l-1.3 1.3a4.1 4.1 0 0 0-6 0l-1.3-1.3a5.9 5.9 0 0 1 4.3-1.8Zm0 3.6c.6 0 1.2.3 1.6.7l-1.6 1.7-1.6-1.7c.4-.4 1-.7 1.6-.7Z" />
      <rect x="38" y="1" width="14" height="10" rx="3" fill="none" stroke={color} strokeWidth="1.2" opacity="0.5" />
      <rect x="39.6" y="2.6" width="9.5" height="6.8" rx="1.8" />
    </svg>
  )
}

export function Phone({ shot, className, style, eager, onOpen }: Props) {
  const ink = shot.dark ? '#ffffff' : '#0b0b0d'
  return (
    <figure className={`device-phone @container ${className || 'relative'}`} style={style} {...opener(onOpen, shot.alt)}>
      <div className="relative rounded-[15%/7.2%] bg-[linear-gradient(145deg,#3b3d42,#141518_40%,#2a2c30_60%,#0c0d0f)] p-[3.1%] shadow-[0_40px_80px_-20px_rgba(0,0,0,.85),inset_0_0_0_1px_rgba(255,255,255,.14)]">
        {/* side buttons */}
        <span className="absolute -left-[1.2%] top-[20%] h-[6%] w-[1.4%] rounded-l bg-[#2a2c30]" aria-hidden="true" />
        <span className="absolute -left-[1.2%] top-[29%] h-[9%] w-[1.4%] rounded-l bg-[#2a2c30]" aria-hidden="true" />
        <span className="absolute -right-[1.2%] top-[25%] h-[12%] w-[1.4%] rounded-r bg-[#2a2c30]" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[12.5%/5.9%] bg-black">
          <div className="relative pt-[8%]" style={{ background: shot.tint ?? '#fff', color: ink }}>
            <span className="absolute left-[9%] top-1/2 -translate-y-1/2 text-[3.6cqw] font-semibold tracking-tight" style={{ fontFamily: '-apple-system, system-ui, "Segoe UI", sans-serif' }}>
              9:41
            </span>
            <span className="absolute left-1/2 top-[22%] h-[60%] w-[29%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
            <span className="absolute right-[7%] top-1/2 h-[30%] -translate-y-1/2" aria-hidden="true">
              <Signal color={ink} />
            </span>
          </div>
          <img
            src={md(shot.src)}
            alt={shot.alt}
            width={shot.w}
            height={shot.h}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            className="block h-auto w-full select-none"
          />
          {/* glass sheen */}
          <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.16)_0%,rgba(255,255,255,0)_32%,rgba(255,255,255,0)_70%,rgba(255,255,255,.06)_100%)]" aria-hidden="true" />
        </div>
      </div>
    </figure>
  )
}

export function Browser({ shot, className, style, eager, onOpen }: Props) {
  return (
    <figure className={`device-browser @container ${className || 'relative'}`} style={style} {...opener(onOpen, shot.alt)}>
      <div className="overflow-hidden rounded-[1.4cqw] border border-white/12 bg-[#101114] shadow-[0_50px_90px_-30px_rgba(0,0,0,.9)]">
        <div className="flex h-[3.4cqw] min-h-[18px] items-center gap-[1.4cqw] px-[1.6cqw]">
          <span className="flex gap-[0.7cqw]" aria-hidden="true">
            <i className="block h-[1cqw] min-h-[6px] w-[1cqw] min-w-[6px] rounded-full bg-[#ff5f57]" />
            <i className="block h-[1cqw] min-h-[6px] w-[1cqw] min-w-[6px] rounded-full bg-[#febc2e]" />
            <i className="block h-[1cqw] min-h-[6px] w-[1cqw] min-w-[6px] rounded-full bg-[#28c840]" />
          </span>
          {shot.url && (
            <span className="mx-auto flex h-[2.1cqw] min-h-[12px] max-w-[55%] items-center gap-[0.6cqw] truncate rounded-full bg-white/[.07] px-[1.4cqw] text-[max(8px,1.15cqw)] text-white/60">
              <svg viewBox="0 0 12 12" className="h-[1.1cqw] min-h-[7px] w-auto shrink-0" fill="currentColor" aria-hidden="true">
                <path d="M6 1a2.6 2.6 0 0 0-2.6 2.6V5H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-.4V3.6A2.6 2.6 0 0 0 6 1Zm1.4 4H4.6V3.6a1.4 1.4 0 0 1 2.8 0V5Z" />
              </svg>
              {shot.url}
            </span>
          )}
        </div>
        <img
          src={md(shot.src)}
          alt={shot.alt}
          width={shot.w}
          height={shot.h}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="block h-auto w-full select-none"
        />
      </div>
    </figure>
  )
}

// A desktop monitor plus a landscape phone, for a game that ships on both.
export function Monitor({ shot, className, style, onOpen }: Props) {
  return (
    <figure className={`device-monitor @container ${className || 'relative'}`} style={style} {...opener(onOpen, shot.alt)}>
      <div className="rounded-[1.6cqw] bg-[linear-gradient(160deg,#2b2d31,#0d0e10)] p-[1.2cqw] pb-[2.4cqw] shadow-[0_60px_100px_-30px_rgba(0,0,0,.9),inset_0_0_0_1px_rgba(255,255,255,.1)]">
        <div className="relative aspect-[21/9] overflow-hidden rounded-[0.6cqw] bg-black">
          <img src={md(shot.src)} alt={shot.alt} width={shot.w} height={shot.h} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
      <div className="mx-auto h-[7cqw] w-[12%] bg-[linear-gradient(90deg,#16171a,#2e3034,#16171a)]" aria-hidden="true" />
      <div className="mx-auto h-[1.2cqw] w-[34%] rounded-t-[1cqw] bg-[linear-gradient(180deg,#2e3034,#121315)]" aria-hidden="true" />
    </figure>
  )
}

export function LandscapePhone({ shot, className, style, onOpen }: Props) {
  return (
    <figure className={`device-phone-l @container ${className || 'relative'}`} style={style} {...opener(onOpen, shot.alt)}>
      <div className="rounded-[7%/15%] bg-[linear-gradient(145deg,#3b3d42,#141518_40%,#2a2c30_60%,#0c0d0f)] p-[1.6%] shadow-[0_40px_80px_-20px_rgba(0,0,0,.85),inset_0_0_0_1px_rgba(255,255,255,.14)]">
        <div className="relative aspect-[19.5/9] overflow-hidden rounded-[5.6%/12%] bg-black">
          <img src={md(shot.src)} alt="" aria-hidden="true" width={shot.w} height={shot.h} loading="lazy" decoding="async" draggable={false} className="absolute inset-0 h-full w-full object-cover object-[30%_50%]" />
          <span className="absolute left-[1.6%] top-1/2 h-[26%] w-[3.4%] -translate-y-1/2 rounded-full bg-black" aria-hidden="true" />
        </div>
      </div>
    </figure>
  )
}
