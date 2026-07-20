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

export function BadgeStatusConsular({ status }: { status: string }) {
  const cores: Record<string, { bg: string; txt: string }> = {
    'Documentação Pronta': { bg: 'bg-sky-500/10 border-sky-500/20', txt: 'text-sky-400' },
    'Enviado para VFS': { bg: 'bg-violet-500/10 border-violet-500/20', txt: 'text-violet-400' },
    'VFS Enviado para Embaixada': { bg: 'bg-indigo-500/10 border-indigo-500/20', txt: 'text-indigo-400' },
    'Chegou na Embaixada': { bg: 'bg-blue-500/10 border-blue-500/20', txt: 'text-blue-400' },
    'Embaixada Analisando': { bg: 'bg-amber-500/10 border-amber-500/20', txt: 'text-amber-400' },
    'Exigência / Correção': { bg: 'bg-red-500/10 border-red-500/20', txt: 'text-red-400' },
    'Embaixada Enviando Passaporte': { bg: 'bg-teal-500/10 border-teal-500/20', txt: 'text-teal-400' },
    'Visto Concluído': { bg: 'bg-emerald-500/10 border-emerald-500/20', txt: 'text-emerald-400' },
  }

  const c = cores[status] || { bg: 'bg-slate-800 border-slate-700', txt: 'text-slate-300' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.txt}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  )
}
