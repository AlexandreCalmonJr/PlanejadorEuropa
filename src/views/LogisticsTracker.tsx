import { useState } from 'react'
import type { TarefaLogistica, StatusDoc, ResponsavelTarefa } from '../types'
import { gerarId } from '../helpers'
import { BadgeStatus } from '../components/Badges'
import { IconeCheck, IconeGirar, IconeRelogio, IconeMais, IconeLixeira } from '../components/Icons'
import { Modal, CampoTexto, CampoSelect, BotaoSubmit, useModal } from '../components/Modal'

interface LogisticsTrackerProps {
  tarefas: TarefaLogistica[]
  setTarefas: React.Dispatch<React.SetStateAction<TarefaLogistica[]>>
}

const BADGE_RESPONSAVEL: Record<ResponsavelTarefa, { bg: string; txt: string; label: string }> = {
  ANFITRIAO: { bg: 'bg-violet-500/10 border-violet-500/20', txt: 'text-violet-400', label: '👩 Mãe (Coimbra)' },
  TITULAR: { bg: 'bg-sky-500/10 border-sky-500/20', txt: 'text-sky-400', label: '👤 Alexandre' },
  AMBOS: { bg: 'bg-amber-500/10 border-amber-500/20', txt: 'text-amber-400', label: '👥 Alexandre & Andressa' },
}

export function LogisticsTracker({ tarefas, setTarefas }: LogisticsTrackerProps) {
  const modal = useModal()
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoDesc, setNovoDesc] = useState('')
  const [novoResponsavel, setNovoResponsavel] = useState<ResponsavelTarefa>('TITULAR')

  const concluidas = tarefas.filter(t => t.status === 'Concluído').length

  const avancar = (id: string) => {
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
      responsavel: novoResponsavel,
      status: 'Pendente',
    }
    setTarefas(prev => [...prev, nova])
    setNovoTitulo(''); setNovoDesc('')
    modal.fechar()
  }

  const remover = (id: string) => setTarefas(prev => prev.filter(t => t.id !== id))

  // Agrupamentos
  const tarefasAnfitriao = tarefas.filter(t => t.responsavel === 'ANFITRIAO')
  const tarefasTitular = tarefas.filter(t => t.responsavel === 'TITULAR')
  const tarefasAmbos = tarefas.filter(t => t.responsavel === 'AMBOS')

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Logística de Chegada</h1>
          <p className="text-slate-400 text-sm mt-1">Tarefas pré-chegada em Coimbra · Coordenação com a família</p>
        </div>
        <button
          onClick={modal.abrir}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
        >
          <IconeMais /> Nova Tarefa
        </button>
      </div>

      {/* Info card do anfitrião */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8B5CF6, #14B8A6)' }}>
            <span className="text-xl">🏠</span>
          </div>
          <div className="flex-1">
            <p className="text-slate-100 font-semibold text-sm">Base Logística — Coimbra</p>
            <p className="text-slate-400 text-xs mt-0.5">Anfitrião: Mãe · Residente legal em Portugal</p>
            <p className="text-slate-500 text-xs mt-0.5">Suporte: Carta Convite, Representação Fiscal, Alojamento temporário</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-slate-100">{concluidas}<span className="text-slate-600 text-lg">/{tarefas.length}</span></p>
            <p className="text-slate-500 text-xs">concluídas</p>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-6 h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${tarefas.length > 0 ? (concluidas / tarefas.length) * 100 : 0}%`,
          background: 'linear-gradient(90deg, #8B5CF6, #14B8A6)',
        }} />
      </div>

      {/* Tarefas agrupadas por responsável */}
      {[
        { titulo: '👩 Responsabilidade da Mãe (Anfitrião)', items: tarefasAnfitriao },
        { titulo: '👤 Responsabilidade do Alexandre (Titular)', items: tarefasTitular },
        { titulo: '👥 Alexandre & Andressa (Ambos)', items: tarefasAmbos },
      ].map(grupo => grupo.items.length > 0 && (
        <div key={grupo.titulo} className="mb-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{grupo.titulo}</h2>
          <div className="space-y-3">
            {grupo.items.map(tarefa => (
              <div
                key={tarefa.id}
                onClick={() => avancar(tarefa.id)}
                className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    tarefa.status === 'Concluído' ? 'bg-emerald-500/10' :
                    tarefa.status === 'Em Andamento' ? 'bg-sky-500/10' : 'bg-slate-800'
                  }`}>
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
                    <p className="text-slate-500 text-xs mt-1">{tarefa.descricao}</p>
                    <div className="mt-2">
                      {(() => {
                        const badge = BADGE_RESPONSAVEL[tarefa.responsavel]
                        return (
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border font-medium ${badge.bg} ${badge.txt}`}>
                            {badge.label}
                          </span>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <p className="text-slate-600 text-xs text-center">Clique em qualquer tarefa para avançar seu status</p>

      {/* Modal */}
      <Modal aberto={modal.aberto} onFechar={modal.fechar} titulo="Nova Tarefa Logística">
        <CampoTexto label="Título" valor={novoTitulo} onChange={setNovoTitulo} placeholder="Ex: Abrir conta bancária" />
        <CampoTexto label="Descrição" valor={novoDesc} onChange={setNovoDesc} placeholder="Detalhes e observações..." />
        <CampoSelect label="Responsável" valor={novoResponsavel} onChange={setNovoResponsavel} opcoes={[
          { value: 'TITULAR', label: '👤 Alexandre (Titular)' },
          { value: 'ANFITRIAO', label: '👩 Mãe (Anfitrião)' },
          { value: 'AMBOS', label: '👥 Ambos' },
        ]} />
        <BotaoSubmit label="Adicionar Tarefa" onClick={adicionar} />
      </Modal>
    </div>
  )
}

