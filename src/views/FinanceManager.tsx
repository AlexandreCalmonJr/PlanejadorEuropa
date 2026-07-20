import { useState } from 'react'
import type { ItemFinanceiro } from '../types'
import { fmt, gerarId, COTACAO_EURO } from '../helpers'
import { CORES_CATEGORIAS } from '../data'
import { IconeMais, IconeLixeira } from '../components/Icons'
import { CardResumo } from '../components/StatCard'
import { Modal, CampoTexto, CampoNumero, CampoSelect, CampoToggle, BotaoSubmit, useModal } from '../components/Modal'

interface FinanceManagerProps {
  itens: ItemFinanceiro[]
  setItens: React.Dispatch<React.SetStateAction<ItemFinanceiro[]>>
}

export function FinanceManager({ itens, setItens }: FinanceManagerProps) {
  const [moeda, setMoeda] = useState<'BRL' | 'EUR'>('BRL')
  const modal = useModal()

  const [novoLabel, setNovoLabel] = useState('')
  const [novoSubLabel, setNovoSubLabel] = useState('')
  const [novoValorBRL, setNovoValorBRL] = useState(0)
  const [novoTipo, setNovoTipo] = useState<'receita' | 'despesa'>('despesa')
  const [novaCategoria, setNovaCategoria] = useState('Viagem')
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
      recorrente: novoRecorrente,
    }
    setItens(prev => [...prev, novo])
    setNovoLabel(''); setNovoSubLabel(''); setNovoValorBRL(0); setNovoRecorrente(false)
    modal.fechar()
  }

  const remover = (id: string) => setItens(prev => prev.filter(i => i.id !== id))

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Gerenciador Financeiro</h1>
          <p className="text-slate-400 text-sm mt-1">Receitas e despesas · Salvador → Coimbra · Cotação €1 = R${COTACAO_EURO}</p>
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
            onClick={modal.abrir}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
          >
            <IconeMais />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <CardResumo label="Total de Receitas" valor={totalReceita} moeda={moeda} cor="#14B8A6" />
        <CardResumo label="Total de Despesas" valor={totalDespesa} moeda={moeda} cor="#EF4444" />
        <CardResumo label="Saldo Final" valor={saldo} moeda={moeda} cor={saldo >= 0 ? '#10B981' : '#EF4444'} ehSaldo />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Receitas Esperadas</h2>
          <div className="space-y-2">
            {receitas.map(item => (
              <LinhaFinanceira key={item.id} item={item} moeda={moeda} corCat={CORES_CATEGORIAS[item.categoria] ?? '#475569'} onRemover={() => remover(item.id)} />
            ))}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-teal-500/20 bg-teal-500/5 mt-3">
              <span className="text-teal-400 text-sm font-semibold">Total Receitas</span>
              <span className="text-teal-300 font-bold">{fmt(totalReceita, moeda)}</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Despesas Esperadas</h2>
          <div className="space-y-2">
            {despesas.map(item => (
              <LinhaFinanceira key={item.id} item={item} moeda={moeda} corCat={CORES_CATEGORIAS[item.categoria] ?? '#475569'} onRemover={() => remover(item.id)} />
            ))}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 mt-3">
              <span className="text-red-400 text-sm font-semibold">Total Despesas</span>
              <span className="text-red-300 font-bold">{fmt(totalDespesa, moeda)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 rounded-2xl border border-slate-700 bg-slate-900 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-slate-400 text-sm">Reserva líquida após mudança</p>
          <p className="text-slate-500 text-xs mt-0.5">Receitas menos todas as despesas previstas</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(saldo, moeda)}</p>
          <p className="text-slate-500 text-xs mt-0.5">≈ {Math.round(Math.abs(saldo) / (moeda === 'BRL' ? 2829 : 460))} meses de custo de vida em Coimbra</p>
        </div>
      </div>

      {/* Modal */}
      <Modal aberto={modal.aberto} onFechar={modal.fechar} titulo="Nova Transação">
        <CampoTexto label="Descrição" valor={novoLabel} onChange={setNovoLabel} placeholder="Ex: Passagens aéreas" />
        <CampoTexto label="Detalhes" valor={novoSubLabel} onChange={setNovoSubLabel} placeholder="Ex: SSA → LIS · Casal" />
        <CampoNumero label="Valor (R$)" valor={novoValorBRL} onChange={setNovoValorBRL} />
        <div className="grid grid-cols-2 gap-3">
          <CampoSelect label="Tipo" valor={novoTipo} onChange={setNovoTipo} opcoes={[
            { value: 'receita', label: '💰 Receita' },
            { value: 'despesa', label: '💸 Despesa' },
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
    </div>
  )
}

function LinhaFinanceira({ item, moeda, corCat, onRemover }: {
  item: ItemFinanceiro; moeda: 'BRL' | 'EUR'; corCat: string; onRemover: () => void
}) {
  const valor = moeda === 'BRL' ? item.valorBRL : item.valorEUR
  return (
    <div className="group flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: corCat }} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{item.label}</p>
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
        onClick={onRemover}
        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
      >
        <IconeLixeira />
      </button>
    </div>
  )
}
