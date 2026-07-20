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

const NOTAS_DEMO = [
  {
    id: 'nota-demo-1',
    titulo: '📌 Protocolo do Visto VFS Global',
    conteudo: 'Protocolo: BR-SSA-2026-9841.\nComparecer no Consulado em Salvador com 15 min de antecedência.\nLevar pasta organizada com originais e 2 cópias simples de cada documento.',
    cor: '#F97316',
    fixada: true,
    criadoEm: '20/07/2026 10:00',
    atualizadoEm: '20/07/2026 10:00',
  },
  {
    id: 'nota-demo-2',
    titulo: '💡 Dicas de Moradia em Coimbra',
    conteudo: 'Bairros recomendados:\n1. Solum — Excelente infraestrutura, perto do ISEC e centros comerciais.\n2. Celas — Próximo aos hospitais e pólo de saúde.\n3. Baixa/Alta — Centro histórico, perto da Universidade de Coimbra.\nMédia de T2 reformado: €650 a €800/mês.',
    cor: '#14B8A6',
    fixada: true,
    criadoEm: '20/07/2026 10:30',
    atualizadoEm: '20/07/2026 10:30',
  },
  {
    id: 'nota-demo-3',
    titulo: '📞 Contatos Importantes de Imigração',
    conteudo: '• Dra. Mafalda (Advogada de Imigração PT): +351 912 345 678\n• Representante Fiscal (Mãe em Coimbra): Dona Maria\n• VFS Global SSA: (71) 3000-0000\n• AIMA / SEF Coimbra: Rua Venâncio Rodrigues, n.º 25',
    cor: '#8B5CF6',
    fixada: false,
    criadoEm: '20/07/2026 11:15',
    atualizadoEm: '20/07/2026 11:15',
  },
  {
    id: 'nota-demo-4',
    titulo: '🚀 Stack Tech em Alta em Portugal',
    conteudo: 'Tecnologias mais exigidas nas entrevistas de TI em Coimbra e Porto:\n• Frontend: React, TypeScript, Next.js, TailWind\n• Backend: Node.js, Python (Django/FastAPI), Java (Spring Boot)\n• Mobile: Flutter, React Native\n• Cloud: AWS, Docker, Kubernetes',
    cor: '#0284C7',
    fixada: false,
    criadoEm: '20/07/2026 14:20',
    atualizadoEm: '20/07/2026 14:20',
  },
]

const COUNTDOWNS_DEMO = [
  { id: 'cd1', label: 'Embarque Salvador → Lisboa', data: '2026-12-15', icone: '✈️' },
  { id: 'cd2', label: 'Entrega de Docs no Consulado', data: '2026-09-15', icone: '📄' },
  { id: 'cd3', label: 'Início das Aulas na Univ. de Coimbra', data: '2026-10-01', icone: '🎓' },
  { id: 'cd4', label: 'Resultado da Entrevista na Feedzai', data: '2026-08-10', icone: '💼' },
]

const EVENTOS_CALENDARIO_DEMO = [
  { id: 'ev1', label: '💼 Entrevista Técnica Feedzai', data: '2026-08-10', icone: '💼' },
  { id: 'ev2', label: '📜 Vencimento da Certidão Apostilada', data: '2026-09-01', icone: '📜' },
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
      // 1. Atualizar estados locais dos módulos
      setVagas(VAGAS_INICIAIS)
      setFaculdades(FACULDADES_INICIAIS)
      setDocs(DOCUMENTOS_INICIAIS)
      setItensFinanceiros(ITENS_FINANCEIROS_INICIAIS)
      setEtapasVisto(ETAPAS_VISTO_INICIAIS)
      setDocsConsulado(DOCS_CONSULADO_INICIAIS)
      setTarefasLogistica(TAREFAS_LOGISTICA_INICIAIS)
      setVoos(VOOS_DEMO)

      // 2. Gravar Notas e Calendário em localStorage
      localStorage.setItem('ep_notas', JSON.stringify(NOTAS_DEMO))
      localStorage.setItem('ep_countdowns', JSON.stringify(COUNTDOWNS_DEMO))
      localStorage.setItem('ep_calendar_events', JSON.stringify(EVENTOS_CALENDARIO_DEMO))

      // 3. Sincronizar com Supabase se ativo
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

      setMensagemSucesso('🎉 Todos os dados de demonstração (Finanças, Burocracia, Vagas, Faculdades, Visto, Notas e Calendário) foram carregados!')
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

      localStorage.removeItem('ep_notas')
      localStorage.removeItem('ep_countdowns')
      localStorage.removeItem('ep_calendar_events')

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
          <h1 className="text-2xl font-bold text-slate-100">Modo de Apresentação & Testes (Demo)</h1>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Gere um ambiente completo com dados realistas para testar todos os módulos (Finanças, Burocracia, Vistas, Vagas, Faculdades, Notas e Calendário).
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
                : 'Os dados populados serão salvos instantaneamente no seu navegador.'}
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

      {/* Cards de Ações */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Card 1: Popular Dados Fictícios */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center text-lg font-bold mb-3">
              🚀
            </div>
            <h3 className="text-base font-bold text-slate-100">Popular Dados Completo de Demo</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Insere um conjunto completo e realista cobrindo 100% dos módulos do aplicativo.
            </p>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>✔ 💼 7 Vagas Tech (Critical, Feedzai, Talkdesk, OutSystems)</p>
              <p>✔ 🎓 9 Opções de Faculdades (UC Coimbra, ISEC, Espanha)</p>
              <p>✔ 📜 13 Documentos Burocráticos com Trava e Pessoas</p>
              <p>✔ 💰 Orçamento Financeiro em EUR/BRL (Caixa R$55.000)</p>
              <p>✔ 🛂 Timeline VFS Global do Visto D3 e Checklist</p>
              <p>✔ 📋 4 Notas Rápidas (Protocolos, Moradia, Dicas Tech)</p>
              <p>✔ 📅 4 Contadores Regressivos & Eventos no Calendário</p>
            </div>
          </div>

          <button
            onClick={popularDadosDemo}
            disabled={carregando}
            className="w-full py-3 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {carregando ? 'Gravando dados...' : '✨ Carregar Dados Completos de Demo'}
          </button>
        </div>

        {/* Card 2: Zerar Banco */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center text-lg font-bold mb-3">
              🧹
            </div>
            <h3 className="text-base font-bold text-slate-100">Zerar Todos os Dados</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">
              Remove todos os registros cadastrados de todas as abas e notas para iniciar o planejamento do zero.
            </p>

            <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p>⚠ Apaga Vagas, Faculdades e Documentos</p>
              <p>⚠ Apaga Registros Financeiros, Voos e Visto</p>
              <p>⚠ Apaga Notas Rápidas e Calendário</p>
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
