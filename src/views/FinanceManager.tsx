import { useState } from 'react'
import type { ItemFinanceiro, AnexoDocumento } from '../types'
import { fmt, gerarId, COTACAO_EURO } from '../helpers'
import { CORES_CATEGORIAS } from '../data'
import { IconeMais, IconeLixeira } from '../components/Icons'
import { CardResumo } from '../components/StatCard'
import { Modal, CampoTexto, CampoNumero, CampoSelect, CampoToggle, BotaoSubmit, useModal } from '../components/Modal'
import { FileUploader } from '../components/FileUploader'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'

interface FinanceManagerProps {
  itens: ItemFinanceiro[]
  setItens: React.Dispatch<React.SetStateAction<ItemFinanceiro[]>>
}

export function FinanceManager({ itens, setItens }: FinanceManagerProps) {
  const [moeda, setMoeda] = useState<'BRL' | 'EUR'>('BRL')
  const modalNovo = useModal()
  const [itemDetalhe, setItemDetalhe] = useState<ItemFinanceiro | null>(null)
  const [anexoPreview, setAnexoPreview] = useState<AnexoDocumento | null>(null)

  const [novoLabel, setNovoLabel] = useState('')
  const [novoSubLabel, setNovoSubLabel] = useState('')
  const [novoValorBRL, setNovoValorBRL] = useState(0)
  const [novoTipo, setNovoTipo] = useState<'receita' | 'despesa'>('despesa')
  const [novaCategoria, setNovaCategoria] = useState('Viagem')
  const [novoBanco, setNovoBanco] = useState('Millennium BCP')
  const [novoRecorrente, setNovoRecorrente] = useState(false)

  const receitas = itens.filter(i => i.tipo === 'receita')
  const despesas = itens.filter(i => i.tipo === 'despesa')

  const totalReceita = receitas.reduce((s, i) => s + (moeda === 'BRL' ? i.valorBRL : i.valorEUR), 0)
  const totalDespesa = despesas.reduce((s, i) => s + (moeda === 'BRL' ? i.valorBRL : i.valorEUR), 0)
  const saldo = totalReceita - totalDespesa

  const adicionar = () => {
    if (!novoLabel.trim()) return
    const eurVal = Math.round((novoValorBRL / COTACAO_EURO) * 100) / 100
    const novo: ItemFinanceiro = {
      id: gerarId(),
      label: novoLabel,
      subLabel: novoSubLabel,
      valorBRL: novoValorBRL,
      valorEUR: eurVal,
      tipo: novoTipo,
      categoria: novaCategoria,
      banco: novoBanco,
      recorrente: novoRecorrente,
      anexos: [],
    }
    setItens(prev => [...prev, novo])
    setNovoLabel(''); setNovoSubLabel(''); setNovoValorBRL(0); setNovoRecorrente(false)
    modalNovo.fechar()
  }

  const salvarItem = (itemAtualizado: ItemFinanceiro) => {
    setItens(prev => prev.map(i => i.id === itemAtualizado.id ? itemAtualizado : i))
    if (itemDetalhe?.id === itemAtualizado.id) setItemDetalhe(itemAtualizado)
  }

  const remover = (id: string) => {
    setItens(prev => prev.filter(i => i.id !== id))
    if (itemDetalhe?.id === id) setItemDetalhe(null)
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Gerenciador Financeiro & Comprovantes</h1>
          <p className="text-slate-400 text-sm mt-1">Receitas, despesas, instituição bancária e comprovantes de pagamento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1">
            {(['BRL', 'EUR'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMoeda(m)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                  moeda === m ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {m === 'BRL' ? '🇧🇷 BRL' : '🇵🇹 EUR'}
              </button>
            ))}
          </div>
          <button
            onClick={modalNovo.abrir}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all shadow-sm"
          >
            <IconeMais /> Nova Transação
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardResumo label="Total de Receitas" valor={totalReceita} moeda={moeda} cor="#14B8A6" />
        <CardResumo label="Total de Despesas" valor={totalDespesa} moeda={moeda} cor="#EF4444" />
        <CardResumo label="Saldo Final" valor={saldo} moeda={moeda} cor={saldo >= 0 ? '#10B981' : '#EF4444'} ehSaldo />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Receitas & Poupança</h2>
          <div className="space-y-2">
            {receitas.map(item => (
              <LinhaFinanceira
                key={item.id}
                item={item}
                moeda={moeda}
                corCat={CORES_CATEGORIAS[item.categoria] ?? '#475569'}
                onClick={() => setItemDetalhe(item)}
                onRemover={() => remover(item.id)}
              />
            ))}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-teal-500/20 bg-teal-500/5 mt-3">
              <span className="text-teal-400 text-sm font-semibold">Total Receitas</span>
              <span className="text-teal-300 font-bold">{fmt(totalReceita, moeda)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Despesas & Custos</h2>
          <div className="space-y-2">
            {despesas.map(item => (
              <LinhaFinanceira
                key={item.id}
                item={item}
                moeda={moeda}
                corCat={CORES_CATEGORIAS[item.categoria] ?? '#475569'}
                onClick={() => setItemDetalhe(item)}
                onRemover={() => remover(item.id)}
              />
            ))}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 mt-3">
              <span className="text-red-400 text-sm font-semibold">Total Despesas</span>
              <span className="text-red-300 font-bold">{fmt(totalDespesa, moeda)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-slate-700 bg-slate-900 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-400 text-sm font-medium">Reserva líquida após mudança</p>
          <p className="text-slate-500 text-xs mt-0.5">Receitas menos todas as despesas previstas</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(saldo, moeda)}</p>
          <p className="text-slate-500 text-xs mt-0.5">≈ {Math.round(Math.abs(saldo) / (moeda === 'BRL' ? 2829 : 460))} meses de custo de vida em Coimbra</p>
        </div>
      </div>

      {/* Modal Nova Transacao */}
      <Modal aberto={modalNovo.aberto} onFechar={modalNovo.fechar} titulo="Nova Transação Financeira">
        <CampoTexto label="Descrição da Transação" valor={novoLabel} onChange={setNovoLabel} placeholder="Ex: Pagamento de Passagens / Saldo Millennium" />
        <CampoTexto label="Detalhes / Observações" valor={novoSubLabel} onChange={setNovoSubLabel} placeholder="Ex: Transferência via Wise / Comprovante de renda" />
        <div className="grid grid-cols-2 gap-3">
          <CampoNumero label="Valor Total (R$ BRL)" valor={novoValorBRL} onChange={setNovoValorBRL} />
          <CampoTexto label="Banco / Instituição" valor={novoBanco} onChange={setNovoBanco} placeholder="Ex: Millennium BCP, Wise, Nubank" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoSelect label="Tipo" valor={novoTipo} onChange={setNovoTipo} opcoes={[
            { value: 'receita', label: '💰 Receita / Entrada' },
            { value: 'despesa', label: '💸 Despesa / Saída' },
          ]} />
          <CampoSelect label="Categoria" valor={novaCategoria} onChange={setNovaCategoria} opcoes={[
            { value: 'Poupança', label: 'Poupança' },
            { value: 'Rescisão', label: 'Rescisão' },
            { value: 'Viagem', label: 'Viagem' },
            { value: 'Moradia', label: 'Moradia' },
            { value: 'Custo de Vida', label: 'Custo de Vida' },
            { value: 'Jurídico', label: 'Jurídico' },
            { value: 'Reserva', label: 'Reserva' },
            { value: 'Comprovação', label: 'Comprovação' },
          ]} />
        </div>
        <CampoToggle label="Recorrente (mensal)?" valor={novoRecorrente} onChange={setNovoRecorrente} />
        <BotaoSubmit label="Adicionar Transação" onClick={adicionar} />
      </Modal>

      {/* Modal Detalhes & Comprovantes */}
      {itemDetalhe && (
        <Modal aberto={Boolean(itemDetalhe)} onFechar={() => setItemDetalhe(null)} titulo="Detalhes & Comprovantes Financeiros">
          <div className="space-y-5 text-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-100">{itemDetalhe.label}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{itemDetalhe.subLabel}</p>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Valor em BRL</p>
                <p className="text-lg font-extrabold text-slate-100 mt-0.5">{fmt(itemDetalhe.valorBRL, 'BRL')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Valor em EUR</p>
                <p className="text-lg font-extrabold text-teal-400 mt-0.5">{fmt(itemDetalhe.valorEUR, 'EUR')}</p>
              </div>
            </div>

            {/* Banco editavel */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Banco / Instituição Financeira
              </label>
              <input
                type="text"
                value={itemDetalhe.banco || ''}
                onChange={e => {
                  const at = { ...itemDetalhe, banco: e.target.value }
                  salvarItem(at)
                }}
                placeholder="Ex: Millennium BCP, Wise, Itaú"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500 font-bold"
              />
            </div>

            {/* Upload de Comprovantes */}
            <div className="pt-2 border-t border-slate-800">
              <FileUploader
                anexos={itemDetalhe.anexos}
                onAdicionarAnexo={anexo => {
                  const at = { ...itemDetalhe, anexos: [...(itemDetalhe.anexos || []), anexo] }
                  salvarItem(at)
                }}
                onRemoverAnexo={id => {
                  const at = { ...itemDetalhe, anexos: (itemDetalhe.anexos || []).filter(a => a.id !== id) }
                  salvarItem(at)
                }}
              />
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => remover(itemDetalhe.id)}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Excluir Transação
              </button>
              <button
                type="button"
                onClick={() => setItemDetalhe(null)}
                className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Salvar & Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Pre-visualizacao de Documento */}
      <DocumentPreviewModal
        anexo={anexoPreview}
        onFechar={() => setAnexoPreview(null)}
      />
    </div>
  )
}

function LinhaFinanceira({ item, moeda, corCat, onClick, onRemover }: {
  item: ItemFinanceiro; moeda: 'BRL' | 'EUR'; corCat: string; onClick: () => void; onRemover: () => void
}) {
  const valor = moeda === 'BRL' ? item.valorBRL : item.valorEUR
  const numAnexos = item.anexos?.length || 0

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-xl transition-all cursor-pointer"
    >
      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: corCat }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-slate-200 text-sm font-medium truncate">{item.label}</p>
          {item.banco && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold border border-slate-700">
              🏦 {item.banco}
            </span>
          )}
          {numAnexos > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20">
              📎 {numAnexos}
            </span>
          )}
        </div>
        <p className="text-slate-500 text-xs truncate">
          {item.subLabel}
          {item.recorrente && <span className="ml-1 text-amber-500">🔄 mensal</span>}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${item.tipo === 'receita' ? 'text-teal-400' : 'text-slate-300'}`}>
          {item.tipo === 'receita' ? '+' : '−'}{fmt(valor, moeda)}
        </p>
        <p className="text-slate-600 text-xs">{item.categoria}</p>
      </div>
      <button
        onClick={e => {
          e.stopPropagation()
          onRemover()
        }}
        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
      >
        <IconeLixeira />
      </button>
    </div>
  )
}

