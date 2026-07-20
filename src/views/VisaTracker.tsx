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
  // Lista e seleção de pessoas (requerentes)
  const [pessoas, setPessoas] = useLocalStorage<string[]>('ep_vistos_pessoas', ['Alexandre', 'Andressa'])
  const [pessoaAtiva, setPessoaAtiva] = useLocalStorage<string>('ep_visto_pessoa_ativa', 'Alexandre')

  // Visto selecionado por pessoa
  const [vistoIdPorPessoa, setVistoIdPorPessoa] = useLocalStorage<Record<string, TipoVistoId>>(
    'ep_visto_id_por_pessoa',
    { Alexandre: 'pt-d3', Andressa: 'pt-d4' }
  )

  const vistoId = vistoIdPorPessoa[pessoaAtiva] || 'pt-d3'
  const setVistoId = (id: TipoVistoId) => {
    setVistoIdPorPessoa(prev => ({ ...prev, [pessoaAtiva]: id }))
  }

  // Obtem a configuracao do visto atualmente ativo
  const vistoAtivo = CONFIGS_VISTO.find(v => v.id === vistoId) || CONFIGS_VISTO[0]

  // Chave composta para isolar por pessoa + visto
  const comboKey = `${pessoaAtiva}_${vistoId}`

  // Status consular atual por pessoa + visto
  const [statusConsularPorVisto, setStatusConsularPorVisto] = useLocalStorage<Record<string, StatusConsularVisto>>(
    'ep_status_consular_por_visto',
    {
      'Alexandre_pt-d3': 'VFS Enviado para Embaixada',
      'Andressa_pt-d4': 'Enviado para VFS',
    }
  )

  // Historico de datas e horarios de cada fase trocada
  const [historicoStatusPorVisto, setHistoricoStatusPorVisto] = useLocalStorage<Record<string, Record<string, string>>>(
    'ep_visto_historico_status',
    {
      'Alexandre_pt-d3': {
        'Documentação Pronta': '01/07/2026 10:00',
        'Enviado para VFS': '10/07/2026 14:30',
        'VFS Enviado para Embaixada': '18/07/2026 16:15',
      },
      'Andressa_pt-d4': {
        'Documentação Pronta': '05/07/2026 09:30',
        'Enviado para VFS': '15/07/2026 11:20',
      }
    }
  )

  // Codigo de protocolo de rastreamento VFS por pessoa + visto
  const [protocolosPorVisto, setProtocolosPorVisto] = useLocalStorage<Record<string, string>>(
    'ep_protocolos_vfs_por_visto',
    {
      'Alexandre_pt-d3': 'BR-SSA-2026-98421-X',
      'Andressa_pt-d4': 'BR-SSA-2026-10492-Y',
    }
  )

  const statusAtual = statusConsularPorVisto[comboKey] || statusConsularPorVisto[vistoId] || 'Documentação Pronta'
  const protocoloAtual = protocolosPorVisto[comboKey] || protocolosPorVisto[vistoId] || ''
  const historicoAtual = historicoStatusPorVisto[comboKey] || {}

  // Estado local para etapas e docs de cada visto + pessoa
  const [etapasDoVisto, setEtapasDoVisto] = useLocalStorage<Record<string, EtapaVisto[]>>(
    'ep_etapas_por_visto',
    {}
  )

  const [docsDoVisto, setDocsDoVisto] = useLocalStorage<Record<string, DocConsulado[]>>(
    'ep_docs_por_visto',
    {}
  )

  const etapasAtuais = etapasDoVisto[comboKey] || etapasDoVisto[vistoId] || vistoAtivo.etapas
  const docsAtuais = docsDoVisto[comboKey] || docsDoVisto[vistoId] || vistoAtivo.docsConsulado

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
    setStatusConsularPorVisto(prev => ({ ...prev, [comboKey]: novoStatus }))

    const agora = new Date()
    const dia = String(agora.getDate()).padStart(2, '0')
    const mes = String(agora.getMonth() + 1).padStart(2, '0')
    const ano = agora.getFullYear()
    const hora = String(agora.getHours()).padStart(2, '0')
    const min = String(agora.getMinutes()).padStart(2, '0')
    const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${min}`

    setHistoricoStatusPorVisto(prev => {
      const atual = prev[comboKey] || {}
      return {
        ...prev,
        [comboKey]: {
          ...atual,
          [novoStatus]: dataHoraFormatada,
        }
      }
    })
  }

  const mudoProtocolo = (proto: string) => {
    setProtocolosPorVisto(prev => ({ ...prev, [comboKey]: proto }))
  }

  const atualizarEtapas = (novasEtapas: EtapaVisto[]) => {
    setEtapasDoVisto(prev => ({ ...prev, [comboKey]: novasEtapas }))
    if (pessoaAtiva === 'Alexandre' && vistoId === 'pt-d3') setEtapas(novasEtapas)
  }

  const atualizarDocs = (novosDocs: DocConsulado[]) => {
    setDocsDoVisto(prev => ({ ...prev, [comboKey]: novosDocs }))
    if (pessoaAtiva === 'Alexandre' && vistoId === 'pt-d3') setDocsConsulado(novosDocs)
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

  const editarDataManual = (faseNome: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const valorAtual = historicoAtual[faseNome] || ''
    const entrada = prompt(`Digite a data e horário para a fase "${faseNome}":\n(Exemplo: 20/07/2026 14:30)`, valorAtual)
    if (entrada !== null) {
      setHistoricoStatusPorVisto(prev => {
        const atual = prev[comboKey] || {}
        if (!entrada.trim()) {
          const copia = { ...atual }
          delete copia[faseNome]
          return { ...prev, [comboKey]: copia }
        }
        return {
          ...prev,
          [comboKey]: {
            ...atual,
            [faseNome]: entrada.trim(),
          }
        }
      })
    }
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full space-y-6">
      {/* Cabecalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2 flex-wrap">
            <span>Planejamento de Visto & Imigração</span>
            <span className="text-xs px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
              👤 {pessoaAtiva}
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie o processo consular, checklist e tramitação VFS de <strong className="text-slate-200">{pessoaAtiva}</strong>
          </p>
        </div>

        {/* Seletor de Requerente / Pessoa */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shrink-0 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 pl-2">Requerente:</span>
          {pessoas.map(p => (
            <button
              key={p}
              onClick={() => setPessoaAtiva(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                pessoaAtiva === p
                  ? 'bg-sky-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>👤</span>
              <span>{p}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const nome = prompt('Digite o nome do requerente / pessoa:')
              if (nome && nome.trim()) {
                const limpo = nome.trim()
                if (!pessoas.includes(limpo)) {
                  setPessoas(prev => [...prev, limpo])
                }
                setPessoaAtiva(limpo)
              }
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all flex items-center gap-1"
          >
            <span>+</span> Nova Pessoa
          </button>
          {pessoas.length > 1 && (
            <button
              onClick={() => {
                if (confirm(`Remover ${pessoaAtiva} da lista de vistos?`)) {
                  const novas = pessoas.filter(p => p !== pessoaAtiva)
                  setPessoas(novas)
                  setPessoaAtiva(novas[0] || 'Alexandre')
                }
              }}
              className="px-2 py-1.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all"
              title={`Remover ${pessoaAtiva}`}
            >
              🗑️
            </button>
          )}
        </div>
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

        {/* Pipeline de Status Consular Com Horarios */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Status da Tramitação no Consulado / VFS Global ({pessoaAtiva})
            </label>
            <span className="text-[11px] text-amber-400 font-medium">
              💡 Clique na fase para alternar status ou clique no ✏️ para editar a data manualmente
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATUS_CONSULARES.map((s, idx) => {
              const dataFase = historicoAtual[s]
              const isAtual = statusAtual === s

              return (
                <div
                  key={s}
                  onClick={() => mudoStatusConsular(s)}
                  className={`p-3 rounded-xl border text-xs text-left transition-all flex flex-col justify-between min-h-[85px] cursor-pointer group/card ${
                    isAtual
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md ring-1 ring-amber-500/50'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 w-full mb-1">
                    <span className="text-[10px] text-slate-500 font-normal">{idx + 1}. FASE</span>
                    <button
                      type="button"
                      onClick={e => editarDataManual(s, e)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 hover:bg-amber-500/20 text-amber-300/90 font-mono border border-amber-500/20 transition-all flex items-center gap-1"
                      title="Clique para editar a data e horário manualmente"
                    >
                      <span>{dataFase ? `🕒 ${dataFase}` : '✏️ Data'}</span>
                    </button>
                  </div>
                  <span className="truncate leading-tight font-semibold mt-0.5">{s}</span>
                  {isAtual && (
                    <div className="mt-2 text-[10px] text-amber-400 font-medium flex items-center gap-1.5 border-t border-amber-500/30 pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      <span className="truncate">Fase Atual {dataFase ? `· ${dataFase}` : ''}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Timeline de Historico Consular */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                🕒 Histórico Registrado de Tramitação ({pessoaAtiva})
              </span>
              {Object.keys(historicoAtual).length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Deseja limpar todo o histórico de datas da tramitação de ${pessoaAtiva}?`)) {
                      setHistoricoStatusPorVisto(prev => ({ ...prev, [comboKey]: {} }))
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1"
                >
                  <span>🗑️</span> Limpar Histórico
                </button>
              )}
            </div>

            {Object.keys(historicoAtual).length === 0 ? (
              <p className="text-slate-500 text-xs py-2 italic">Nenhum histórico registrado ainda. Clique em uma fase acima para registrar a data/hora.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {STATUS_CONSULARES.map((s, idx) => {
                  const dataHora = historicoAtual[s]
                  if (!dataHora) return null
                  const isAtual = statusAtual === s
                  return (
                    <div
                      key={s}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                        isAtual
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 font-semibold'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Fase {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-amber-300 font-bold">{dataHora}</span>
                          <button
                            type="button"
                            onClick={e => editarDataManual(s, e)}
                            className="hover:text-amber-300 p-0.5 transition-all"
                            title="Editar esta data/hora"
                          >
                            ✏️
                          </button>
                        </div>
                      </div>
                      <p className="truncate font-medium">{s}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
          <InfoCardVisto label="Requerente Ativo" valor={pessoaAtiva} icone="👤" />
          <InfoCardVisto label="Visto Selecionado" valor={vistoAtivo.codigo} icone="🛂" />
          <InfoCardVisto label="Consulado Base" valor={vistoAtivo.consulado.split('(')[0]} icone="🏛️" />
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
              const docId = doc.id || `doc-${i}`
              const editando = docEmEdicaoId === docId
              return (
                <div
                  key={docId}
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
                        onKeyDown={e => e.key === 'Enter' && salvarEdicaoDoc(docId)}
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
                        onClick={() => salvarEdicaoDoc(docId)}
                        className="text-xs text-teal-400 font-bold px-2 py-0.5 rounded hover:bg-slate-800"
                      >
                        Salvar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setDocEmEdicaoId(docId)
                            setEditDocLabel(doc.label)
                          }}
                          title="Editar requisito"
                          className="p-1 rounded text-slate-500 hover:text-teal-400 hover:bg-slate-800 text-xs transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => excluirDoc(docId)}
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
