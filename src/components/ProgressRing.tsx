export function ProgressRing({ pct, tamanho = 120, espessura = 10 }: { pct: number; tamanho?: number; espessura?: number }) {
  const r = (tamanho - espessura) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={tamanho} height={tamanho} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="#1E293B" strokeWidth={espessura} />
      <circle
        cx={tamanho / 2} cy={tamanho / 2} r={r}
        fill="none" stroke="#14B8A6" strokeWidth={espessura} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}
