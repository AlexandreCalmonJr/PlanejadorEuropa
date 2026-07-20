import { useState, useRef } from 'react'
import type { Faculdade, ColunaFaculdade, PaisDestino } from '../types'
import { gerarId } from '../helpers'
import { COLUNAS_FACULDADE, CORES_COLUNAS_FACULDADE } from '../data'
import { IconeMais, IconeLixeira } from '../components/Icons'
import { BadgePais } from '../components/Badges'
import { Modal, CampoTexto, CampoNumero, CampoSelect, CampoToggle, BotaoSubmit, useModal } from '../components/Modal'

interface EducationBoardProps {
  faculdades: Faculdade[]
  setFaculdades: React.Dispatch<React.SetStateAction<Faculdade[]>>
}

const CORES_CARD = ['#0284C7', '#14B8A6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#F97316', '#E11D48', '#6366F1']

export function EducationBoard({ faculdades, setFaculdades }: EducationBoardProps) {
  const [arrastando, setArrastando] = useState<string | null>(null)
  const sobreRef = useRef<ColunaFaculdade | null>(null)
  const [filtroPais, setFiltroPais] = useState<PaisDestino | 'TODOS'>('TODOS')
  const modal = useModal()

  // Form state
  const [novaInstituicao, setNovaInstituicao] = useState('')
  const [novoCurso, setNovoCurso] = useState('')
  const [novoTipo, setNovoTipo] = useState<Faculdade['tipoCurso']>('Licenciatura')
  const [novaCidade, setNovaCidade] = useState('')
  const [novoPais, setNovoPais] = useState<PaisDestino>('PT')
  const [novaPropina, setNovaPropina] = useState(3000)
  const [novaMatricula, setNovaMatricula] = useState(25)
  const [novaTaxa, setNovaTaxa] = useState(30)
  const [novoAceitaDiploma, setNovoAceitaDiploma] = useState(true)

  const faculdadesFiltradas = filtroPais === 'TODOS'
    ? faculdades
    : faculdades.filter(f => f.pais === filtroPais)

  const handleDragStart = (id: string) => setArrastando(id)
  const handleDragEnd = () => {
    if (arrastando && sobreRef.current) {
      setFaculdades(prev => prev.map(f => f.id === arrastando ? { ...f, coluna: sobreRef.current! } : f))
    }
    setArrastando(null)
    sobreRef.current = null
  }

  const adicionar = () => {
    if (!novaInstituicao.trim() || !novoCurso.trim()) return
    const cor = CORES_CARD[faculdades.length % CORES_CARD.length]
    const nova: Faculdade = {
      id: gerarId(),
      instituicao: novaInstituicao,
      curso: novoCurso,
      tipoCurso: novoTipo,
      area: 'Tecnologia',
      cidade: novaCidade,
      pais: novoPais,
      taxaCandidaturaEur: novaTaxa,
      matriculaEur: novaMatricula,
      propinaAnualEur: novaPropina,
      aceitaEnem: false,
      aceitaDiplomaBr: novoAceitaDiploma,
      bolsaCplp: novoPais === 'PT',
      coluna: 'Pesquisando',
      cor,
    }
    setFaculdades(prev => [...prev, nova])
    setNovaInstituicao(''); setNovoCurso(''); setNovaCidade('')
    modal.fechar()
  }

  const remover = (id: string) => setFaculdades(prev => prev.filter(f => f.id !== id))

  const totalPT = faculdades.filter(f => f.pais === 'PT').length
  const totalES = faculdades.filter(f => f.pais === 'ES').length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Faculdades</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kanban de candidaturas universitárias · {totalPT} em Portugal · {totalES} na Espanha
          </p>
        </div>
        <button
          onClick={modal.abrir}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all"
        >
          <IconeMais /> Nova Faculdade
        </button>
      </div>

      {/* Filtro por país */}
      <div className="flex items-center gap-2 mb-6">
        {(['TODOS', 'PT', 'ES'] as const).map(p => (
          <button
            key={p}
            onClick={() => setFiltroPais(p)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              filtroPais === p
                ? 'bg-slate-700 text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 bg-slate-800/50'
            }`}
          >
            {p === 'TODOS' ? '🌍 Todos' : p === 'PT' ? '🇵🇹 Portugal' : '🇪🇸 Espanha'}
          </button>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '55vh' }}>
        {COLUNAS_FACULDADE.map(col => {
          const colItems = faculdadesFiltradas.filter(f => f.coluna === col)
          return (
            <div
              key={col}
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={e => { e.preventDefault(); sobreRef.current = col }}
            >
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CORES_COLUNAS_FACULDADE[col] }} />
                <h3 className="text-slate-200 text-sm font-semibold">{col}</h3>
                <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{colItems.length}</span>
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-2xl p-3 space-y-3 border border-slate-800/60">
                {colItems.map(fac => (
                  <CartaoFaculdade
                    key={fac.id}
                    fac={fac}
                    arrastando={arrastando === fac.id}
                    onDragStart={() => handleDragStart(fac.id)}
                    onDragEnd={handleDragEnd}
                    onRemover={() => remover(fac.id)}
                  />
                ))}
                {colItems.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                    Arraste até aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-3 text-center md:text-left">Arraste as faculdades entre colunas para acompanhar o progresso da candidatura</p>

      {/* Modal */}
      <Modal aberto={modal.aberto} onFechar={modal.fechar} titulo="Nova Faculdade">
        <CampoTexto label="Instituição" valor={novaInstituicao} onChange={setNovaInstituicao} placeholder="Ex: Universidade de Coimbra" />
        <CampoTexto label="Curso" valor={novoCurso} onChange={setNovoCurso} placeholder="Ex: Engenharia Informática" />
        <div className="grid grid-cols-2 gap-3">
          <CampoSelect label="Tipo" valor={novoTipo} onChange={setNovoTipo} opcoes={[
            { value: 'Licenciatura', label: 'Licenciatura' },
            { value: 'Mestrado', label: 'Mestrado' },
            { value: 'Grado', label: 'Grado (ES)' },
            { value: 'Máster', label: 'Máster (ES)' },
          ]} />
          <CampoSelect label="País" valor={novoPais} onChange={setNovoPais} opcoes={[
            { value: 'PT', label: '🇵🇹 Portugal' },
            { value: 'ES', label: '🇪🇸 Espanha' },
          ]} />
        </div>
        <CampoTexto label="Cidade" valor={novaCidade} onChange={setNovaCidade} placeholder="Ex: Coimbra" />
        <div className="grid grid-cols-3 gap-3">
          <CampoNumero label="Propina €/ano" valor={novaPropina} onChange={setNovaPropina} />
          <CampoNumero label="Matrícula €" valor={novaMatricula} onChange={setNovaMatricula} />
          <CampoNumero label="Candidatura €" valor={novaTaxa} onChange={setNovaTaxa} />
        </div>
        <CampoToggle label="Aceita Diploma BR?" valor={novoAceitaDiploma} onChange={setNovoAceitaDiploma} />
        <BotaoSubmit label="Adicionar Faculdade" onClick={adicionar} />
      </Modal>
    </div>
  )
}

function CartaoFaculdade({ fac, arrastando, onDragStart, onDragEnd, onRemover }: {
  fac: Faculdade; arrastando: boolean; onDragStart: () => void; onDragEnd: () => void; onRemover: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`group bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-slate-600 ${arrastando ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-slate-100 text-sm font-semibold leading-tight">{fac.instituicao}</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{fac.curso}</p>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onRemover() }}
          className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1 shrink-0"
        >
          <IconeLixeira />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 font-medium">
          {fac.tipoCurso}
        </span>
        <span className="text-xs text-slate-500">📍 {fac.cidade}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-200 text-sm font-semibold">€{fac.propinaAnualEur.toLocaleString('de-DE')}</span>
        <span className="text-slate-500 text-xs">/ ano</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <BadgePais pais={fac.pais} />
        {fac.bolsaCplp && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            CPLP
          </span>
        )}
        {fac.aceitaDiplomaBr && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            Diploma BR ✓
          </span>
        )}
        {fac.aceitaEnem && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
            ENEM ✓
          </span>
        )}
        {fac.observacao && (
          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ⚠ {fac.observacao}
          </span>
        )}
      </div>
    </div>
  )
}
