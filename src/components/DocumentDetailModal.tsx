import { useState, useEffect } from 'react'
import type { Documento, StatusDoc, AnexoDocumento } from '../types'
import { Modal } from './Modal'
import { FileUploader } from './FileUploader'
import { BadgeStatus } from './Badges'
import { IconeLixeira } from './Icons'

interface DocumentDetailModalProps {
  documento: Documento | null
  onFechar: () => void
  onSalvar: (docAtualizado: Documento) => void
  onRemover: (id: string) => void
}

export function DocumentDetailModal({ documento, onFechar, onSalvar, onRemover }: DocumentDetailModalProps) {
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
          <BadgeStatus status={formData.status} />
        </div>

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
