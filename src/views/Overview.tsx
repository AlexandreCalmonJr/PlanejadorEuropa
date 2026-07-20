import { fmt } from '../helpers'
import type { ItemFinanceiro, Documento, EtapaVisto, Prazo, Vaga, Faculdade, TarefaLogistica, Voo } from '../types'
import { ProgressRing } from '../components/ProgressRing'
import { CardEstatistica, BarraOrcamento, PontoLegenda } from '../components/StatCard'

interface OverviewProps {
  itensFinanceiros: ItemFinanceiro[]
  documentos: Documento[]
  etapasVisto: EtapaVisto[]
  prazos: Prazo[]
  vagas?: Vaga[]
  faculdades?: Faculdade[]
  tarefasLogistica?: TarefaLogistica[]
  voos?: Voo[]
}

export function Overview({
  itensFinanceiros,
  documentos,
  etapasVisto,
  prazos,
  vagas = [],
  faculdades = [],
  tarefasLogistica = [],
  voos = [],
}: OverviewProps) {
  const totalBRL = itensFinanceiros.filter(i => i.tipo === 'receita').reduce((s, i) => s + i.valorBRL, 0)
  const totalEUR = itensFinanceiros.filter(i => i.tipo === 'receita').reduce((s, i) => s + i.valorEUR, 0)
  const despBRL  = itensFinanceiros.filter(i => i.tipo === 'despesa').reduce((s, i) => s + i.valorBRL, 0)
  const despEUR  = itensFinanceiros.filter(i => i.tipo === 'despesa').reduce((s, i) => s + i.valorEUR, 0)
  const saldoEUR = totalEUR - despEUR

  // Documentos com status resolvido
  const docsResolvidos = documentos.filter(d => d.pais !== 'ES').map(d => {
    const bloqueado = d.bloqueadoPor?.some(bid => {
      const bloqueador = documentos.find(dd => dd.id === bid)
      return bloqueador && bloqueador.status !== 'Concluído'
    })
    return { ...d, statusResolvido: bloqueado ? 'Bloqueado' : d.status }
  })
  const concluidos = docsResolvidos.filter(d => d.statusResolvido === 'Concluído').length
  const total = docsResolvidos.length
  const pct = total > 0 ? concluidos / total : 0

  const etapasVistoConcluidas = etapasVisto.filter(e => e.status === 'Concluído').length
  const etapaAtual = etapasVisto.find(e => e.status === 'Em Andamento')

  const receitas = itensFinanceiros.filter(i => i.tipo === 'receita')

  // Metricas dos outros modulos
  const vagasCandidatadas = vagas.length
  const vagasEntrevista = vagas.filter(v => v.coluna === 'Entrevista Técnica' || v.coluna === 'Oferta').length
  const facsCadastradas = faculdades.length
  const facsAceitas = faculdades.filter(f => f.coluna === 'Aceito').length
  const logisticaConcluida = tarefasLogistica.filter(t => t.status === 'Concluído').length
  const totalLogistica = tarefasLogistica.length

  return (
    <div className="p-6 md:p-8 w-full pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Visão Geral & Painel de Controle</h1>
        <p className="text-slate-400 text-sm mt-1">Sua jornada de imigração · Alexandre & Andressa · Salvador → Coimbra</p>
      </div>

      {/* Cards de estatísticas financeiras */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardEstatistica label="Total em Caixa" valor={fmt(totalBRL, 'BRL')} sub="orçamento disponível" cor="#14B8A6" />
        <CardEstatistica label="Convertido em EUR" valor={fmt(totalEUR, 'EUR')} sub="a R$6,15/€1" cor="#0284C7" />
        <CardEstatistica label="Despesas Previstas" valor={fmt(despEUR, 'EUR')} sub={fmt(despBRL, 'BRL')} cor="#8B5CF6" />
        <CardEstatistica label="Saldo Após Mudança" valor={fmt(saldoEUR, 'EUR')} sub="estimativa de reserva" cor="#10B981" />
      </div>

      {/* Widgets dos Modulos (Vagas, Faculdades, Voos, Logistica) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">💼 Vagas TI</span>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-bold">{vagasEntrevista} entrevistas</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 mt-2">{vagasCandidatadas}</p>
          <p className="text-xs text-slate-500 mt-0.5">vagas acompanhadas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">🎓 Universidades</span>
            <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 font-bold">{facsAceitas} aceitas</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 mt-2">{facsCadastradas}</p>
          <p className="text-xs text-slate-500 mt-0.5">opções em pesquisa</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">✈ Passagens</span>
            <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold">{voos.length} cotações</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 mt-2">{voos.length > 0 ? voos[0].dataPartida : 'Out 2026'}</p>
          <p className="text-xs text-slate-500 mt-0.5">data de embarque</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">📋 Logística</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
              {totalLogistica > 0 ? Math.round((logisticaConcluida / totalLogistica) * 100) : 0}%
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-100 mt-2">{logisticaConcluida}<span className="text-slate-600 text-sm">/{totalLogistica}</span></p>
          <p className="text-xs text-slate-500 mt-0.5">tarefas de chegada OK</p>
        </div>
      </div>

      {/* Linha principal */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Orçamento */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Composição do Orçamento</h2>
          <div className="space-y-3">
            {receitas.map(r => (
              <BarraOrcamento key={r.id} label={r.label} brl={r.valorBRL} pct={totalBRL > 0 ? r.valorBRL / totalBRL : 0} />
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between text-sm">
            <span className="text-slate-400">Total</span>
            <span className="text-slate-100 font-semibold">
              {fmt(totalBRL, 'BRL')} <span className="text-slate-500 font-normal">/ {fmt(totalEUR, 'EUR')}</span>
            </span>
          </div>
        </div>

        {/* Anel de progresso — docs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest self-start">Documentos 🇵🇹</h2>
          <div className="relative">
            <ProgressRing pct={pct} tamanho={120} espessura={11} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-100">{concluidos}</span>
              <span className="text-slate-500 text-xs">de {total}</span>
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            <PontoLegenda cor="#10B981" label="Concluído" />
            <PontoLegenda cor="#0284C7" label="Andamento" />
            <PontoLegenda cor="#475569" label="Pendente" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Prazos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Próximos Prazos</h2>
          <div className="space-y-3">
            {prazos.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  p.urgencia === 'alta' ? 'bg-red-500' : p.urgencia === 'media' ? 'bg-amber-500' : 'bg-teal-500'
                }`} />
                <span className="text-slate-200 text-sm flex-1">{p.label}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                  p.urgencia === 'alta' ? 'bg-red-950 text-red-400' : p.urgencia === 'media' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>{p.data}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status do visto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Progresso do Visto D3</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold text-slate-100">{etapasVistoConcluidas}
              <span className="text-slate-600 text-lg">/{etapasVisto.length}</span>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">etapas concluídas</p>
              <p className="text-slate-500 text-xs">Consulado · Salvador / Recife</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 mb-4">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${(etapasVistoConcluidas / etapasVisto.length) * 100}%`,
              background: 'linear-gradient(90deg, #F59E0B, #14B8A6)',
            }} />
          </div>
          {etapaAtual && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <span className="mt-0.5 text-amber-400 text-xs">●</span>
              <div>
                <p className="text-amber-300 text-xs font-semibold">Em andamento</p>
                <p className="text-slate-300 text-sm">{etapaAtual.titulo}</p>
                {etapaAtual.data && <p className="text-slate-500 text-xs mt-0.5">{etapaAtual.data}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
