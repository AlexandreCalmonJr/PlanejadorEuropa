import { useState } from 'react'
import type {
  Vaga,
  Faculdade,
  Documento,
  ItemFinanceiro,
  EtapaVisto,
  DocConsulado,
  TarefaLogistica,
  Voo,
} from '../types'
import {
  VAGAS_INICIAIS,
  FACULDADES_INICIAIS,
  DOCUMENTOS_INICIAIS,
  ITENS_FINANCEIROS_INICIAIS,
  ETAPAS_VISTO_INICIAIS,
  DOCS_CONSULADO_INICIAIS,
  TAREFAS_LOGISTICA_INICIAIS,
} from '../data'
import { isSupabaseConfigured, salvarItemSupabase, deletarItemSupabase } from '../lib/supabase'

const VOOS_DEMO: Voo[] = [
  {
    id: 'voo-1',
    ciaAerea: 'TAP Air Portugal',
    origem: 'Salvador (SSA)',
    destino: 'Lisboa (LIS) → Coimbra',
    dataPartida: '2026-08-15',
    horaPartida: '23:45',
    dataChegada: '2026-08-16',
    horaChegada: '11:20',
    tipoVoo: 'Somente Ida',
    conexoes: 'Direto',
    valorBRL: 4200,
    valorEUR: 683,
    bagagemMao: true,
    bagagensDespachadas: 2,
    detalheBagagem: '2 malas de 23kg + mochila',
    codigoReserva: 'TAP-SSA-9821',
    observacoes: 'Voo noturno direto para Lisboa com conexão de trem para Coimbra.',
  },
]

interface DemoSeederProps {
  setVagas: (v: Vaga[]) => void
  setFaculdades: (f: Faculdade[]) => void
  setDocs: (d: Documento[]) => void
  setItensFinanceiros: (fin: ItemFinanceiro[]) => void
  setEtapasVisto: (ev: EtapaVisto[]) => void
  setDocsConsulado: (dc: DocConsulado[]) => void
  setTarefasLogistica: (tl: TarefaLogistica[]) => void
  setVoos: (voos: Voo[]) => void
  onNavegarResumo: () => void
}

export function DemoSeeder({
  setVagas,
  setFaculdades,
  setDocs,
  setItensFinanceiros,
  setEtapasVisto,
  setDocsConsulado,
  setTarefasLogistica,
  setVoos,
  onNavegarResumo,
}: DemoSeederProps) {
  const [carregando, setCarregando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  const popularDadosDemo = async () => {
    setCarregando(true)
    setMensagemSucesso('')

    try {
      // 1. Atualizar estados locais
      setVagas(VAGAS_INICIAIS)
      setFaculdades(FACULDADES_INICIAIS)
      setDocs(DOCUMENTOS_INICIAIS)
      setItensFinanceiros(ITENS_FINANCEIROS_INICIAIS)
      setEtapasVisto(ETAPAS_VISTO_INICIAIS)
      setDocsConsulado(DOCS_CONSULADO_INICIAIS)
      setTarefasLogistica(TAREFAS_LOGISTICA_INICIAIS)
      setVoos(VOOS_DEMO)

      // 2. Sincronizar com Supabase se ativo
      if (isSupabaseConfigured) {
        for (const item of VAGAS_INICIAIS) await salvarItemSupabase('vagas', item)
        for (const item of FACULDADES_INICIAIS) await salvarItemSupabase('faculdades', item)
        for (const item of DOCUMENTOS_INICIAIS) await salvarItemSupabase('documentos', item)
        for (const item of ITENS_FINANCEIROS_INICIAIS) await salvarItemSupabase('itens_financeiros', item)
        for (const item of ETAPAS_VISTO_INICIAIS) await salvarItemSupabase('etapas_visto', item)
        for (const item of DOCS_CONSULADO_INICIAIS) await salvarItemSupabase('docs_consulado', item)
        for (const item of TAREFAS_LOGISTICA_INICIAIS) await salvarItemSupabase('tarefas_logistica', item)
        for (const item of VOOS_DEMO) await salvarItemSupabase('voos', item)
      }

      setMensagemSucesso('🎉 Todos os dados fictícios foram carregados no sistema e no Supabase com sucesso!')
    } catch (err) {
      console.error('Erro ao popular dados:', err)
    } finally {
      setCarregando(false)
    }
  }

  const zerarTudo = async () => {
    if (!confirm('Tem certeza que deseja apagar TODOS os dados da aplicação e do Supabase?')) return

    setCarregando(true)
    setMensagemSucesso('')

    try {
      setVagas([])
      setFaculdades([])
      setDocs([])
      setItensFinanceiros([])
      setEtapasVisto([])
      setDocsConsulado([])
      setTarefasLogistica([])
      setVoos([])

      if (isSupabaseConfigured) {
        for (const item of VAGAS_INICIAIS) await deletarItemSupabase('vagas', item.id)
        for (const item of FACULDADES_INICIAIS) await deletarItemSupabase('faculdades', item.id)
        for (const item of DOCUMENTOS_INICIAIS) await deletarItemSupabase('documentos', item.id)
        for (const item of ITENS_FINANCEIROS_INICIAIS) await deletarItemSupabase('itens_financeiros', item.id)
        for (const item of ETAPAS_VISTO_INICIAIS) await deletarItemSupabase('etapas_visto', item.id)
        for (const item of DOCS_CONSULADO_INICIAIS) await deletarItemSupabase('docs_consulado', item.id)
        for (const item of TAREFAS_LOGISTICA_INICIAIS) await deletarItemSupabase('tarefas_logistica', item.id)
        for (const item of VOOS_DEMO) await deletarItemSupabase('voos', item.id)
      }

      setMensagemSucesso('🧹 Todos os dados foram apagados com sucesso.')
    } catch (err) {
      console.error('Erro ao zerar dados:', err)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <h1 className="text-2xl font-bold text-slate-100">Modo de Apresentação & Testes</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Gere dados fictícios realistas instantaneamente para demonstrar o sistema ou limpe o banco para iniciar do zero.
        </p>
      </div>

      {/* Alerta de status do Supabase */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <div>
            <p className="text-xs font-bold text-slate-200">
              Status da Conexão: {isSupabaseConfigured ? 'Supabase Conectado' : 'Modo Offline (LocalStorage)'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSupabaseConfigured
                ? 'Os dados populados serão gravados diretamente nas suas tabelas do Supabase.'
                : 'Configure o Supabase no .env.local para gravar no banco remoto.'}
            </p>
          </div>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
          <span>{mensagemSucesso}</span>
          <button
            onClick={onNavegarResumo}
            className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 transition-colors"
          >
            Ir para o Resumo →
          </button>
        </div>
      )}

      {/* Cards de Acoes */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Popular Dados Ficticios */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-lg font-bold mb-3">
              🚀
            </div>
            <h3 className="text-base font-bold text-slate-100">Popular Dados de Apresentação</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Insere um conjunto completo e realista de dados fictícios para apresentação: 7 vagas Kanban, 9 faculdades em Portugal/Espanha, 4 documentos burocráticos, orçamento financeiro detalhado, etapas do visto D3/D8 e logística de viagem.
            </p>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>✔ 7 Vagas de Emprego Tech em Coimbra/Porto</p>
              <p>✔ 9 Cursos Universitários (UC, ISEC, ISCAC)</p>
              <p>✔ Orçamento Financeiro em EUR e BRL</p>
              <p>✔ Timeline Completa do Visto VFS</p>
            </div>
          </div>

          <button
            onClick={popularDadosDemo}
            disabled={carregando}
            className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {carregando ? 'Gravando dados...' : '✨ Carregar Dados Fictícios'}
          </button>
        </div>

        {/* Card 2: Zerar Banco */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center text-lg font-bold mb-3">
              🧹
            </div>
            <h3 className="text-base font-bold text-slate-100">Zerar Banco de Dados</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Remove todos os registros cadastrados de todas as abas para que você possa iniciar o planejamento com seus dados reais do zero.
            </p>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p>⚠ Apaga Vagas, Faculdades e Documentos</p>
              <p>⚠ Apaga Registros Financeiros e Voos</p>
              <p>⚠ Não afeta suas configurações de login</p>
            </div>
          </div>

          <button
            onClick={zerarTudo}
            disabled={carregando}
            className="w-full py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {carregando ? 'Limpando...' : '🗑️ Apagar Todos os Dados'}
          </button>
        </div>
      </div>
    </div>
  )
}
