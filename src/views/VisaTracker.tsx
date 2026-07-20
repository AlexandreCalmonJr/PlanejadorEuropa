import type { EtapaVisto, StatusEtapa, DocConsulado, TipoVistoId } from '../types'
import { CONFIGS_VISTO } from '../data'
import { BadgeEtapa, BadgePais } from '../components/Badges'
import { InfoCardVisto } from '../components/StatCard'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface VisaTrackerProps {
  etapas?: EtapaVisto[]
  setEtapas: React.Dispatch<React.SetStateAction<EtapaVisto[]>>
  docsConsulado?: DocConsulado[]
  setDocsConsulado: React.Dispatch<React.SetStateAction<DocConsulado[]>>
}

export function VisaTracker({ setEtapas, setDocsConsulado }: VisaTrackerProps) {
  const [vistoId, setVistoId] = useLocalStorage<TipoVistoId>('ep_visto_ativo_id', 'pt-d3')

  // Obtem a configuracao do visto atualmente ativo
  const vistoAtivo = CONFIGS_VISTO.find(v => v.id === vistoId) || CONFIGS_VISTO[0]

  // Estado local para etapas e docs de cada visto (armazenado com a chave do visto)
  const [etapasDoVisto, setEtapasDoVisto] = useLocalStorage<Record<string, EtapaVisto[]>>(
    'ep_etapas_por_visto',
    {
      [vistoAtivo.id]: vistoAtivo.etapas,
    }
  )

  const [docsDoVisto, setDocsDoVisto] = useLocalStorage<Record<string, DocConsulado[]>>(
    'ep_docs_por_visto',
    {
      [vistoAtivo.id]: vistoAtivo.docsConsulado,
    }
  )

  // Etapas e Docs para o visto selecionado
  const etapasAtuais = etapasDoVisto[vistoId] || vistoAtivo.etapas
  const docsAtuais = docsDoVisto[vistoId] || vistoAtivo.docsConsulado

  const concluidas = etapasAtuais.filter(e => e.status === 'Concluído').length
  const pct = etapasAtuais.length > 0 ? concluidas / etapasAtuais.length : 0

  const avancarEtapa = (id: string) => {
    const novasEtapas = etapasAtuais.map((e, idx, arr) => {
      if (e.id !== id) return e
      const anteriorPendente = arr.slice(0, idx).some(prev => prev.status !== 'Concluído')
      if (anteriorPendente) return e
      const ordem: StatusEtapa[] = ['Pendente', 'Em Andamento', 'Concluído']
      const proximo = ordem[(ordem.indexOf(e.status) + 1) % ordem.length]
      return { ...e, status: proximo }
    })

    setEtapasDoVisto(prev => ({ ...prev, [vistoId]: novasEtapas }))
    if (vistoId === 'pt-d3') setEtapas(novasEtapas)
  }

  const toggleDoc = (i: number) => {
    const novosDocs = docsAtuais.map((d, idx) => idx === i ? { ...d, ok: !d.ok } : d)
    setDocsDoVisto(prev => ({ ...prev, [vistoId]: novosDocs }))
    if (vistoId === 'pt-d3') setDocsConsulado(novosDocs)
  }

  const docsOk = docsAtuais.filter(d => d.ok).length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full space-y-6">
      {/* Cabecalho */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Planejamento de Visto & Imigração</h1>
        <p className="text-slate-400 text-sm mt-1">Selecione o tipo de visto desejado para visualizar requisitos, etapas e pasta consular</p>
      </div>

      {/* Seletor de Vistos */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-900 p-2 border border-slate-800 rounded-2xl">
        {CONFIGS_VISTO.map(v => {
          const selecionado = v.id === vistoId
          return (
            <button
              key={v.id}
              onClick={() => setVistoId(v.id)}
              className={`p-2.5 rounded-xl text-left transition-all duration-150 flex flex-col justify-between ${
                selecionado
                  ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300 shadow-md font-semibold'
                  : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold uppercase">
                  {v.codigo}
                </span>
                <BadgePais pais={v.pais} />
              </div>
              <p className="text-xs font-semibold leading-snug truncate">{v.titulo}</p>
            </button>
          )
        })}
      </div>

      {/* Cartao Informativo do Visto Selecionado */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">{vistoAtivo.titulo}</h2>
              <BadgePais pais={vistoAtivo.pais} />
            </div>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{vistoAtivo.descricao}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <InfoCardVisto label="Visto Selecionado" valor={vistoAtivo.codigo} icone="🛂" />
          <InfoCardVisto label="Consulado Base" valor={vistoAtivo.consulado.split('(')[0]} icone="🏛️" />
          <InfoCardVisto label="Estimativa Envio" valor={vistoAtivo.agendamentoEstimado} icone="📅" />
          <InfoCardVisto label="Prazo de Análise" valor={vistoAtivo.prazoEstimado} icone="⏳" />
        </div>

        {/* Requisitos Chave */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Requisitos Principais</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {vistoAtivo.requisitosChave.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold">✦</span> {req}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline das Etapas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Etapas do Processo</h2>
            <span className="text-xs text-slate-500">{concluidas}/{etapasAtuais.length} concluídas</span>
          </div>

          <div className="mb-5 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${pct * 100}%`,
              background: 'linear-gradient(90deg, #F59E0B, #14B8A6)',
            }} />
          </div>

          <div className="relative space-y-4">
            {etapasAtuais.map((etapa, idx) => {
              const ehUltima = idx === etapasAtuais.length - 1
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
                    {!ehUltima && <div className="w-0.5 flex-1 my-1 bg-slate-800" />}
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
                      <p className="text-slate-600 text-xs mt-1 flex items-center gap-1">
                        <span>📅</span> {etapa.data}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-slate-600 text-xs mt-2">Clique nos números para avançar o progresso</p>
        </div>

        {/* Checklist do Consulado */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pasta Consular</h2>
            <span className="text-xs text-slate-500">{docsOk}/{docsAtuais.length} prontos</span>
          </div>

          <div className="mb-4 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${(docsOk / Math.max(docsAtuais.length, 1)) * 100}%`,
              background: 'linear-gradient(90deg, #0284C7, #14B8A6)',
            }} />
          </div>

          <div className="space-y-2">
            {docsAtuais.map((doc, i) => (
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

          <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-xs font-semibold mb-1">⚠ Recomendação Consular</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Leve sempre a pasta completa com os documentos impressos, cópias e originais apostilados segundo as regras do consulado de {vistoAtivo.pais === 'PT' ? 'Portugal' : 'Espanha'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
