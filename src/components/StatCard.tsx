import { fmt } from '../helpers'

export function CardEstatistica({ label, valor, sub, cor }: { label: string; valor: string; sub: string; cor: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 animate-fadeIn">
      <div className="w-7 h-1 rounded-full mb-3" style={{ background: cor }} />
      <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
      <p className="text-slate-100 text-lg font-semibold leading-tight">{valor}</p>
      <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
    </div>
  )
}

export function CardResumo({ label, valor, moeda, cor, ehSaldo = false }: {
  label: string; valor: number; moeda: 'BRL' | 'EUR'; cor: string; ehSaldo?: boolean
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="w-6 h-0.5 rounded-full mb-2.5" style={{ background: cor }} />
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="text-slate-100 font-bold text-base md:text-lg leading-tight" style={{ color: ehSaldo ? cor : undefined }}>
        {fmt(valor, moeda)}
      </p>
    </div>
  )
}

export function BarraOrcamento({ label, brl, pct }: { label: string; brl: number; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{fmt(brl, 'BRL')}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: 'linear-gradient(90deg, #14B8A6, #0284C7)' }} />
      </div>
    </div>
  )
}

export function PontoLegenda({ cor, label }: { cor: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: cor }} />
      <span className="text-slate-400 text-xs">{label}</span>
    </div>
  )
}

export function InfoCardVisto({ label, valor, icone }: { label: string; valor: string; icone: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <span className="text-xl mb-2 block">{icone}</span>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-slate-200 text-sm font-semibold leading-tight">{valor}</p>
    </div>
  )
}
