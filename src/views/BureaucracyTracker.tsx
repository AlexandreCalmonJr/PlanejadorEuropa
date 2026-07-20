import { useState } from 'react'
import type { Documento, StatusDoc, PaisDestino } from '../types'
import { gerarId } from '../helpers'
import { BadgeStatus } from '../components/Badges'
import { IconeCheck, IconeGirar, IconeCadeado, IconeRelogio, IconeMais, IconeLixeira } from '../components/Icons'
import { Modal, CampoTexto, CampoSelect, BotaoSubmit, useModal } from '../components/Modal'

interface BureaucracyTrackerProps {
  docs: Documento[]
  setDocs: React.Dispatch<React.SetStateAction<Documento[]>>
}

export function BureaucracyTracker({ docs, setDocs }: BureaucracyTrackerProps) {
  const [filtroPais, setFiltroPais] = useState<PaisDestino | 'TODOS'>('TODOS')
  const modal = useModal()
  const [novoNome, setNovoNome] = useState('')
  const [novoDesc, setNovoDesc] = useState('')
  const [novoPais, setNovoPais] = useState<Documento['pais']>('PT')

  const getNomeDoc = (id: string) => docs.find(d => d.id === id)?.nome ?? id

  const avancarStatus = (id: string) => {
    setDocs(prev => prev.map(d => {
      if (d.id !== id) return d
      const bloqueado = d.bloqueadoPor?.some(bid => {
        const bloqueador = prev.find(dd => dd.id === bid)
        return bloqueador && bloqueador.status !== 'Concluído'
      })
      if (bloqueado) return d
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
    }
    setDocs(prev => [...prev, novo])
    setNovoNome(''); setNovoDesc('')
    modal.fechar()
  }

  const remover = (id: string) => setDocs(prev => prev.filter(d => d.id !== id))

  const docsFiltrados = filtroPais === 'TODOS'
    ? docs
    : docs.filter(d => d.pais === filtroPais || d.pais === 'AMBOS')

  const docsResolvidos = docsFiltrados.map(d => {
    const bloqueado = d.bloqueadoPor?.some(bid => {
      const bloqueador = docs.find(dd => dd.id === bid)
      return bloqueador && bloqueador.status !== 'Concluído'
    })
    return { ...d, statusResolvido: (bloqueado ? 'Bloqueado' : d.status) as StatusDoc }
  })

  const concluidos = docsResolvidos.filter(d => d.statusResolvido === 'Concluído').length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Rastreador de Burocracia</h1>
          <p className="text-slate-400 text-sm mt-1">Clique para avançar status (se desbloqueado)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right shrink-0">
            <p className="text-3xl font-bold text-slate-100">{concluidos}<span className="text-slate-600 text-lg">/{docsResolvidos.length}</span></p>
            <p className="text-slate-500 text-xs">completos</p>
          </div>
          <button
            onClick={modal.abrir}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all"
          >
            <IconeMais />
          </button>
        </div>
      </div>

      {/* Filtro por país */}
      <div className="flex items-center gap-2 mb-4">
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

      <div className="mb-6 h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${docsResolvidos.length > 0 ? (concluidos / docsResolvidos.length) * 100 : 0}%`,
          background: 'linear-gradient(90deg, #14B8A6, #0284C7)',
        }} />
      </div>

      <div className="space-y-3">
        {docsResolvidos.map(doc => {
          const bloqueadores = doc.bloqueadoPor?.map(bid => getNomeDoc(bid)) ?? []
          const estaBloqueado = doc.statusResolvido === 'Bloqueado'
          return (
            <div
              key={doc.id}
              onClick={() => avancarStatus(doc.id)}
              className={`group bg-slate-900 border rounded-2xl p-5 transition-all duration-150 ${
                estaBloqueado ? 'border-slate-800 opacity-60 cursor-not-allowed' : 'border-slate-800 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  doc.statusResolvido === 'Concluído' ? 'bg-emerald-500/10' :
                  doc.statusResolvido === 'Em Andamento' ? 'bg-sky-500/10' :
                  doc.statusResolvido === 'Bloqueado' ? 'bg-red-500/10' : 'bg-slate-800'
                }`}>
                  {doc.statusResolvido === 'Concluído'    && <IconeCheck />}
                  {doc.statusResolvido === 'Em Andamento' && <IconeGirar />}
                  {doc.statusResolvido === 'Bloqueado'    && <IconeCadeado />}
                  {doc.statusResolvido === 'Pendente'     && <IconeRelogio />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-semibold ${doc.statusResolvido === 'Concluído' ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                        {doc.nome}
                      </p>
                      {doc.pais && doc.pais !== 'AMBOS' && (
                        <span className="text-xs">{doc.pais === 'PT' ? '🇵🇹' : '🇪🇸'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
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

                  {estaBloqueado && bloqueadores.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-600 text-xs">Bloqueado por:</span>
                      {bloqueadores.map((nome, i) => (
                        <span key={i} className="text-xs bg-red-950 text-red-400 px-2 py-0.5 rounded-md">{nome}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-4 text-center">Clique em qualquer documento desbloqueado para avançar seu status</p>

      {/* Modal */}
      <Modal aberto={modal.aberto} onFechar={modal.fechar} titulo="Novo Documento">
        <CampoTexto label="Nome" valor={novoNome} onChange={setNovoNome} placeholder="Ex: Certidão de Nascimento" />
        <CampoTexto label="Descrição" valor={novoDesc} onChange={setNovoDesc} placeholder="Órgão emissor, observações..." />
        <CampoSelect label="País" valor={novoPais ?? 'PT'} onChange={v => setNovoPais(v as Documento['pais'])} opcoes={[
          { value: 'PT', label: '🇵🇹 Portugal' },
          { value: 'ES', label: '🇪🇸 Espanha' },
          { value: 'AMBOS', label: '🌍 Ambos' },
        ]} />
        <BotaoSubmit label="Adicionar Documento" onClick={adicionar} />
      </Modal>
    </div>
  )
}
