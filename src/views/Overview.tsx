import { fmt } from '../helpers'
import type { ItemFinanceiro, Documento, EtapaVisto, Prazo, Vaga, Faculdade, TarefaLogistica, Voo } from '../types'
import { ProgressRing } from '../components/ProgressRing'
import { CardEstatistica, BarraOrcamento, PontoLegenda } from '../components/StatCard'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface ContadorRegressivo {
  id: string
  label: string
  data: string
  icone: string
}

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
  const [contadores] = useLocalStorage<ContadorRegressivo[]>('ep_countdowns', [])

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

  // Proximos passos e prazos integrados de TODO o sistema
  const prazosSistema = [
    ...etapasVisto
      .filter(e => e.status !== 'Concluído')
      .map(e => ({
        id: `visto-${e.id}`,
        label: e.titulo,
        data: e.data || 'Em Andamento',
        urgencia: (e.status === 'Em Andamento' ? 'alta' : 'media') as 'alta' | 'media' | 'baixa',
        modulo: '🛂 Visto',
        corModulo: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      })),
    ...documentos
      .filter(d => d.status === 'Em Andamento' || (d.bloqueadoPor && d.bloqueadoPor.length > 0))
      .map(d => {
        const estaBloq = d.bloqueadoPor?.some(bid => {
          const b = documentos.find(x => x.id === bid)
          return b && b.status !== 'Concluído'
        })
        return {
          id: `doc-${d.id}`,
          label: d.nome,
          data: estaBloq ? 'Trava Ativa' : d.status === 'Em Andamento' ? 'Em Andamento' : 'Pendente',
          urgencia: (estaBloq ? 'alta' : 'media') as 'alta' | 'media' | 'baixa',
          modulo: d.pessoa ? `📜 Doc (${d.pessoa})` : '📜 Burocracia',
          corModulo: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
        }
      }),
    ...tarefasLogistica
      .filter(t => t.status !== 'Concluído')
      .slice(0, 2)
      .map(t => ({
        id: `log-${t.id}`,
        label: t.titulo,
        data: t.dataConclusao || 'Chegada PT',
        urgencia: 'media' as const,
        modulo: '📦 Logística',
        corModulo: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      })),
    ...prazos.map((p, i) => ({
      id: `prazo-exp-${i}`,
      label: p.label,
      data: p.data,
      urgencia: p.urgencia,
      modulo: '🗓 Meta',
      corModulo: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    }))
  ]

  // ─── Progresso Geral da Imigração ─────────────────────────────────────────
  const progressoModulos = [
    { label: '📜 Documentos', concluido: concluidos, total: total || 1, cor: '#0EA5E9' },
    { label: '🛂 Visto', concluido: etapasVistoConcluidas, total: etapasVisto.length || 1, cor: '#F97316' },
    { label: '📦 Logística', concluido: logisticaConcluida, total: totalLogistica || 1, cor: '#10B981' },
    { label: '💼 Vagas', concluido: vagas.filter(v => v.coluna === 'Oferta').length, total: Math.max(vagasCandidatadas, 1), cor: '#0284C7' },
  ]
  const progressoGeral = progressoModulos.reduce((s, m) => s + (m.concluido / m.total), 0) / progressoModulos.length
  const pctGeral = Math.round(progressoGeral * 100)

  // ─── Contadores Regressivos ────────────────────────────────────────────────
  const hoje = new Date()

  return (
    <div className="p-6 md:p-8 w-full pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Visão Geral & Painel de Controle</h1>
        <p className="text-slate-400 text-sm mt-1">Sua jornada de imigração · Alexandre & Andressa · Salvador → Coimbra</p>
      </div>

      {/* ─── BARRA DE PROGRESSO GERAL ─── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            📊 Progresso Geral da Imigração
          </h2>
          <span className={`text-lg font-black ${pctGeral >= 75 ? 'text-teal-400' : pctGeral >= 40 ? 'text-amber-400' : 'text-orange-400'}`}>
            {pctGeral}%
          </span>
        </div>
        {/* Barra principal */}
        <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${pctGeral}%`,
              background: pctGeral >= 75
                ? 'linear-gradient(90deg, #14B8A6, #10B981)'
                : pctGeral >= 40
                  ? 'linear-gradient(90deg, #F59E0B, #F97316)'
                  : 'linear-gradient(90deg, #F97316, #EF4444)',
            }}
          />
        </div>
        {/* Mini-barras por módulo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {progressoModulos.map(m => {
            const p = Math.round((m.concluido / m.total) * 100)
            return (
              <div key={m.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{m.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: m.cor }}>{m.concluido}/{m.total}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p}%`, background: m.cor }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── CONTADORES REGRESSIVOS ─── */}
      {contadores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {contadores.slice(0, 4).map(c => {
            const dataAlvo = new Date(c.data + 'T00:00:00')
            const diffMs = dataAlvo.getTime() - hoje.getTime()
            const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
            const passado = diffDias < 0
            return (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{c.icone}</span>
                  <span className="text-[11px] text-slate-400 font-medium truncate">{c.label}</span>
                </div>
                <p className={`text-2xl font-black ${passado ? 'text-red-400' : diffDias <= 30 ? 'text-amber-400' : 'text-teal-400'}`}>
                  {passado ? `${Math.abs(diffDias)}d atrás` : `${diffDias} dias`}
                </p>
                <p className="text-slate-600 text-[10px] mt-0.5">
                  {dataAlvo.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )
          })}
        </div>
      )}

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
        {/* Prazos & Proximos Passos Integrados */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span>Próximos Passos & Prazos</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                  ⚡ Sincronizado
                </span>
              </h2>
              <span className="text-xs text-slate-500">{prazosSistema.length} pendentes</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {prazosSistema.map(p => (
                <div key={p.id} className="flex items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      p.urgencia === 'alta' ? 'bg-red-500 animate-pulse' : p.urgencia === 'media' ? 'bg-amber-500' : 'bg-teal-500'
                    }`} />
                    <span className="text-slate-200 text-xs font-semibold truncate">{p.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${p.corModulo}`}>
                      {p.modulo}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${
                      p.urgencia === 'alta' ? 'bg-red-950/80 text-red-400 border border-red-500/30' : p.urgencia === 'media' ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {p.data}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 border-t border-slate-800/80 pt-2.5 text-center">
            💡 Atualizações em Vistos, Documentos e Logística refletem automaticamente aqui.
          </p>
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
