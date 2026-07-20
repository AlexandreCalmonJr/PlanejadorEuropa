import type { StatusDoc, StatusEtapa } from '../types'

export function BadgeStatus({ status }: { status: StatusDoc }) {
  const cfg: Record<StatusDoc, { bg: string; txt: string; dot: string }> = {
    'Concluído':    { bg: 'bg-emerald-950', txt: 'text-emerald-400', dot: '#10B981' },
    'Em Andamento': { bg: 'bg-sky-950',     txt: 'text-sky-400',     dot: '#0284C7' },
    'Pendente':     { bg: 'bg-slate-800',   txt: 'text-slate-400',   dot: '#64748B' },
    'Bloqueado':    { bg: 'bg-red-950',     txt: 'text-red-400',     dot: '#EF4444' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.txt}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  )
}

export function BadgeEtapa({ status }: { status: StatusEtapa }) {
  const cfg: Record<StatusEtapa, { bg: string; txt: string; dot: string }> = {
    'Concluído':    { bg: 'bg-emerald-950', txt: 'text-emerald-400', dot: '#10B981' },
    'Em Andamento': { bg: 'bg-amber-950',   txt: 'text-amber-400',   dot: '#F59E0B' },
    'Pendente':     { bg: 'bg-slate-800',   txt: 'text-slate-500',   dot: '#475569' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.txt}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  )
}

export function BadgePais({ pais }: { pais: 'PT' | 'ES' }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
      pais === 'PT'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    }`}>
      {pais === 'PT' ? '🇵🇹 Portugal' : '🇪🇸 Espanha'}
    </span>
  )
}
