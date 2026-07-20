import type { EtapaVisto, StatusEtapa, DocConsulado } from '../types'
import { BadgeEtapa } from '../components/Badges'
import { InfoCardVisto } from '../components/StatCard'

interface VisaTrackerProps {
  etapas: EtapaVisto[]
  setEtapas: React.Dispatch<React.SetStateAction<EtapaVisto[]>>
  docsConsulado: DocConsulado[]
  setDocsConsulado: React.Dispatch<React.SetStateAction<DocConsulado[]>>
}

export function VisaTracker({ etapas, setEtapas, docsConsulado, setDocsConsulado }: VisaTrackerProps) {
  const concluidas = etapas.filter(e => e.status === 'Concluído').length
  const pct = concluidas / etapas.length

  const avancarEtapa = (id: string) => {
    setEtapas(prev => {
      const idx = prev.findIndex(e => e.id === id)
      if (idx === -1) return prev
      const anteriorPendente = prev.slice(0, idx).some(e => e.status !== 'Concluído')
      if (anteriorPendente) return prev
      const ordem: StatusEtapa[] = ['Pendente', 'Em Andamento', 'Concluído']
      const proximo = ordem[(ordem.indexOf(prev[idx].status) + 1) % ordem.length]
      return prev.map((e, i) => i === idx ? { ...e, status: proximo } : e)
    })
  }

  const toggleDoc = (i: number) => {
    setDocsConsulado(prev => prev.map((d, idx) => idx === i ? { ...d, ok: !d.ok } : d))
  }

  const docsOk = docsConsulado.filter(d => d.ok).length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Acompanhamento do Visto D3</h1>
        <p className="text-slate-400 text-sm mt-1">Visto de Trabalho Qualificado · Consulado de Portugal · Salvador / Recife</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <InfoCardVisto label="Tipo de Visto" valor="D3 — Qualificado" icone="🛂" />
        <InfoCardVisto label="Consulado" valor="Salvador / Recife" icone="🏛️" />
        <InfoCardVisto label="Agendamento" valor="28 Ago, 2026" icone="📅" />
        <InfoCardVisto label="Prazo Estimado" valor="Nov — Dez 2026" icone="⏳" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Etapas do Processo</h2>
            <span className="text-xs text-slate-500">{concluidas}/{etapas.length} concluídas</span>
          </div>

          <div className="mb-5 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${pct * 100}%`,
              background: 'linear-gradient(90deg, #F59E0B, #14B8A6)',
            }} />
          </div>

          <div className="relative">
            {etapas.map((etapa, idx) => {
              const ehUltima = idx === etapas.length - 1
              return (
                <div key={etapa.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => avancarEtapa(etapa.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 z-10"
                      style={{
                        background:
                          etapa.status === 'Concluído'    ? '#10B981' :
                          etapa.status === 'Em Andamento' ? '#F59E0B' : '#1E293B',
                        border: '2px solid',
                        borderColor:
                          etapa.status === 'Concluído'    ? '#10B981' :
                          etapa.status === 'Em Andamento' ? '#F59E0B' : '#334155',
                      }}
                    >
                      {etapa.status === 'Concluído'    && <span className="text-white text-xs">✓</span>}
                      {etapa.status === 'Em Andamento' && <span className="text-white text-xs font-bold">→</span>}
                      {etapa.status === 'Pendente'     && <span className="text-slate-600 text-xs">{idx + 1}</span>}
                    </button>
                    {!ehUltima && (
                      <div className="w-0.5 flex-1 my-1" style={{
                        background: etapa.status === 'Concluído' ? '#10B981' : '#1E293B',
                        minHeight: '24px',
                      }} />
                    )}
                  </div>

                  <div className={`flex-1 pb-5 ${ehUltima ? 'pb-0' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <p className={`text-sm font-semibold ${etapa.status === 'Concluído' ? 'text-slate-500' : 'text-slate-100'}`}>
                        {etapa.titulo}
                      </p>
                      <BadgeEtapa status={etapa.status} />
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{etapa.descricao}</p>
                    {etapa.data && (
                      <p className="text-slate-600 text-xs mt-1.5 flex items-center gap-1">
                        <span>📅</span> {etapa.data}
                      </p>
                    )}
                    {etapa.obs && (
                      <div className="mt-2 p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-xs">{etapa.obs}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-slate-600 text-xs mt-2">Clique nos círculos para avançar as etapas em ordem</p>
        </div>

        {/* Checklist do Consulado */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pasta Consular</h2>
            <span className="text-xs text-slate-500">{docsOk}/{docsConsulado.length} prontos</span>
          </div>

          <div className="mb-4 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${(docsOk / docsConsulado.length) * 100}%`,
              background: 'linear-gradient(90deg, #0284C7, #14B8A6)',
            }} />
          </div>

          <div className="space-y-2">
            {docsConsulado.map((doc, i) => (
              <button
                key={i}
                onClick={() => toggleDoc(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                  doc.ok
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 ${
                  doc.ok ? 'bg-emerald-500' : 'bg-slate-700 border border-slate-600'
                }`}>
                  {doc.ok && <span className="text-white text-xs">✓</span>}
                </div>
                <p className={`text-xs leading-relaxed ${doc.ok ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {doc.label}
                </p>
              </button>
            ))}
          </div>

          {/* Alerta */}
          <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-xs font-semibold mb-1">⚠ Atenção</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Leve sempre originais + 2 cópias de cada documento. O consulado não devolve documentos originais no ato.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
