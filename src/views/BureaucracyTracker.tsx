import { useState } from 'react'
import type { Documento, StatusDoc, PaisDestino } from '../types'
import { gerarId } from '../helpers'
import { BadgeStatus } from '../components/Badges'
import { IconeCheck, IconeGirar, IconeCadeado, IconeRelogio, IconeMais, IconeLixeira } from '../components/Icons'
import { Modal, CampoTexto, CampoSelect, BotaoSubmit, useModal } from '../components/Modal'
import { DocumentDetailModal } from '../components/DocumentDetailModal'
import { useLocalStorage } from '../hooks/useLocalStorage'

const PRESETS_DOCUMENTOS = [
  { nome: 'Passaporte Válido', desc: 'Polícia Federal · Válido por 1 a 10 anos com cópias', pais: 'AMBOS' as const, icone: '📘' },
  { nome: 'Certidão de Antecedentes Criminais', desc: 'Polícia Federal + Polícia Civil · Com Apostila de Haia', pais: 'AMBOS' as const, icone: '📜' },
  { nome: 'PB4 / CDAM (Seguro Saúde BR-PT)', desc: 'Ministério da Saúde · Acordo BR-PT · Substitui seguro viagem', pais: 'PT' as const, icone: '🏥' },
  { nome: 'NIF (Número de Identificação Fiscal)', desc: 'Finanças de Portugal · Via Representante Fiscal ou Presencial', pais: 'PT' as const, icone: '📑' },
  { nome: 'NISS (Segurança Social)', desc: 'Segurança Social Portugal · Necessário para contrato de trabalho', pais: 'PT' as const, icone: '💳' },
  { nome: 'Apostila de Haia — Diplomas e Históricos', desc: 'Cartório · Firma reconhecida e Apostila de Haia', pais: 'AMBOS' as const, icone: '🎓' },
  { nome: 'Apostila de Haia — Certidão de Nascimento', desc: 'Cartório de Registro Civil · Formato inteiro teor apostilado', pais: 'AMBOS' as const, icone: '👶' },
  { nome: 'Apostila de Haia — Certidão de Casamento', desc: 'Cartório · Apostilamento internacional para comprovação de união', pais: 'AMBOS' as const, icone: '💍' },
  { nome: 'Carta Convite / Termo de Alojamento', desc: 'Registrado em notário/cartório português atestando moradia', pais: 'PT' as const, icone: '🏠' },
  { nome: 'Comprovativo de Subsistência / IRPF', desc: 'Extratos bancários dos últimos 3 a 6 meses + Declaração de IRPF', pais: 'AMBOS' as const, icone: '💰' },
  { nome: 'Contrato de Trabalho / Promessa de Contrato', desc: 'Emitido por empresa em Portugal/Espanha com remuneração', pais: 'AMBOS' as const, icone: '💼' },
  { nome: 'Carta de Aceitação da Universidade', desc: 'Certificado oficial de admissão ou matrícula na faculdade', pais: 'AMBOS' as const, icone: '🏫' },
  { nome: 'NIE (Número de Identidad de Extranjero)', desc: 'Identificação fiscal de estrangeiros na Espanha', pais: 'ES' as const, icone: '🇪🇸' },
  { nome: 'Credencial UNEDasiss', desc: 'Homologação de notas brasileiras para o sistema de ensino espanhol', pais: 'ES' as const, icone: '🏛️' },
  { nome: 'Seguro Médico Privado sem Franquia', desc: 'Seguro saúde autorizado na Espanha com cobertura mínima de €30.000', pais: 'ES' as const, icone: '🩺' },
]

interface BureaucracyTrackerProps {
  docs: Documento[]
  setDocs: React.Dispatch<React.SetStateAction<Documento[]>>
}

export function BureaucracyTracker({ docs, setDocs }: BureaucracyTrackerProps) {
  const [pessoas, setPessoas] = useLocalStorage<string[]>('ep_vistos_pessoas', ['Alexandre', 'Andressa'])
  const [filtroPessoa, setFiltroPessoa] = useLocalStorage<string>('ep_doc_filtro_pessoa', 'TODOS')
  const [filtroPais, setFiltroPais] = useState<PaisDestino | 'TODOS'>('TODOS')
  const modalNovo = useModal()
  const [docSelecionado, setDocSelecionado] = useState<Documento | null>(null)

  const [novoNome, setNovoNome] = useState('')
  const [novoDesc, setNovoDesc] = useState('')
  const [novoPais, setNovoPais] = useState<Documento['pais']>('PT')
  const [novoPessoa, setNovoPessoa] = useState<string>('Alexandre')

  const avancarStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const targetDoc = docs.find(d => d.id === id)
    if (!targetDoc) return

    const bloqueado = targetDoc.bloqueadoPor?.some(bid => {
      const bloqueador = docs.find(dd => dd.id === bid)
      return bloqueador && bloqueador.status !== 'Concluído'
    })

    if (bloqueado) {
      setDocSelecionado(targetDoc)
      return
    }

    setDocs(prev => prev.map(d => {
      if (d.id !== id) return d
      const ordem: StatusDoc[] = ['Pendente', 'Em Andamento', 'Concluído']
      const proximo = ordem[(ordem.indexOf(d.status) + 1) % ordem.length]
      return { ...d, status: proximo }
    }))
  }

  const adicionar = () => {
    if (!novoNome.trim()) return
    const novo: Documento = {
      id: gerarId(),
      nome: novoNome,
      descricao: novoDesc,
      status: 'Pendente',
      pais: novoPais,
      pessoa: novoPessoa,
      anexos: [],
    }
    setDocs(prev => [...prev, novo])
    setNovoNome(''); setNovoDesc('')
    modalNovo.fechar()
  }

  const adicionarPreset = (preset: typeof PRESETS_DOCUMENTOS[number]) => {
    const destinoPessoa = filtroPessoa === 'TODOS' ? 'Alexandre' : filtroPessoa
    const novo: Documento = {
      id: gerarId(),
      nome: preset.nome,
      descricao: preset.desc,
      status: 'Pendente',
      pais: preset.pais,
      pessoa: destinoPessoa,
      anexos: [],
    }
    setDocs(prev => [...prev, novo])
  }

  const salvarDoc = (docAtualizado: Documento) => {
    setDocs(prev => prev.map(d => d.id === docAtualizado.id ? docAtualizado : d))
    if (docSelecionado?.id === docAtualizado.id) {
      setDocSelecionado(docAtualizado)
    }
  }

  const remover = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id))
    if (docSelecionado?.id === id) setDocSelecionado(null)
  }

  const docsFiltradosPorPais = filtroPais === 'TODOS'
    ? docs
    : docs.filter(d => d.pais === filtroPais || d.pais === 'AMBOS')

  const docsFiltrados = filtroPessoa === 'TODOS'
    ? docsFiltradosPorPais
    : docsFiltradosPorPais.filter(d => (d.pessoa || 'Ambos') === filtroPessoa || (d.pessoa || 'Ambos') === 'Ambos')

  const docsResolvidos = docsFiltrados.map(d => {
    const bloqueado = d.bloqueadoPor?.some(bid => {
      const bloqueador = docs.find(dd => dd.id === bid)
      return bloqueador && bloqueador.status !== 'Concluído'
    })
    return { ...d, statusResolvido: (bloqueado ? 'Bloqueado' : d.status) as StatusDoc }
  })

  const concluidos = docsResolvidos.filter(d => d.statusResolvido === 'Concluído').length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full">
      {/* Cabecalho */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <span>Rastreador de Burocracia</span>
            {filtroPessoa !== 'TODOS' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                👤 {filtroPessoa}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie documentos, anexos e pré-requisitos burocráticos por requerente</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-slate-100">{concluidos}<span className="text-slate-600 text-lg">/{docsResolvidos.length}</span></p>
            <p className="text-slate-500 text-xs">completos</p>
          </div>
          <button
            onClick={modalNovo.abrir}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all shadow-sm"
          >
            <IconeMais />
            <span>Novo Documento</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros (Pessoa & País) */}
      <div className="mb-6 space-y-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Filtro por Requerente / Pessoa */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 pl-1 uppercase tracking-wider text-[11px]">Requerente:</span>
          <button
            onClick={() => setFiltroPessoa('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroPessoa === 'TODOS'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            🌐 Todos os Requerentes
          </button>
          {pessoas.map(p => (
            <button
              key={p}
              onClick={() => setFiltroPessoa(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filtroPessoa === p
                  ? 'bg-sky-500 text-slate-950 shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <span>👤</span>
              <span>{p}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const nome = prompt('Digite o nome da pessoa / requerente:')
              if (nome && nome.trim()) {
                const limpo = nome.trim()
                if (!pessoas.includes(limpo)) {
                  setPessoas(prev => [...prev, limpo])
                }
                setFiltroPessoa(limpo)
              }
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all flex items-center gap-1"
          >
            <span>+</span> Nova Pessoa
          </button>
        </div>

        {/* Filtro por País */}
        <div className="flex items-center gap-2 flex-wrap border-t border-slate-800/80 pt-2.5">
          <span className="text-xs font-semibold text-slate-400 pl-1 uppercase tracking-wider text-[11px]">Destino:</span>
          {(['TODOS', 'PT', 'ES'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFiltroPais(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filtroPais === p
                  ? 'bg-slate-700 text-slate-100 font-bold border border-slate-600'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-950/60 border border-slate-800/80'
              }`}
            >
              {p === 'TODOS' ? '🌍 Todos os Países' : p === 'PT' ? '🇵🇹 Portugal' : '🇪🇸 Espanha'}
            </button>
          ))}
        </div>
      </div>

      {/* Adicionar Rápido: Documentos Mais Pedidos (Placeholders Frequentes) */}
      <div className="mb-6 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            ⚡ Adicionar Rápido — Documentos Mais Pedidos
          </span>
          <span className="text-[11px] text-slate-500">Clique para incluir na sua lista</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
          {PRESETS_DOCUMENTOS.map((preset, idx) => {
            const jaExiste = docs.some(d => d.nome.toLowerCase().includes(preset.nome.toLowerCase()))
            return (
              <button
                key={idx}
                type="button"
                onClick={() => adicionarPreset(preset)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  jaExiste
                    ? 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                    : 'bg-sky-500/10 border-sky-500/20 text-sky-300 hover:bg-sky-500/20 hover:border-sky-500/40'
                }`}
                title={preset.desc}
              >
                <span>{preset.icone}</span>
                <span>{preset.nome}</span>
                <span className="text-[10px] text-sky-400 font-bold">+</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-6 h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${docsResolvidos.length > 0 ? (concluidos / docsResolvidos.length) * 100 : 0}%`,
          background: 'linear-gradient(90deg, #14B8A6, #0284C7)',
        }} />
      </div>

      {/* Lista de Documentos */}
      <div className="space-y-3">
        {docsResolvidos.map(doc => {
          const estaBloqueado = doc.statusResolvido === 'Bloqueado'
          const numAnexos = doc.anexos?.length || 0

          return (
            <div
              key={doc.id}
              onClick={() => setDocSelecionado(doc)}
              className="group bg-slate-900 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-5 transition-all duration-150 shadow-sm cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={e => avancarStatus(doc.id, e)}
                  title={estaBloqueado ? 'Documento bloqueado. Clique para ver dependências.' : 'Clique para alternar o status do documento'}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-transform hover:scale-110 ${
                    doc.statusResolvido === 'Concluído' ? 'bg-emerald-500/20 text-emerald-400' :
                    doc.statusResolvido === 'Em Andamento' ? 'bg-sky-500/20 text-sky-400' :
                    doc.statusResolvido === 'Bloqueado' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {doc.statusResolvido === 'Concluído'    && <IconeCheck />}
                  {doc.statusResolvido === 'Em Andamento' && <IconeGirar />}
                  {doc.statusResolvido === 'Bloqueado'    && <IconeCadeado />}
                  {doc.statusResolvido === 'Pendente'     && <IconeRelogio />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${doc.statusResolvido === 'Concluído' ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                        {doc.nome}
                      </p>
                      {doc.pais && doc.pais !== 'AMBOS' && (
                        <span className="text-xs">{doc.pais === 'PT' ? '🇵🇹' : '🇪🇸'}</span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium flex items-center gap-1">
                        👤 {doc.pessoa || 'Ambos'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {numAnexos > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
                          📎 {numAnexos} {numAnexos === 1 ? 'anexo' : 'anexos'}
                        </span>
                      )}
                      <BadgeStatus status={doc.statusResolvido} />
                      <button
                        onClick={e => { e.stopPropagation(); remover(doc.id) }}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
                      >
                        <IconeLixeira />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{doc.descricao}</p>

                  {estaBloqueado && (
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 text-xs font-medium">Bloqueado por:</span>
                      {doc.bloqueadoPor?.map(bid => {
                        const bloqueador = docs.find(dd => dd.id === bid)
                        const isConcluido = bloqueador?.status === 'Concluído'
                        if (isConcluido) return null

                        return (
                          <div
                            key={bid}
                            className="inline-flex items-center gap-1.5 bg-red-950/80 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-lg text-xs"
                          >
                            <span className="font-medium">{bloqueador?.nome ?? bid}</span>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                if (bloqueador) {
                                  salvarDoc({ ...bloqueador, status: 'Concluído' })
                                }
                              }}
                              className="hover:bg-emerald-500/20 text-emerald-300 hover:text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-500/30 text-[10px] font-bold transition-all ml-0.5"
                              title="Concluir este pré-requisito para desbloquear"
                            >
                              ✓ Concluir
                            </button>
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation()
                                const novosBloq = (doc.bloqueadoPor || []).filter(id => id !== bid)
                                salvarDoc({ ...doc, bloqueadoPor: novosBloq })
                              }}
                              className="hover:bg-red-500/20 text-red-400 hover:text-red-200 px-1 py-0.2 rounded text-[10px] font-medium transition-all"
                              title="Remover pré-requisito"
                            >
                              ✕ Trava
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-4 text-center">Clique no card para gerenciar anexos / anotações ou no ícone para avançar status</p>

      {/* Modal Criar Documento */}
      <Modal aberto={modalNovo.aberto} onFechar={modalNovo.fechar} titulo="Novo Documento">
        {/* Modelos de Documentos Frequentes */}
        <div className="mb-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
            ⚡ Modelos Rápidos (Clique para auto-preencher)
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {PRESETS_DOCUMENTOS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setNovoNome(p.nome)
                  setNovoDesc(p.desc)
                  setNovoPais(p.pais)
                }}
                className="px-2 py-1 bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-800 hover:border-sky-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1"
              >
                <span>{p.icone}</span>
                <span>{p.nome}</span>
              </button>
            ))}
          </div>
        </div>

        <CampoTexto
          label="Nome do Documento"
          valor={novoNome}
          onChange={setNovoNome}
          placeholder="Ex: Certidão de Antecedentes Criminais (Polícia Federal)"
        />
        <CampoTexto
          label="Descrição / Detalhes"
          valor={novoDesc}
          onChange={setNovoDesc}
          placeholder="Ex: Polícia Federal · Com Apostila de Haia, validade de 90 dias..."
        />
        <CampoSelect label="País Destino" valor={novoPais ?? 'PT'} onChange={v => setNovoPais(v as Documento['pais'])} opcoes={[
          { value: 'PT', label: '🇵🇹 Portugal' },
          { value: 'ES', label: '🇪🇸 Espanha' },
          { value: 'AMBOS', label: '🌍 Ambos' },
        ]} />
        <CampoSelect label="Requerente / Pessoa" valor={novoPessoa} onChange={v => setNovoPessoa(v)} opcoes={[
          ...pessoas.map(p => ({ value: p, label: `👤 ${p}` })),
          { value: 'Ambos', label: '👥 Ambos' },
        ]} />
        <BotaoSubmit label="Adicionar Documento" onClick={adicionar} />
      </Modal>

      {/* Modal Detalhes do Documento */}
      <DocumentDetailModal
        documento={docSelecionado}
        todosDocs={docs}
        onFechar={() => setDocSelecionado(null)}
        onSalvar={salvarDoc}
        onRemover={remover}
      />
    </div>
  )
}

