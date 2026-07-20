import { useState, useEffect } from 'react'
import type { Vaga, AnexoDocumento } from '../types'
import { fmtK, COTACAO_EURO } from '../helpers'
import { COLUNAS_KANBAN } from '../data'
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

  const handleSalvar = (atualizado = formData) => {
    if (atualizado) {
      onSalvar(atualizado)
    }
  }

  const handleAdicionarAnexo = (anexo: AnexoDocumento) => {
    const novosAnexos = [...(formData.anexos || []), anexo]
    const atualizado = { ...formData, anexos: novosAnexos }
    setFormData(atualizado)
    handleSalvar(atualizado)
  }

  const handleRemoverAnexo = (id: string) => {
    const novosAnexos = (formData.anexos || []).filter(a => a.id !== id)
    const atualizado = { ...formData, anexos: novosAnexos }
    setFormData(atualizado)
    handleSalvar(atualizado)
  }

  const handleAdicionarStack = () => {
    if (!novaTagStack.trim()) return
    const stackAtual = formData.stack || []
    if (!stackAtual.includes(novaTagStack.trim())) {
      const novaStack = [...stackAtual, novaTagStack.trim()]
      const atualizado = { ...formData, stack: novaStack }
      setFormData(atualizado)
      handleSalvar(atualizado)
    }
    setNovaTagStack('')
  }

  const handleRemoverStack = (tag: string) => {
    const novaStack = (formData.stack || []).filter(t => t !== tag)
    const atualizado = { ...formData, stack: novaStack }
    setFormData(atualizado)
    handleSalvar(atualizado)
  }

  const salarioMedioEur = Math.round((formData.salarioMin + formData.salarioMax) / 2)
  const salarioMensalBrl = Math.round((salarioMedioEur / 12) * COTACAO_EURO)

  return (
    <Modal aberto={Boolean(vaga)} onFechar={onFechar} titulo="Editar & Detalhes da Vaga">
      <div className="space-y-5 text-slate-100">
        {/* Dados Principais Editaveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Empresa
            </label>
            <input
              type="text"
              value={formData.empresa}
              onChange={e => setFormData({ ...formData, empresa: e.target.value, inicial: e.target.value.charAt(0).toUpperCase() })}
              onBlur={() => handleSalvar()}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Cargo / Posição
            </label>
            <input
              type="text"
              value={formData.cargo}
              onChange={e => setFormData({ ...formData, cargo: e.target.value })}
              onBlur={() => handleSalvar()}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-teal-400 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Modelo de Trabalho, Cidade, Responsavel e Patrocinio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Modelo
            </label>
            <select
              value={formData.modelo || 'Híbrido'}
              onChange={e => {
                const at = { ...formData, modelo: e.target.value }
                setFormData(at)
                handleSalvar(at)
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="Híbrido">💻 Híbrido</option>
              <option value="Presencial">🏢 Presencial</option>
              <option value="Remoto">🏠 Remoto</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Cidade
            </label>
            <input
              type="text"
              placeholder="Ex: Coimbra, Lisboa"
              value={formData.cidade || ''}
              onChange={e => setFormData({ ...formData, cidade: e.target.value })}
              onBlur={() => handleSalvar()}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Responsável
            </label>
            <select
              value={formData.responsavel || 'Alexandre'}
              onChange={e => {
                const at = { ...formData, responsavel: e.target.value }
                setFormData(at)
                handleSalvar(at)
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
            >
              <option value="Alexandre">👤 Alexandre</option>
              <option value="Andressa">👩 Andressa</option>
              <option value="Ambos">👥 Ambos</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Patrocínio Visto
            </label>
            <button
              type="button"
              onClick={() => {
                const at = { ...formData, patrocinioVisto: !formData.patrocinioVisto }
                setFormData(at)
                handleSalvar(at)
              }}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                formData.patrocinioVisto
                  ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {formData.patrocinioVisto ? 'Sim (Patrocina)' : 'Não'}
            </button>
          </div>
        </div>

        {/* Resumo Financeiro & Salario Editavel */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Faixa Salarial Anual (€ EUR)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-400">Mínimo Anual (€)</span>
              <input
                type="number"
                value={formData.salarioMin}
                onChange={e => setFormData({ ...formData, salarioMin: Number(e.target.value) })}
                onBlur={() => handleSalvar()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-bold"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-400">Máximo Anual (€)</span>
              <input
                type="number"
                value={formData.salarioMax}
                onChange={e => setFormData({ ...formData, salarioMax: Number(e.target.value) })}
                onBlur={() => handleSalvar()}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-bold"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 pt-1">
            Média de <strong className="text-teal-400">{fmtK(salarioMedioEur)}/ano</strong> (~R$ {salarioMensalBrl.toLocaleString('pt-BR')}/mês)
          </p>
        </div>

        {/* Stack Tecnológica */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
            Stack & Tecnologias
          </label>
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
                  handleSalvar(atualizado)
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
              onBlur={() => handleSalvar()}
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
              onBlur={() => handleSalvar()}
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
            Salvar & Fechar
          </button>
        </div>
      </div>
    </Modal>
  )
}
