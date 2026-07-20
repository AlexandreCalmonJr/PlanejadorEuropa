import { useState, useEffect } from 'react'
import type { Documento, StatusDoc, AnexoDocumento } from '../types'
import { Modal } from './Modal'
import { FileUploader } from './FileUploader'
import { BadgeStatus } from './Badges'
import { IconeLixeira, IconeCadeado, IconeCheck } from './Icons'

interface DocumentDetailModalProps {
  documento: Documento | null
  todosDocs?: Documento[]
  onFechar: () => void
  onSalvar: (docAtualizado: Documento) => void
  onRemover: (id: string) => void
}

export function DocumentDetailModal({ documento, todosDocs = [], onFechar, onSalvar, onRemover }: DocumentDetailModalProps) {
  const [formData, setFormData] = useState<Documento | null>(documento)

  useEffect(() => {
    setFormData(documento)
  }, [documento])

  if (!documento || !formData) return null

  const handleSalvar = () => {
    if (formData) {
      onSalvar(formData)
    }
  }

  const handleAdicionarAnexo = (anexo: AnexoDocumento) => {
    const novosAnexos = [...(formData.anexos || []), anexo]
    const atualizado = { ...formData, anexos: novosAnexos }
    setFormData(atualizado)
    onSalvar(atualizado)
  }

  const handleRemoverAnexo = (id: string) => {
    const novosAnexos = (formData.anexos || []).filter(a => a.id !== id)
    const atualizado = { ...formData, anexos: novosAnexos }
    setFormData(atualizado)
    onSalvar(atualizado)
  }

  const bloqueadoresAtivos = (formData.bloqueadoPor || []).map(bid => {
    const bloqueador = todosDocs.find(d => d.id === bid)
    return {
      id: bid,
      nome: bloqueador?.nome ?? bid,
      status: bloqueador?.status ?? 'Pendente',
      isConcluido: bloqueador?.status === 'Concluído',
      docRef: bloqueador,
    }
  })

  const estaBloqueado = bloqueadoresAtivos.some(b => !b.isConcluido)

  return (
    <Modal aberto={Boolean(documento)} onFechar={onFechar} titulo="Gerenciar Documento">
      <div className="space-y-6 text-slate-100">
        {/* Cabecalho */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-lg font-bold shrink-0">
              📁
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 leading-tight">{formData.nome}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{formData.descricao}</p>
            </div>
          </div>
          <BadgeStatus status={estaBloqueado ? 'Bloqueado' : formData.status} />
        </div>

        {/* Alerta de Bloqueio & Ações Rápidas de Desbloqueio */}
        {bloqueadoresAtivos.length > 0 && (
          <div className={`p-4 rounded-xl border space-y-3 ${
            estaBloqueado
              ? 'bg-red-950/40 border-red-500/30 text-red-200'
              : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <IconeCadeado />
                {estaBloqueado ? 'Este documento está Bloqueado' : 'Dependências Resolvidas'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {estaBloqueado
                ? 'Ele é liberado automaticamente quando os pré-requisitos forem marcados como Concluído, ou se você remover a trava de dependência.'
                : 'Todos os pré-requisitos deste documento já foram concluídos.'}
            </p>

            <div className="space-y-2 pt-1">
              {bloqueadoresAtivos.map(b => (
                <div key={b.id} className="flex items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${b.isConcluido ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <span className="text-xs text-slate-200 font-medium truncate">{b.nome}</span>
                    <BadgeStatus status={b.status} />
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!b.isConcluido && b.docRef && (
                      <button
                        type="button"
                        onClick={() => {
                          onSalvar({ ...b.docRef!, status: 'Concluído' })
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                      >
                        <IconeCheck /> Concluir Pré-requisito
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const novosBloq = (formData.bloqueadoPor || []).filter(id => id !== b.id)
                        const meAtualizado = { ...formData, bloqueadoPor: novosBloq }
                        setFormData(meAtualizado)
                        onSalvar(meAtualizado)
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-red-300 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/30 text-xs font-medium transition-all"
                    >
                      Remover Trava
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mudar Status */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Status do Documento
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['Pendente', 'Em Andamento', 'Concluído', 'Bloqueado'] as StatusDoc[]).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  const atualizado = { ...formData, status: s }
                  setFormData(atualizado)
                  onSalvar(atualizado)
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  formData.status === s
                    ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Requerente / Titular do Documento */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Requerente / Titular do Documento
          </label>
          <div className="flex flex-wrap gap-2">
            {['Alexandre', 'Andressa', 'Ambos'].map(p => {
              const selecionado = (formData.pessoa || 'Ambos') === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const atualizado = { ...formData, pessoa: p }
                    setFormData(atualizado)
                    onSalvar(atualizado)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    selecionado
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  👤 {p}
                </button>
              )
            })}
          </div>
        </div>

        {/* Gerenciar Pré-requisitos / Dependências */}
        {todosDocs.length > 1 && (
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Gerenciar Pré-requisitos (Quais documentos travam este?)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-950/40 rounded-xl border border-slate-800/80">
              {todosDocs.filter(d => d.id !== formData.id).map(otherDoc => {
                const isDep = (formData.bloqueadoPor || []).includes(otherDoc.id)
                return (
                  <button
                    key={otherDoc.id}
                    type="button"
                    onClick={() => {
                      const atual = formData.bloqueadoPor || []
                      const novoBloq = isDep
                        ? atual.filter(id => id !== otherDoc.id)
                        : [...atual, otherDoc.id]
                      const meAtualizado = { ...formData, bloqueadoPor: novoBloq }
                      setFormData(meAtualizado)
                      onSalvar(meAtualizado)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isDep
                        ? 'bg-red-500/20 border-red-500/50 text-red-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {isDep ? '🔒 ' : '+ '}{otherDoc.nome}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Anotacoes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
            Anotações, Números de Protocolo ou Instruções
          </label>
          <textarea
            rows={3}
            placeholder="Ex: Cartório 2º Ofício, Protocolo nº 123456, Valor pago: R$150..."
            value={formData.observacoes || ''}
            onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
            onBlur={handleSalvar}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none leading-relaxed"
          />
        </div>

        {/* Uploader de Anexos */}
        <FileUploader
          anexos={formData.anexos}
          onAdicionarAnexo={handleAdicionarAnexo}
          onRemoverAnexo={handleRemoverAnexo}
        />

        {/* Rodape */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onRemover(formData.id)
              onFechar()
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
          >
            <IconeLixeira /> Excluir Documento
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2 bg-sky-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-sky-400 transition-all"
          >
            Concluído
          </button>
        </div>
      </div>
    </Modal>
  )
}
