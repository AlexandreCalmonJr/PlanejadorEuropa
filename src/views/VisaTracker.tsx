import { useState } from 'react'
import type { EtapaVisto, StatusEtapa, DocConsulado, TipoVistoId, StatusConsularVisto } from '../types'
import { CONFIGS_VISTO } from '../data'
import { BadgeEtapa, BadgePais, BadgeStatusConsular } from '../components/Badges'
import { InfoCardVisto } from '../components/StatCard'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { gerarId } from '../helpers'
import { salvarItemSupabase, deletarItemSupabase, isSupabaseConfigured } from '../lib/supabase'

const STATUS_CONSULARES: StatusConsularVisto[] = [
  'Documentação Pronta',
  'Enviado para VFS',
  'VFS Enviado para Embaixada',
  'Chegou na Embaixada',
  'Embaixada Analisando',
  'Exigência / Correção',
  'Embaixada Enviando Passaporte',
  'Visto Concluído',
]

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

  // Status consular atual por visto
  const [statusConsularPorVisto, setStatusConsularPorVisto] = useLocalStorage<Record<string, StatusConsularVisto>>(
    'ep_status_consular_por_visto',
    {
      'pt-d3': 'VFS Enviado para Embaixada',
      'pt-d8': 'Documentação Pronta',
      'pt-procura': 'Documentação Pronta',
      'pt-d4': 'Enviado para VFS',
      'es-estudante': 'Documentação Pronta',
    }
  )

  // Codigo de protocolo de rastreamento VFS por visto
  const [protocolosPorVisto, setProtocolosPorVisto] = useLocalStorage<Record<string, string>>(
    'ep_protocolos_vfs_por_visto',
    {
      'pt-d3': 'BR-SSA-2026-98421-X',
    }
  )

  const statusAtual = statusConsularPorVisto[vistoId] || 'Documentação Pronta'
  const protocoloAtual = protocolosPorVisto[vistoId] || ''

  // Estado local para etapas e docs de cada visto
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

  const etapasAtuais = etapasDoVisto[vistoId] || vistoAtivo.etapas
  const docsAtuais = docsDoVisto[vistoId] || vistoAtivo.docsConsulado

  // Estados para modais / formularios de criacao e edicao
  const [modalEtapaAberta, setModalEtapaAberta] = useState(false)
  const [etapaEmEdicao, setEtapaEmEdicao] = useState<EtapaVisto | null>(null)
  const [novaEtapaTitulo, setNovaEtapaTitulo] = useState('')
  const [novaEtapaDescricao, setNovaEtapaDescricao] = useState('')
  const [novaEtapaData, setNovaEtapaData] = useState('')
  const [novaEtapaStatus, setNovaEtapaStatus] = useState<StatusEtapa>('Pendente')

  // Estados para novo doc no checklist
  const [novoDocLabel, setNovoDocLabel] = useState('')
  const [docEmEdicaoId, setDocEmEdicaoId] = useState<string | null>(null)
  const [editDocLabel, setEditDocLabel] = useState('')

  const concluidas = etapasAtuais.filter(e => e.status === 'Concluído').length
  const pct = etapasAtuais.length > 0 ? concluidas / etapasAtuais.length : 0
  const docsOk = docsAtuais.filter(d => d.ok).length

  const mudoStatusConsular = (novoStatus: StatusConsularVisto) => {
    setStatusConsularPorVisto(prev => ({ ...prev, [vistoId]: novoStatus }))
  }

  const mudoProtocolo = (proto: string) => {
    setProtocolosPorVisto(prev => ({ ...prev, [vistoId]: proto }))
  }

  const atualizarEtapas = (novasEtapas: EtapaVisto[]) => {
    setEtapasDoVisto(prev => ({ ...prev, [vistoId]: novasEtapas }))
    if (vistoId === 'pt-d3') setEtapas(novasEtapas)
  }

  const atualizarDocs = (novosDocs: DocConsulado[]) => {
    setDocsDoVisto(prev => ({ ...prev, [vistoId]: novosDocs }))
    if (vistoId === 'pt-d3') setDocsConsulado(novosDocs)
  }

  const avancarEtapa = (id: string) => {
    const novasEtapas = etapasAtuais.map(e => {
      if (e.id !== id) return e
      const ordem: StatusEtapa[] = ['Pendente', 'Em Andamento', 'Concluído']
      const proximo = ordem[(ordem.indexOf(e.status) + 1) % ordem.length]
      const atualizado = { ...e, status: proximo }
      if (isSupabaseConfigured) {
        salvarItemSupabase('etapas_visto', atualizado)
      }
      return atualizado
    })
    atualizarEtapas(novasEtapas)
  }

  // --- CRUD de Etapas ---
  const abrirModalCriarEtapa = () => {
    setEtapaEmEdicao(null)
    setNovaEtapaTitulo('')
    setNovaEtapaDescricao('')
    setNovaEtapaData('')
    setNovaEtapaStatus('Pendente')
    setModalEtapaAberta(true)
  }

  const abrirModalEditarEtapa = (etapa: EtapaVisto) => {
    setEtapaEmEdicao(etapa)
    setNovaEtapaTitulo(etapa.titulo)
    setNovaEtapaDescricao(etapa.descricao)
    setNovaEtapaData(etapa.data || '')
    setNovaEtapaStatus(etapa.status)
    setModalEtapaAberta(true)
  }

  const salvarEtapa = () => {
    if (!novaEtapaTitulo.trim()) return

    if (etapaEmEdicao) {
      const atualizada: EtapaVisto = {
        ...etapaEmEdicao,
        titulo: novaEtapaTitulo.trim(),
        descricao: novaEtapaDescricao.trim(),
        data: novaEtapaData.trim() || undefined,
        status: novaEtapaStatus,
      }
      const novas = etapasAtuais.map(e => (e.id === etapaEmEdicao.id ? atualizada : e))
      atualizarEtapas(novas)
      if (isSupabaseConfigured) salvarItemSupabase('etapas_visto', atualizada)
    } else {
      const nova: EtapaVisto = {
        id: gerarId(),
        titulo: novaEtapaTitulo.trim(),
        descricao: novaEtapaDescricao.trim(),
        data: novaEtapaData.trim() || undefined,
        status: novaEtapaStatus,
      }
      const novas = [...etapasAtuais, nova]
      atualizarEtapas(novas)
      if (isSupabaseConfigured) salvarItemSupabase('etapas_visto', nova)
    }

    setModalEtapaAberta(false)
  }

  const excluirEtapa = (id: string) => {
    if (!confirm('Deseja realmente remover esta etapa do processo?')) return
    const novas = etapasAtuais.filter(e => e.id !== id)
    atualizarEtapas(novas)
    if (isSupabaseConfigured) deletarItemSupabase('etapas_visto', id)
  }

  // --- CRUD de Pasta Consular (Docs) ---
  const toggleDoc = (idOuIndex: string | number) => {
    const novosDocs = docsAtuais.map((d, idx) => {
      const match = typeof idOuIndex === 'string' ? d.id === idOuIndex : idx === idOuIndex
      if (!match) return d
      const atualizado = { ...d, ok: !d.ok }
      if (isSupabaseConfigured) salvarItemSupabase('docs_consulado', atualizado)
      return atualizado
    })
    atualizarDocs(novosDocs)
  }

  const adicionarDoc = () => {
    if (!novoDocLabel.trim()) return
    const novo: DocConsulado = {
      id: gerarId(),
      label: novoDocLabel.trim(),
      ok: false,
    }
    const novos = [...docsAtuais, novo]
    atualizarDocs(novos)
    if (isSupabaseConfigured) salvarItemSupabase('docs_consulado', novo)
    setNovoDocLabel('')
  }

  const salvarEdicaoDoc = (id: string) => {
    if (!editDocLabel.trim()) return
    const novos = docsAtuais.map(d => {
      if (d.id !== id) return d
      const atualizado = { ...d, label: editDocLabel.trim() }
      if (isSupabaseConfigured) salvarItemSupabase('docs_consulado', atualizado)
      return atualizado
    })
    atualizarDocs(novos)
    setDocEmEdicaoId(null)
  }

  const excluirDoc = (id: string) => {
    const novos = docsAtuais.filter(d => d.id !== id)
    atualizarDocs(novos)
    if (isSupabaseConfigured) deletarItemSupabase('docs_consulado', id)
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full space-y-6">
      {/* Cabecalho */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Planejamento de Visto & Imigração</h1>
        <p className="text-slate-400 text-sm mt-1">Gerencie etapas personalizadas, checklist consular e a tramitação VFS Global</p>
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

      {/* Cartao do Visto & Status Consular */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-100">{vistoAtivo.titulo}</h2>
              <BadgePais pais={vistoAtivo.pais} />
              <BadgeStatusConsular status={statusAtual} />
            </div>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">{vistoAtivo.descricao}</p>
          </div>

          {/* Campo de Protocolo VFS */}
          <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Protocolo VFS:</span>
            <input
              type="text"
              placeholder="Ex: BR-SSA-2026-XXXXX"
              value={protocoloAtual}
              onChange={e => mudoProtocolo(e.target.value)}
              className="bg-transparent text-xs text-amber-300 font-mono font-bold focus:outline-none w-44"
            />
          </div>
        </div>

        {/* Pipeline de Status Consular Realista */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Status da Tramitação no Consulado / VFS Global
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATUS_CONSULARES.map((s, idx) => (
              <button
                key={s}
                onClick={() => mudoStatusConsular(s)}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all flex flex-col justify-between ${
                  statusAtual === s
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-500 font-normal">{idx + 1}. FASE</span>
                <span className="truncate leading-tight mt-0.5">{s}</span>
              </button>
            ))}
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
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Etapas do Processo</h2>
              <p className="text-[11px] text-slate-500">{concluidas}/{etapasAtuais.length} concluídas</p>
            </div>
            <button
              onClick={abrirModalCriarEtapa}
              className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <span>+</span> Nova Etapa
            </button>
          </div>

          <div className="mb-5 h-1.5 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct * 100}%`,
                background: 'linear-gradient(90deg, #F59E0B, #14B8A6)',
              }}
            />
          </div>

          {etapasAtuais.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed text-slate-500 text-xs">
              Nenhuma etapa cadastrada. Clique no botão acima para adicionar a primeira etapa!
            </div>
          ) : (
            <div className="relative space-y-4">
              {etapasAtuais.map((etapa, idx) => {
                const ehUltima = idx === etapasAtuais.length - 1
                return (
                  <div key={etapa.id || idx} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => avancarEtapa(etapa.id)}
                        title="Clique para alterar status"
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
                      <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                          <p className={`text-sm font-semibold ${etapa.status === 'Concluído' ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                            {etapa.titulo}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <BadgeEtapa status={etapa.status} />
                            <button
                              onClick={() => abrirModalEditarEtapa(etapa)}
                              title="Editar Etapa"
                              className="p-1 rounded text-slate-500 hover:text-teal-400 hover:bg-slate-800 text-xs transition-colors"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => excluirEtapa(etapa.id)}
                              title="Excluir Etapa"
                              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 text-xs transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        {etapa.descricao && (
                          <p className="text-slate-400 text-xs leading-relaxed mt-1">{etapa.descricao}</p>
                        )}
                        {etapa.data && (
                          <p className="text-slate-500 text-[11px] mt-2 flex items-center gap-1 font-mono">
                            <span>📅</span> {etapa.data}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <p className="text-slate-600 text-xs mt-3">Clique no ícone numerado para alternar rapidamente entre Pendente, Em Andamento e Concluído.</p>
        </div>

        {/* Checklist da Pasta Consular */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pasta Consular</h2>
              <p className="text-[11px] text-slate-500">{docsOk}/{docsAtuais.length} prontos</p>
            </div>
          </div>

          <div className="mb-4 h-1.5 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(docsOk / Math.max(docsAtuais.length, 1)) * 100}%`,
                background: 'linear-gradient(90deg, #0284C7, #14B8A6)',
              }}
            />
          </div>

          {/* Form para adicionar novo documento ao checklist */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              placeholder="Adicionar novo requisito ou documento à pasta..."
              value={novoDocLabel}
              onChange={e => setNovoDocLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adicionarDoc()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
            />
            <button
              onClick={adicionarDoc}
              className="px-3 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition-colors"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2">
            {docsAtuais.map((doc, i) => {
              const editando = docEmEdicaoId === doc.id
              return (
                <div
                  key={doc.id || i}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-150 ${
                    doc.ok
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleDoc(doc.id || i)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 ${
                        doc.ok ? 'bg-emerald-500' : 'bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {doc.ok && <span className="text-white text-xs">✓</span>}
                    </button>

                    {editando ? (
                      <input
                        type="text"
                        value={editDocLabel}
                        onChange={e => setEditDocLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && salvarEdicaoDoc(doc.id)}
                        autoFocus
                        className="flex-1 bg-slate-950 border border-teal-500/50 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none"
                      />
                    ) : (
                      <p
                        onClick={() => toggleDoc(doc.id || i)}
                        className={`text-xs leading-relaxed cursor-pointer truncate ${
                          doc.ok ? 'text-slate-500 line-through' : 'text-slate-300'
                        }`}
                      >
                        {doc.label}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {editando ? (
                      <button
                        onClick={() => salvarEdicaoDoc(doc.id)}
                        className="text-xs text-teal-400 font-bold px-2 py-0.5 rounded hover:bg-slate-800"
                      >
                        Salvar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setDocEmEdicaoId(doc.id)
                            setEditDocLabel(doc.label)
                          }}
                          title="Editar requisito"
                          className="p-1 rounded text-slate-500 hover:text-teal-400 hover:bg-slate-800 text-xs transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => excluirDoc(doc.id)}
                          title="Remover documento"
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 text-xs transition-colors"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-xs font-semibold mb-1">⚠ Recomendação Consular</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Leve sempre a pasta completa com os documentos impressos, cópias e originais apostilados segundo as regras do consulado de {vistoAtivo.pais === 'PT' ? 'Portugal' : 'Espanha'}.
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Criar / Editar Etapa */}
      {modalEtapaAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100">
                {etapaEmEdicao ? 'Editar Etapa do Processo' : 'Nova Etapa do Processo'}
              </h3>
              <button
                onClick={() => setModalEtapaAberta(false)}
                className="text-slate-400 hover:text-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Título da Etapa</label>
                <input
                  type="text"
                  placeholder="Ex: Apostilamento de Haia dos Diplomas"
                  value={novaEtapaTitulo}
                  onChange={e => setNovaEtapaTitulo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Descrição detalhada</label>
                <textarea
                  placeholder="Instruções ou resumo da etapa..."
                  value={novaEtapaDescricao}
                  onChange={e => setNovaEtapaDescricao(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Data ou Prazo</label>
                  <input
                    type="text"
                    placeholder="Ex: Jul 2026 ou 28 Ago"
                    value={novaEtapaData}
                    onChange={e => setNovaEtapaData(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500/50"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Status Inicial</label>
                  <select
                    value={novaEtapaStatus}
                    onChange={e => setNovaEtapaStatus(e.target.value as StatusEtapa)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500/50"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalEtapaAberta(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEtapa}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors"
              >
                {etapaEmEdicao ? 'Salvar Alterações' : 'Criar Etapa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
