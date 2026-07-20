import { useState, useEffect } from 'react'
import type { Faculdade, AnexoDocumento } from '../types'
import { COTACAO_EURO } from '../helpers'
import { COLUNAS_FACULDADE, CORES_COLUNAS_FACULDADE } from '../data'
import { Modal } from './Modal'
import { FileUploader } from './FileUploader'
import { BadgePais } from './Badges'
import { IconeLixeira } from './Icons'

interface EducationDetailModalProps {
  faculdade: Faculdade | null
  onFechar: () => void
  onSalvar: (faculdadeAtualizada: Faculdade) => void
  onRemover: (id: string) => void
}

export function EducationDetailModal({ faculdade, onFechar, onSalvar, onRemover }: EducationDetailModalProps) {
  const [formData, setFormData] = useState<Faculdade | null>(faculdade)

  useEffect(() => {
    setFormData(faculdade)
  }, [faculdade])

  if (!faculdade || !formData) return null

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

  const propinaBrl = Math.round(formData.propinaAnualEur * COTACAO_EURO)
  const parcelaMensalEur = formData.parcelamento
    ? Math.round(formData.propinaAnualEur / formData.parcelamento)
    : null
  const parcelaMensalBrl = parcelaMensalEur ? Math.round(parcelaMensalEur * COTACAO_EURO) : null

  return (
    <Modal aberto={Boolean(faculdade)} onFechar={onFechar} titulo="Detalhes da Universidade" tamanho="3xl">
      <div className="space-y-6 text-slate-100">
        {/* Cabecalho Principal */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-800 pb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-lg mt-0.5"
              style={{ background: formData.cor }}
            >
              🎓
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-100 leading-tight">{formData.instituicao}</h2>
                <BadgePais pais={formData.pais} />
              </div>
              <p className="text-sm text-violet-400 font-medium mt-0.5">{formData.curso}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-400">📍 {formData.cidade}, {formData.pais}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                  {formData.tipoCurso}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {formData.area}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Responsável:</span>
              <select
                value={formData.responsavel || 'Alexandre'}
                onChange={e => {
                  const at = { ...formData, responsavel: e.target.value }
                  setFormData(at)
                  onSalvar(at)
                }}
                className="bg-transparent text-xs text-violet-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="Alexandre" className="bg-slate-900 text-slate-100">👤 Alexandre</option>
                <option value="Andressa" className="bg-slate-900 text-slate-100">👩 Andressa</option>
                <option value="Ambos" className="bg-slate-900 text-slate-100">👥 Ambos</option>
              </select>
            </div>

            <span
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-white shadow-sm"
              style={{ background: CORES_COLUNAS_FACULDADE[formData.coluna] }}
            >
              {formData.coluna}
            </span>
          </div>
        </div>

        {/* Quadro de Custos & Propinas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Propina Anual</p>
            <p className="text-base font-extrabold text-slate-100 mt-0.5">
              €{formData.propinaAnualEur.toLocaleString()}{' '}
              <span className="text-xs text-slate-400 font-normal">/ano</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">~R$ {propinaBrl.toLocaleString('pt-BR')}</p>
          </div>

          {parcelaMensalEur ? (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Parcelamento ({formData.parcelamento}x)
              </p>
              <p className="text-base font-extrabold text-violet-400 mt-0.5">
                €{parcelaMensalEur}{' '}
                <span className="text-xs text-slate-400 font-normal">/mês</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">~R$ {parcelaMensalBrl?.toLocaleString('pt-BR')}</p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Matrícula / Taxas</p>
              <p className="text-base font-extrabold text-slate-200 mt-0.5">
                €{formData.taxaCandidaturaEur + formData.matriculaEur}
              </p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Taxas Iniciais</p>
            <p className="text-xs text-slate-300 mt-1">
              Candidatura: <span className="font-semibold text-slate-100">€{formData.taxaCandidaturaEur}</span>
            </p>
            <p className="text-xs text-slate-300">
              Matrícula: <span className="font-semibold text-slate-100">€{formData.matriculaEur}</span>
            </p>
          </div>
        </div>

        {/* Requisitos & Vantagens Editaveis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Critérios de Admissão & Facilidades
            </label>
            <span className="text-[11px] text-violet-400 font-medium">Clique nos quadros para ativar/desativar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                const at = { ...formData, aceitaEnem: !formData.aceitaEnem }
                setFormData(at)
                onSalvar(at)
              }}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between text-left transition-all duration-150 cursor-pointer hover:scale-[1.02] shadow-sm ${
                formData.aceitaEnem
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-500/5'
                  : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <span className="font-bold tracking-wider">ACEITA ENEM?</span>
              <span className="mt-2 text-xs font-bold">{formData.aceitaEnem ? '✓ Aceita Nota do ENEM' : '✕ Não aceita ENEM'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const at = { ...formData, aceitaDiplomaBr: !formData.aceitaDiplomaBr }
                setFormData(at)
                onSalvar(at)
              }}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between text-left transition-all duration-150 cursor-pointer hover:scale-[1.02] shadow-sm ${
                formData.aceitaDiplomaBr
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 shadow-sky-500/5'
                  : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <span className="font-bold tracking-wider">DIPLOMA BRASILEIRO?</span>
              <span className="mt-2 text-xs font-bold">{formData.aceitaDiplomaBr ? '✓ Aceita Graduação BR' : '✕ Requer Equivalência'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const at = { ...formData, bolsaCplp: !formData.bolsaCplp }
                setFormData(at)
                onSalvar(at)
              }}
              className={`p-3.5 rounded-xl border text-xs flex flex-col justify-between text-left transition-all duration-150 cursor-pointer hover:scale-[1.02] shadow-sm ${
                formData.bolsaCplp
                  ? 'bg-violet-500/15 border-violet-500/40 text-violet-300 shadow-violet-500/5'
                  : 'bg-slate-900/90 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <span className="font-bold tracking-wider">DESCONTO CPLP?</span>
              <span className="mt-2 text-xs font-bold">{formData.bolsaCplp ? '✓ Tarifa Reduzida CPLP' : '✕ Sem Desconto CPLP'}</span>
            </button>
          </div>
        </div>

        {/* Mudar Status no Kanban */}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Status no Processo Seletivo
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COLUNAS_FACULDADE.map(col => (
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
                    ? 'bg-violet-500/20 border-violet-500 text-violet-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>

        {/* Observacoes e Homologacao */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Observações & Dicas de Homologação (ex: UNEDasiss / Equivalência)
            </label>
            <textarea
              rows={3}
              placeholder="Digite prazos de inscrição, exigências de notas ou contatos acadêmicos..."
              value={formData.observacao || ''}
              onChange={e => setFormData({ ...formData, observacao: e.target.value })}
              onBlur={handleSalvar}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Componente de Anexos */}
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
            <IconeLixeira /> Excluir Faculdade
          </button>
          <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2 bg-violet-500 text-white font-bold text-xs rounded-xl hover:bg-violet-400 transition-all"
          >
            Concluído
          </button>
        </div>
      </div>
    </Modal>
  )
}
