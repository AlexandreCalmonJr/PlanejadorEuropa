import { useState, useRef } from 'react'
import type { Faculdade, ColunaFaculdade, PaisDestino } from '../types'
import { gerarId } from '../helpers'
import { COLUNAS_FACULDADE, CORES_COLUNAS_FACULDADE } from '../data'
import { IconeMais, IconeLixeira } from '../components/Icons'
import { BadgePais } from '../components/Badges'
import { Modal, CampoTexto, CampoNumero, CampoSelect, CampoToggle, BotaoSubmit, useModal } from '../components/Modal'
import { EducationDetailModal } from '../components/EducationDetailModal'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface EducationBoardProps {
  faculdades: Faculdade[]
  setFaculdades: React.Dispatch<React.SetStateAction<Faculdade[]>>
}

const CORES_CARD = ['#0284C7', '#14B8A6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#F97316', '#E11D48', '#6366F1']

export function EducationBoard({ faculdades, setFaculdades }: EducationBoardProps) {
  const [pessoas, setPessoas] = useLocalStorage<string[]>('ep_vistos_pessoas', ['Alexandre', 'Andressa'])
  const [filtroPessoa, setFiltroPessoa] = useLocalStorage<string>('ep_faculdade_filtro_pessoa', 'TODOS')
  const [arrastando, setArrastando] = useState<string | null>(null)
  const sobreRef = useRef<ColunaFaculdade | null>(null)
  const [filtroPais, setFiltroPais] = useState<PaisDestino | 'TODOS'>('TODOS')
  const modalNovo = useModal()
  const [faculdadeSelecionada, setFaculdadeSelecionada] = useState<Faculdade | null>(null)

  // Form state
  const [novaInstituicao, setNovaInstituicao] = useState('')
  const [novoCurso, setNovoCurso] = useState('')
  const [novoTipo, setNovoTipo] = useState<Faculdade['tipoCurso']>('Licenciatura')
  const [novaCidade, setNovaCidade] = useState('')
  const [novoPais, setNovoPais] = useState<PaisDestino>('PT')
  const [novoResponsavel, setNovoResponsavel] = useState<string>('Alexandre')
  const [novaPropina, setNovaPropina] = useState(3000)
  const [novaMatricula, setNovaMatricula] = useState(25)
  const [novaTaxa, setNovaTaxa] = useState(30)
  const [novoAceitaDiploma, setNovoAceitaDiploma] = useState(true)

  const faculdadesFiltradasPorPais = filtroPais === 'TODOS'
    ? faculdades
    : faculdades.filter(f => f.pais === filtroPais)

  const faculdadesFiltradas = filtroPessoa === 'TODOS'
    ? faculdadesFiltradasPorPais
    : faculdadesFiltradasPorPais.filter(f => (f.responsavel || 'Ambos') === filtroPessoa || (f.responsavel || 'Ambos') === 'Ambos')

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
      responsavel: novoResponsavel,
      taxaCandidaturaEur: novaTaxa,
      matriculaEur: novaMatricula,
      propinaAnualEur: novaPropina,
      aceitaEnem: false,
      aceitaDiplomaBr: novoAceitaDiploma,
      bolsaCplp: novoPais === 'PT',
      coluna: 'Pesquisando',
      cor,
      anexos: [],
    }
    setFaculdades(prev => [...prev, nova])
    setNovaInstituicao(''); setNovoCurso(''); setNovaCidade('')
    modalNovo.fechar()
  }

  const salvarFaculdade = (facAtualizada: Faculdade) => {
    setFaculdades(prev => prev.map(f => f.id === facAtualizada.id ? facAtualizada : f))
    if (faculdadeSelecionada?.id === facAtualizada.id) {
      setFaculdadeSelecionada(facAtualizada)
    }
  }

  const remover = (id: string) => {
    setFaculdades(prev => prev.filter(f => f.id !== id))
    if (faculdadeSelecionada?.id === id) setFaculdadeSelecionada(null)
  }

  const totalPT = faculdadesFiltradas.filter(f => f.pais === 'PT').length
  const totalES = faculdadesFiltradas.filter(f => f.pais === 'ES').length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      {/* Cabecalho */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <span>Faculdades & Candidaturas</span>
            {filtroPessoa !== 'TODOS' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                👤 {filtroPessoa}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kanban de candidaturas universitárias por estudante · Clique para detalhes e anexos
          </p>
        </div>
        <button
          onClick={modalNovo.abrir}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all shadow-sm"
        >
          <IconeMais /> Nova Faculdade
        </button>
      </div>

      {/* Painel de Filtros (Estudante & País) */}
      <div className="mb-6 space-y-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        {/* Filtro por Requerente / Estudante */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 pl-1 uppercase tracking-wider text-[11px]">Estudante:</span>
          <button
            onClick={() => setFiltroPessoa('TODOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filtroPessoa === 'TODOS'
                ? 'bg-violet-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
            }`}
          >
            🌐 Todos os Estudantes
          </button>
          {pessoas.map(p => (
            <button
              key={p}
              onClick={() => setFiltroPessoa(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filtroPessoa === p
                  ? 'bg-violet-500 text-white shadow-md scale-105'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              <span>👤</span>
              <span>{p}</span>
            </button>
          ))}
          <button
            onClick={() => {
              const nome = prompt('Digite o nome do estudante / pessoa:')
              if (nome && nome.trim()) {
                const limpo = nome.trim()
                if (!pessoas.includes(limpo)) {
                  setPessoas(prev => [...prev, limpo])
                }
                setFiltroPessoa(limpo)
              }
            }}
            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all flex items-center gap-1"
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
              {p === 'TODOS' ? '🌐 Todos os Países' : p === 'PT' ? `🇵🇹 Portugal (${totalPT})` : `🇪🇸 Espanha (${totalES})`}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {COLUNAS_FACULDADE.map(col => {
          const colFacs = faculdadesFiltradas.filter(f => f.coluna === col)
          return (
            <div
              key={col}
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={e => { e.preventDefault(); sobreRef.current = col }}
            >
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CORES_COLUNAS_FACULDADE[col] }} />
                <h3 className="text-slate-200 text-sm font-semibold">{col}</h3>
                <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{colFacs.length}</span>
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-2xl p-3 space-y-3 border border-slate-800/60">
                {colFacs.map(fac => (
                  <CartaoFaculdade
                    key={fac.id}
                    fac={fac}
                    arrastando={arrastando === fac.id}
                    onDragStart={() => handleDragStart(fac.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setFaculdadeSelecionada(fac)}
                    onRemover={() => remover(fac.id)}
                  />
                ))}
                {colFacs.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                    Arraste até aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-3 text-center md:text-left">Clique no cartão para detalhes completos ou arraste entre colunas</p>

      {/* Modal Criar Nova Faculdade */}
      <Modal aberto={modalNovo.aberto} onFechar={modalNovo.fechar} titulo="Nova Faculdade">
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
        <CampoSelect label="Estudante / Responsável" valor={novoResponsavel} onChange={v => setNovoResponsavel(v)} opcoes={[
          ...pessoas.map(p => ({ value: p, label: `👤 ${p}` })),
          { value: 'Ambos', label: '👥 Ambos' },
        ]} />
        <CampoTexto label="Cidade" valor={novaCidade} onChange={setNovaCidade} placeholder="Ex: Coimbra" />
        <div className="grid grid-cols-3 gap-3">
          <CampoNumero label="Propina €/ano" valor={novaPropina} onChange={setNovaPropina} />
          <CampoNumero label="Matrícula €" valor={novaMatricula} onChange={setNovaMatricula} />
          <CampoNumero label="Candidatura €" valor={novaTaxa} onChange={setNovaTaxa} />
        </div>
        <CampoToggle label="Aceita Diploma BR?" valor={novoAceitaDiploma} onChange={setNovoAceitaDiploma} />
        <BotaoSubmit label="Adicionar Faculdade" onClick={adicionar} />
      </Modal>

      {/* Modal Detalhes da Faculdade */}
      <EducationDetailModal
        faculdade={faculdadeSelecionada}
        onFechar={() => setFaculdadeSelecionada(null)}
        onSalvar={salvarFaculdade}
        onRemover={remover}
      />
    </div>
  )
}

function CartaoFaculdade({ fac, arrastando, onDragStart, onDragEnd, onClick, onRemover }: {
  fac: Faculdade; arrastando: boolean; onDragStart: () => void; onDragEnd: () => void; onClick: () => void; onRemover: () => void
}) {
  const numAnexos = fac.anexos?.length || 0

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-xl p-4 cursor-pointer transition-all duration-150 shadow-sm hover:shadow-md ${arrastando ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <p className="text-slate-100 text-sm font-semibold leading-tight truncate">{fac.instituicao}</p>
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
        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-700 text-slate-300 font-medium">
          {fac.tipoCurso}
        </span>
        <span className="text-xs text-slate-400">📍 {fac.cidade}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-200 text-sm font-semibold">€{fac.propinaAnualEur.toLocaleString('de-DE')}</span>
        <span className="text-slate-500 text-xs">/ ano</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <BadgePais pais={fac.pais} />
        {fac.responsavel && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 font-medium">
            👤 {fac.responsavel}
          </span>
        )}
        {fac.bolsaCplp && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            CPLP
          </span>
        )}
        {numAnexos > 0 && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 font-medium">
            📎 {numAnexos} {numAnexos === 1 ? 'anexo' : 'anexos'}
          </span>
        )}
      </div>
    </div>
  )
}
