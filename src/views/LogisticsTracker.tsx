import { useState } from 'react'
import type { TarefaLogistica, StatusDoc, AnexoDocumento } from '../types'
import { gerarId } from '../helpers'
import { BadgeStatus } from '../components/Badges'
import { IconeCheck, IconeGirar, IconeRelogio, IconeMais, IconeLixeira } from '../components/Icons'
import { Modal, CampoTexto, BotaoSubmit, useModal } from '../components/Modal'
import { FileUploader } from '../components/FileUploader'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'

interface LogisticsTrackerProps {
  tarefas: TarefaLogistica[]
  setTarefas: React.Dispatch<React.SetStateAction<TarefaLogistica[]>>
}

export function LogisticsTracker({ tarefas, setTarefas }: LogisticsTrackerProps) {
  const modalNova = useModal()
  const [tarefaDetalhe, setTarefaDetalhe] = useState<TarefaLogistica | null>(null)
  const [anexoPreview, setAnexoPreview] = useState<AnexoDocumento | null>(null)

  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoDesc, setNovoDesc] = useState('')
  const [novoResponsavel, setNovoResponsavel] = useState('Alexandre')

  const concluidas = tarefas.filter(t => t.status === 'Concluído').length

  const mudoStatus = (id: string, novoStatus: StatusDoc) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, status: novoStatus } : t))
    if (tarefaDetalhe?.id === id) setTarefaDetalhe(prev => prev ? { ...prev, status: novoStatus } : null)
  }

  const avancar = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setTarefas(prev => prev.map(t => {
      if (t.id !== id) return t
      const ordem: StatusDoc[] = ['Pendente', 'Em Andamento', 'Concluído']
      const proximo = ordem[(ordem.indexOf(t.status) + 1) % ordem.length]
      return { ...t, status: proximo }
    }))
  }

  const adicionar = () => {
    if (!novoTitulo.trim()) return
    const nova: TarefaLogistica = {
      id: gerarId(),
      titulo: novoTitulo,
      descricao: novoDesc,
      responsavel: novoResponsavel.trim() || 'Alexandre',
      status: 'Pendente',
      anexos: [],
    }
    setTarefas(prev => [...prev, nova])
    setNovoTitulo('')
    setNovoDesc('')
    modalNova.fechar()
  }

  const salvarTarefa = (tarefaAtualizada: TarefaLogistica) => {
    setTarefas(prev => prev.map(t => t.id === tarefaAtualizada.id ? tarefaAtualizada : t))
    if (tarefaDetalhe?.id === tarefaAtualizada.id) setTarefaDetalhe(tarefaAtualizada)
  }

  const remover = (id: string) => {
    setTarefas(prev => prev.filter(t => t.id !== id))
    if (tarefaDetalhe?.id === id) setTarefaDetalhe(null)
  }

  // Agrupa dinamicamente tarefas por cada responsavel único
  const responsaveisUnicos = Array.from(new Set(tarefas.map(t => t.responsavel || 'Alexandre')))

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Logística de Chegada & Documentos</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão de tarefas de chegada, responsáveis personalizados e documentos anexados em PDF</p>
        </div>
        <button
          onClick={modalNova.abrir}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all shadow-sm"
        >
          <IconeMais /> Nova Tarefa Logística
        </button>
      </div>

      {/* Resumo de Progresso Geral */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-slate-100 font-bold text-base">Progresso das Atividades Logísticas</p>
          <p className="text-slate-400 text-xs mt-0.5">Acompanhamento e comprovantes organizados por responsável</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-teal-400">{concluidas}<span className="text-slate-600 text-lg">/{tarefas.length}</span></p>
          <p className="text-slate-500 text-xs">tarefas concluídas</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${tarefas.length > 0 ? (concluidas / tarefas.length) * 100 : 0}%`,
          background: 'linear-gradient(90deg, #8B5CF6, #14B8A6)',
        }} />
      </div>

      {/* Tarefas agrupadas dinamicamente por responsável */}
      {responsaveisUnicos.map(resp => {
        const items = tarefas.filter(t => (t.responsavel || 'Alexandre') === resp)
        if (items.length === 0) return null

        return (
          <div key={resp} className="space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              👤 Tarefas de: <span className="text-teal-400 font-bold">{resp}</span> ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map(tarefa => {
                const numAnexos = tarefa.anexos?.length || 0

                return (
                  <div
                    key={tarefa.id}
                    onClick={() => setTarefaDetalhe(tarefa)}
                    className="group bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        onClick={e => avancar(tarefa.id, e)}
                        title="Clique para avançar o status"
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all hover:scale-110 ${
                          tarefa.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400' :
                          tarefa.status === 'Em Andamento' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {tarefa.status === 'Concluído'    && <IconeCheck />}
                        {tarefa.status === 'Em Andamento' && <IconeGirar />}
                        {tarefa.status === 'Pendente'     && <IconeRelogio />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${tarefa.status === 'Concluído' ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                            {tarefa.titulo}
                          </p>
                          <div className="flex items-center gap-2">
                            <BadgeStatus status={tarefa.status} />
                            <button
                              onClick={e => { e.stopPropagation(); remover(tarefa.id) }}
                              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
                            >
                              <IconeLixeira />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">{tarefa.descricao}</p>

                        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-800/60">
                          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md border font-medium bg-slate-800 text-slate-300 border-slate-700">
                            👤 {tarefa.responsavel}
                          </span>

                          {/* Indicador de Anexos */}
                          <div className="flex items-center gap-2">
                            {numAnexos > 0 ? (
                              <span className="text-xs text-teal-400 font-semibold flex items-center gap-1 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/20">
                                📎 {numAnexos} {numAnexos === 1 ? 'documento anexado' : 'documentos anexados'}
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
                                + Anexar arquivo em PDF/imagem
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {tarefas.length === 0 && (
        <div className="p-12 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-3">
          <div className="text-4xl">📋</div>
          <p className="text-slate-300 font-semibold text-sm">Nenhuma tarefa logística cadastrada.</p>
          <button
            onClick={modalNova.abrir}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
          >
            <IconeMais /> Criar Primeira Tarefa Logística
          </button>
        </div>
      )}

      {/* Modal Criar Tarefa */}
      <Modal aberto={modalNova.aberto} onFechar={modalNova.fechar} titulo="Nova Tarefa Logística">
        <CampoTexto label="Título da Tarefa" valor={novoTitulo} onChange={setNovoTitulo} placeholder="Ex: Abrir Conta Bancária / Atestado de Morada" />
        <CampoTexto label="Descrição / Detalhes" valor={novoDesc} onChange={setNovoDesc} placeholder="Detalhes, prazos e orientações..." />
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
            Nome do Responsável
          </label>
          <input
            type="text"
            placeholder="Ex: Alexandre, Andressa ou outro nome"
            value={novoResponsavel}
            onChange={e => setNovoResponsavel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-teal-500"
          />
        </div>
        <BotaoSubmit label="Adicionar Tarefa" onClick={adicionar} />
      </Modal>

      {/* Modal Detalhes & Anexos da Tarefa Logistica */}
      {tarefaDetalhe && (
        <Modal aberto={Boolean(tarefaDetalhe)} onFechar={() => setTarefaDetalhe(null)} titulo="Detalhes & Anexos da Tarefa">
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{tarefaDetalhe.titulo}</h3>
              <p className="text-xs text-slate-400 mt-1">{tarefaDetalhe.descricao}</p>
            </div>

            {/* Responsavel Editavel */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Nome do Responsável
              </label>
              <input
                type="text"
                value={tarefaDetalhe.responsavel || ''}
                onChange={e => {
                  const at = { ...tarefaDetalhe, responsavel: e.target.value }
                  salvarTarefa(at)
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-400 font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Mudar Status */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Status da Tarefa
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Pendente', 'Em Andamento', 'Concluído'] as StatusDoc[]).map(st => (
                  <button
                    key={st}
                    onClick={() => mudoStatus(tarefaDetalhe.id, st)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      tarefaDetalhe.status === st
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload e Pre-visualizacao de Anexos */}
            <div className="pt-2 border-t border-slate-800">
              <FileUploader
                anexos={tarefaDetalhe.anexos}
                onAdicionarAnexo={anexo => {
                  const atualizada = { ...tarefaDetalhe, anexos: [...(tarefaDetalhe.anexos || []), anexo] }
                  salvarTarefa(atualizada)
                }}
                onRemoverAnexo={id => {
                  const atualizada = { ...tarefaDetalhe, anexos: (tarefaDetalhe.anexos || []).filter(a => a.id !== id) }
                  salvarTarefa(atualizada)
                }}
              />
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => remover(tarefaDetalhe.id)}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Excluir Tarefa
              </button>
              <button
                type="button"
                onClick={() => setTarefaDetalhe(null)}
                className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Salvar & Concluir
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Pre-visualizacao de Documento */}
      <DocumentPreviewModal
        anexo={anexoPreview}
        onFechar={() => setAnexoPreview(null)}
      />
    </div>
  )
}


