import { useState, useEffect } from 'react'
import type { Vaga, AnexoDocumento } from '../types'
import { fmtK, COTACAO_EURO } from '../helpers'
import { COLUNAS_KANBAN, CORES_COLUNAS_KANBAN } from '../data'
import { Modal } from './Modal'
import { FileUploader } from './FileUploader'
import { IconeLixeira } from './Icons'

interface JobDetailModalProps {
  vaga: Vaga | null
  onFechar: () => void
  onSalvar: (vagaAtualizada: Vaga) => void
  onRemover: (id: string) => void
}

export function JobDetailModal({ vaga, onFechar, onSalvar, onRemover }: JobDetailModalProps) {
  const [formData, setFormData] = useState<Vaga | null>(vaga)
  const [novaTagStack, setNovaTagStack] = useState('')

  useEffect(() => {
    setFormData(vaga)
  }, [vaga])

  if (!vaga || !formData) return null

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

  const handleAdicionarStack = () => {
    if (!novaTagStack.trim()) return
    const stackAtual = formData.stack || []
    if (!stackAtual.includes(novaTagStack.trim())) {
      const novaStack = [...stackAtual, novaTagStack.trim()]
      const atualizado = { ...formData, stack: novaStack }
      setFormData(atualizado)
      onSalvar(atualizado)
    }
    setNovaTagStack('')
  }

  const handleRemoverStack = (tag: string) => {
    const novaStack = (formData.stack || []).filter(t => t !== tag)
    const atualizado = { ...formData, stack: novaStack }
    setFormData(atualizado)
    onSalvar(atualizado)
  }

  const salarioMedioEur = Math.round((formData.salarioMin + formData.salarioMax) / 2)
  const salarioMensalBrl = Math.round((salarioMedioEur / 12) * COTACAO_EURO)

  return (
    <Modal aberto={Boolean(vaga)} onFechar={onFechar} titulo="Detalhes da Candidatura">
      <div className="space-y-6 text-slate-100">
        {/* Cabecalho Principal */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg"
              style={{ background: formData.cor }}
            >
              {formData.inicial}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100 leading-tight">{formData.empresa}</h2>
              <p className="text-sm text-teal-400 font-medium">{formData.cargo}</p>
              <div className="flex items-center gap-2 mt-1">
                {formData.cidade && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">📍 {formData.cidade}, PT</span>
                )}
                {formData.modelo && (
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    💻 {formData.modelo}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shadow-sm"
              style={{ background: CORES_COLUNAS_KANBAN[formData.coluna] }}
            >
              {formData.coluna}
            </span>
            {formData.patrocinioVisto && (
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
                ✦ Patrocina Visto D3
              </span>
            )}
          </div>
        </div>

        {/* Resumo Financeiro & Salario */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Faixa Salarial Anual</p>
            <p className="text-lg font-extrabold text-slate-100 mt-0.5">
              {fmtK(formData.salarioMin)} – {fmtK(formData.salarioMax)} <span className="text-xs text-slate-400 font-normal">/ano</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Média Mensal (BRL)</p>
            <p className="text-lg font-extrabold text-emerald-400 mt-0.5">
              ~R$ {salarioMensalBrl.toLocaleString('pt-BR')}{' '}
              <span className="text-xs text-slate-400 font-normal">/mês</span>
            </p>
          </div>
        </div>

        {/* Stack Tecnológica */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Stack & Tecnologias</label>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(formData.stack || []).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoverStack(tag)}
                  className="text-slate-500 hover:text-red-400 transition-all text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Adicionar tecnologia (ex: Docker, GraphQL)"
              value={novaTagStack}
              onChange={e => setNovaTagStack(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdicionarStack())}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleAdicionarStack}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs rounded-xl transition-all"
            >
              + Tag
            </button>
          </div>
        </div>

        {/* Seção Mudar Status no Kanban */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Mover Status da Candidatura
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COLUNAS_KANBAN.map(col => (
              <button
                key={col}
                type="button"
                onClick={() => {
                  const atualizado = { ...formData, coluna: col }
                  setFormData(atualizado)
                  onSalvar(atualizado)
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-center ${
                  formData.coluna === col
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Anotações e Contatos */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Link da Vaga / Portal
            </label>
            <input
              type="text"
              placeholder="https://linkedin.com/jobs/..."
              value={formData.linkVaga || ''}
              onChange={e => setFormData({ ...formData, linkVaga: e.target.value })}
              onBlur={handleSalvar}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Anotações & Observações da Entrevista
            </label>
            <textarea
              rows={3}
              placeholder="Digite impressões, nome dos recrutadores, próximos passos..."
              value={formData.observacoes || ''}
              onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
              onBlur={handleSalvar}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Componente de Anexos */}
        <FileUploader
          anexos={formData.anexos}
          onAdicionarAnexo={handleAdicionarAnexo}
          onRemoverAnexo={handleRemoverAnexo}
        />

        {/* Botão de Excluir */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              onRemover(formData.id)
              onFechar()
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
          >
            <IconeLixeira /> Excluir Candidatura
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-teal-400 transition-all"
          >
            Concluído
          </button>
        </div>
      </div>
    </Modal>
  )
}
