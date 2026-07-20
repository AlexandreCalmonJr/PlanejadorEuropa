import { useState, useRef } from 'react'
import type { Vaga, ColunaKanban } from '../types'
import { fmtK, gerarId } from '../helpers'
import { COLUNAS_KANBAN, CORES_COLUNAS_KANBAN } from '../data'
import { IconeMais, IconeLixeira } from '../components/Icons'
import { Modal, CampoTexto, CampoNumero, CampoToggle, BotaoSubmit, useModal } from '../components/Modal'

const CORES_CARD = ['#14B8A6', '#0284C7', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#F97316', '#E11D48', '#6366F1']

interface JobBoardProps {
  vagas: Vaga[]
  setVagas: React.Dispatch<React.SetStateAction<Vaga[]>>
}

export function JobBoard({ vagas, setVagas }: JobBoardProps) {
  const [arrastando, setArrastando] = useState<string | null>(null)
  const sobreRef = useRef<ColunaKanban | null>(null)
  const modal = useModal()

  // Novo vaga form
  const [novaEmpresa, setNovaEmpresa] = useState('')
  const [novoCargo, setNovoCargo] = useState('')
  const [novoSalarioMin, setNovoSalarioMin] = useState(30000)
  const [novoSalarioMax, setNovoSalarioMax] = useState(45000)
  const [novoPatrocinio, setNovoPatrocinio] = useState(false)
  const [novaCidade, setNovaCidade] = useState('')

  const handleDragStart = (id: string) => setArrastando(id)
  const handleDragEnd = () => {
    if (arrastando && sobreRef.current) {
      setVagas(prev => prev.map(v => v.id === arrastando ? { ...v, coluna: sobreRef.current! } : v))
    }
    setArrastando(null)
    sobreRef.current = null
  }

  const adicionarVaga = () => {
    if (!novaEmpresa.trim() || !novoCargo.trim()) return
    const cor = CORES_CARD[vagas.length % CORES_CARD.length]
    const nova: Vaga = {
      id: gerarId(),
      empresa: novaEmpresa,
      cargo: novoCargo,
      salarioMin: novoSalarioMin,
      salarioMax: novoSalarioMax,
      patrocinioVisto: novoPatrocinio,
      coluna: 'Candidatado',
      inicial: novaEmpresa[0]?.toUpperCase() ?? '?',
      cor,
      cidade: novaCidade,
    }
    setVagas(prev => [...prev, nova])
    setNovaEmpresa(''); setNovoCargo(''); setNovaCidade(''); setNovoPatrocinio(false)
    modal.fechar()
  }

  const removerVaga = (id: string) => setVagas(prev => prev.filter(v => v.id !== id))

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Quadro de Vagas</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe suas candidaturas em empresas de tecnologia · Portugal</p>
        </div>
        <button
          onClick={modal.abrir}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
        >
          <IconeMais /> Nova Vaga
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {COLUNAS_KANBAN.map(col => {
          const colVagas = vagas.filter(v => v.coluna === col)
          return (
            <div
              key={col}
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={e => { e.preventDefault(); sobreRef.current = col }}
            >
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CORES_COLUNAS_KANBAN[col] }} />
                <h3 className="text-slate-200 text-sm font-semibold">{col}</h3>
                <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{colVagas.length}</span>
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-2xl p-3 space-y-3 border border-slate-800/60">
                {colVagas.map(vaga => (
                  <CartaoVaga
                    key={vaga.id}
                    vaga={vaga}
                    arrastando={arrastando === vaga.id}
                    onDragStart={() => handleDragStart(vaga.id)}
                    onDragEnd={handleDragEnd}
                    onRemover={() => removerVaga(vaga.id)}
                  />
                ))}
                {colVagas.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                    Arraste até aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-3 text-center md:text-left">Arraste os cartões entre colunas para atualizar o status</p>

      {/* Modal Nova Vaga */}
      <Modal aberto={modal.aberto} onFechar={modal.fechar} titulo="Nova Candidatura">
        <CampoTexto label="Empresa" valor={novaEmpresa} onChange={setNovaEmpresa} placeholder="Ex: Critical TechWorks" />
        <CampoTexto label="Cargo" valor={novoCargo} onChange={setNovoCargo} placeholder="Ex: Desenvolvedor Full Stack" />
        <CampoTexto label="Cidade" valor={novaCidade} onChange={setNovaCidade} placeholder="Ex: Coimbra" />
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Salário Mín (€/ano)" valor={novoSalarioMin} onChange={setNovoSalarioMin} />
          <CampoNumero label="Salário Máx (€/ano)" valor={novoSalarioMax} onChange={setNovoSalarioMax} />
        </div>
        <CampoToggle label="Patrocina Visto?" valor={novoPatrocinio} onChange={setNovoPatrocinio} />
        <BotaoSubmit label="Adicionar Vaga" onClick={adicionarVaga} />
      </Modal>
    </div>
  )
}

function CartaoVaga({ vaga, arrastando, onDragStart, onDragEnd, onRemover }: {
  vaga: Vaga; arrastando: boolean; onDragStart: () => void; onDragEnd: () => void; onRemover: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-slate-600 ${arrastando ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: vaga.cor }}>
          {vaga.inicial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-slate-100 text-sm font-semibold leading-tight truncate">{vaga.empresa}</p>
          <p className="text-slate-400 text-xs truncate">{vaga.cargo}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRemover() }}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
        >
          <IconeLixeira />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-300 text-sm font-medium">{fmtK(vaga.salarioMin)}–{fmtK(vaga.salarioMax)}</span>
        <span className="text-slate-500 text-xs">/ ano</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {vaga.patrocinioVisto && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
            ✦ Patrocina Visto
          </span>
        )}
        {vaga.cidade && (
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-700 text-slate-400">
            📍 {vaga.cidade}
          </span>
        )}
        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-700 text-slate-400">
          🇵🇹 Portugal
        </span>
      </div>
    </div>
  )
}
