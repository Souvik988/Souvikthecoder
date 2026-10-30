import { arcStats } from '@/content'

const CX = -110
const CY = 300
const rad = (d: number) => (d * Math.PI) / 180
const polar = (r: number, deg: number) => [CX + r * Math.cos(rad(deg)), CY + r * Math.sin(rad(deg))] as const

export default function ArcStats({ start }: { start: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-30 hidden lg:block" aria-hidden="true">
      <svg viewBox="0 0 380 700" preserveAspectRatio="xMaxYMid meet" className="h-full w-auto">
        <defs>
          {arcStats.map((a, i) => {
            const [x0, y0] = polar(a.r, a.a0)
            const [x1, y1] = polar(a.r, a.a1)
            return (
              <linearGradient key={i} id={`arc-g-${i}`} gradientUnits="userSpaceOnUse" x1={x0} y1={y0} x2={x1} y2={y1}>
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="22%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="55%" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="85%" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            )
          })}
        </defs>
        {start &&
          arcStats.map((a, i) => {
            const [x0, y0] = polar(a.r, a.a0)
            const [x1, y1] = polar(a.r, a.a1)
            const [dx, dy] = polar(a.r, a.dot)
            const len = a.r * rad(a.a1 - a.a0)
            const lineDelay = 0.4 + i * 0.22
            const markDelay = lineDelay + 0.9
            return (
              <g key={i}>
                <path
                  className="arc-line"
                  d={`M ${x0} ${y0} A ${a.r} ${a.r} 0 0 1 ${x1} ${y1}`}
                  fill="none"
                  stroke={`url(#arc-g-${i})`}
                  strokeWidth={1.1}
                  style={{ ['--len' as string]: len, animationDelay: `${lineDelay}s` }}
                />
                <circle className="arc-dot" cx={dx} cy={dy} r={3.4} fill="#fff" style={{ animationDelay: `${markDelay}s` }} />
                <circle
                  className="arc-ring"
                  cx={dx}
                  cy={dy}
                  r={7}
                  fill="none"
                  stroke="#fff"
                  strokeOpacity={0.35}
                  style={{ animationDelay: `${markDelay + 0.3}s` }}
                />
                <text
                  className="arc-text"
                  x={dx + 16}
                  y={dy + 4}
                  fill="#fff"
                  fontSize={32}
                  letterSpacing={-1}
                  style={{ animationDelay: `${markDelay + 0.15}s`, fontFamily: 'Unbounded, sans-serif', fontWeight: 300 }}
                >
                  {a.num}
                  <tspan fontSize={19} dy={-10}>
                    {a.suf}
                  </tspan>
                </text>
                <text
                  className="arc-text"
                  x={dx + 18}
                  y={dy + 22}
                  fill="#fff"
                  fillOpacity={0.8}
                  fontSize={8.5}
                  fontWeight={600}
                  letterSpacing={2}
                  style={{ animationDelay: `${markDelay + 0.3}s` }}
                >
                  {a.label}
                </text>
              </g>
            )
          })}
      </svg>
    </div>
  )
}
