import { useState, useRef } from 'react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

type View = 'overview' | 'kanban' | 'documents' | 'finance' | 'visto'

type ColunaKanban = 'Candidatado' | 'Triagem RH' | 'Entrevista Técnica' | 'Oferta'

interface Vaga {
  id: string
  empresa: string
  cargo: string
  salarioMin: number
  salarioMax: number
  patrocinioVisto: boolean
  coluna: ColunaKanban
  inicial: string
  cor: string
}

type StatusDoc = 'Concluído' | 'Em Andamento' | 'Pendente' | 'Bloqueado'

interface Documento {
  id: string
  nome: string
  descricao: string
  status: StatusDoc
  bloqueadoPor?: string[]
}

interface ItemFinanceiro {
  id: string
  label: string
  subLabel: string
  valorBRL: number
  valorEUR: number
  tipo: 'receita' | 'despesa'
  categoria: string
}

type StatusEtapa = 'Concluído' | 'Em Andamento' | 'Pendente'

interface EtapaVisto {
  id: string
  titulo: string
  descricao: string
  status: StatusEtapa
  data?: string
  obs?: string
}

// ─── Dados ────────────────────────────────────────────────────────────────────

const VAGAS_INICIAIS: Vaga[] = [
  { id: 'j1', empresa: 'Farfetch', cargo: 'Engenheiro Backend Sênior', salarioMin: 65000, salarioMax: 80000, patrocinioVisto: true, coluna: 'Candidatado', inicial: 'F', cor: '#F59E0B' },
  { id: 'j2', empresa: 'Feedzai', cargo: 'Engenheiro Backend', salarioMin: 55000, salarioMax: 70000, patrocinioVisto: false, coluna: 'Candidatado', inicial: 'F', cor: '#8B5CF6' },
  { id: 'j3', empresa: 'Blip', cargo: 'Desenvolvedor Full Stack', salarioMin: 50000, salarioMax: 65000, patrocinioVisto: true, coluna: 'Candidatado', inicial: 'B', cor: '#0284C7' },
  { id: 'j4', empresa: 'Unbabel', cargo: 'Engenheiro de Software Sênior', salarioMin: 60000, salarioMax: 75000, patrocinioVisto: true, coluna: 'Triagem RH', inicial: 'U', cor: '#14B8A6' },
  { id: 'j5', empresa: 'Talkdesk', cargo: 'Engenheiro de Software II', salarioMin: 70000, salarioMax: 90000, patrocinioVisto: true, coluna: 'Triagem RH', inicial: 'T', cor: '#EC4899' },
  { id: 'j6', empresa: 'Sword Health', cargo: 'Engenheiro Backend', salarioMin: 65000, salarioMax: 85000, patrocinioVisto: true, coluna: 'Entrevista Técnica', inicial: 'S', cor: '#10B981' },
  { id: 'j7', empresa: 'Celfocus', cargo: 'Desenvolvedor Sênior', salarioMin: 55000, salarioMax: 70000, patrocinioVisto: false, coluna: 'Entrevista Técnica', inicial: 'C', cor: '#F97316' },
  { id: 'j8', empresa: 'OutSystems', cargo: 'Engenheiro Principal', salarioMin: 85000, salarioMax: 105000, patrocinioVisto: true, coluna: 'Oferta', inicial: 'O', cor: '#E11D48' },
]

const DOCUMENTOS: Documento[] = [
  { id: 'd1', nome: 'Passaporte Brasileiro', descricao: 'Válido até 2030 · Páginas 10-11 para carimbo do visto', status: 'Concluído' },
  { id: 'd2', nome: 'Apostila Certidão de Nascimento', descricao: 'Apostila da Haia sobre certidão de nascimento', status: 'Concluído' },
  { id: 'd3', nome: 'Certidão de Antecedentes Criminais', descricao: 'Polícia Federal + Estadual · Apostilada', status: 'Em Andamento' },
  { id: 'd4', nome: 'Autorização PB4 (Saúde)', descricao: 'Autorização pelo acordo bilateral de saúde · Ministério da Saúde', status: 'Pendente', bloqueadoPor: ['d3'] },
  { id: 'd5', nome: 'NIF (Número de Identificação Fiscal)', descricao: 'NIF português · Agendamento pelo portal das Finanças', status: 'Em Andamento' },
  { id: 'd6', nome: 'NISS (Segurança Social)', descricao: 'Número de Segurança Social português', status: 'Pendente', bloqueadoPor: ['d5'] },
  { id: 'd7', nome: 'Conta Bancária (Millennium BCP)', descricao: 'Abertura de conta para não-residente', status: 'Pendente', bloqueadoPor: ['d5', 'd6'] },
  { id: 'd8', nome: 'Visto D3 (Trabalho Qualificado)', descricao: 'Consulado português em São Paulo · Pedido principal do visto', status: 'Pendente', bloqueadoPor: ['d3', 'd4'] },
]

const ITENS_FINANCEIROS: ItemFinanceiro[] = [
  { id: 'f1', label: 'FGTS & Verbas Rescisórias', subLabel: 'Rescisão + saque do FGTS', valorBRL: 48500, valorEUR: 7951, tipo: 'receita', categoria: 'Rescisão' },
  { id: 'f2', label: 'Último Salário (Agosto)', subLabel: 'Holerite final proporcional', valorBRL: 14200, valorEUR: 2328, tipo: 'receita', categoria: 'Salário' },
  { id: 'f3', label: 'Poupança Pessoal', subLabel: 'Conta poupança (Nubank)', valorBRL: 120300, valorEUR: 19721, tipo: 'receita', categoria: 'Poupança' },
  { id: 'f4', label: 'Passagens GRU → LIS', subLabel: '2 passagens · Econômica · Nov 2025', valorBRL: 9800, valorEUR: 1607, tipo: 'despesa', categoria: 'Viagem' },
  { id: 'f5', label: 'Primeiro Mês de Aluguel', subLabel: 'T2 · Arroios, Lisboa', valorBRL: 18300, valorEUR: 3000, tipo: 'despesa', categoria: 'Moradia' },
  { id: 'f6', label: 'Caução (2 meses)', subLabel: 'Depósito caução — reembolsável', valorBRL: 36600, valorEUR: 6000, tipo: 'despesa', categoria: 'Moradia' },
  { id: 'f7', label: 'Mudança & Envio de Pertences', subLabel: 'Container parcial — ~300kg', valorBRL: 6100, valorEUR: 1000, tipo: 'despesa', categoria: 'Logística' },
  { id: 'f8', label: 'Taxas Consulares & Visto', subLabel: 'Visto D3 + taxas de documentação', valorBRL: 2440, valorEUR: 400, tipo: 'despesa', categoria: 'Jurídico' },
  { id: 'f9', label: 'Honorários Advocatícios', subLabel: 'Retenção de advogado de imigração', valorBRL: 3660, valorEUR: 600, tipo: 'despesa', categoria: 'Jurídico' },
  { id: 'f10', label: 'Fundo de Emergência', subLabel: 'Reserva para 3 meses em Portugal', valorBRL: 30500, valorEUR: 5000, tipo: 'despesa', categoria: 'Reserva' },
]

const PRAZOS = [
  { label: 'Apostila dos Antecedentes Criminais', data: '15 Ago, 2025', urgencia: 'alta' },
  { label: 'Agendamento NIF — Lisboa', data: '22 Ago, 2025', urgencia: 'media' },
  { label: 'Prazo de Pedido do Visto', data: '30 Set, 2025', urgencia: 'baixa' },
]

const COLUNAS: ColunaKanban[] = ['Candidatado', 'Triagem RH', 'Entrevista Técnica', 'Oferta']

const CORES_COLUNAS: Record<ColunaKanban, string> = {
  'Candidatado':        '#0284C7',
  'Triagem RH':         '#14B8A6',
  'Entrevista Técnica': '#8B5CF6',
  'Oferta':             '#10B981',
}

const ETAPAS_VISTO: EtapaVisto[] = [
  {
    id: 'v1',
    titulo: 'Reunião de Documentos',
    descricao: 'Coleta e apostilamento de todos os documentos obrigatórios para o pedido de visto.',
    status: 'Concluído',
    data: 'Jul 2025',
    obs: 'Passaporte e Certidão de Nascimento apostilados.',
  },
  {
    id: 'v2',
    titulo: 'Agendamento Consular',
    descricao: 'Marcação de horário no Consulado Geral de Portugal em São Paulo via VFS Global.',
    status: 'Em Andamento',
    data: '28 Ago, 2025',
    obs: 'Protocolo VFS: BR-SP-2025-084321 · Comparecer às 09h30.',
  },
  {
    id: 'v3',
    titulo: 'Entrega de Documentos',
    descricao: 'Entrega presencial da pasta completa no consulado com todos os originais e cópias.',
    status: 'Pendente',
    data: 'Set 2025',
  },
  {
    id: 'v4',
    titulo: 'Análise pelo Consulado',
    descricao: 'Período de análise pelo Consulado. O prazo regulamentar é de 60 dias úteis.',
    status: 'Pendente',
    data: 'Set — Nov 2025',
    obs: 'Possível consulta de status via portal SEF.',
  },
  {
    id: 'v5',
    titulo: 'Decisão do Consulado',
    descricao: 'Notificação por e-mail e/ou carta com o resultado: aprovação, recusa ou pedido de esclarecimentos.',
    status: 'Pendente',
    data: 'Nov 2025',
  },
  {
    id: 'v6',
    titulo: 'Retirada do Visto',
    descricao: 'Retirada do passaporte com visto carimbado no consulado ou via correio (Sedex).',
    status: 'Pendente',
    data: 'Nov — Dez 2025',
  },
]

const DOCS_CONSULADO = [
  { label: 'Formulário de pedido de visto (impresso e assinado)', ok: true },
  { label: 'Passaporte válido + 2 cópias', ok: true },
  { label: '2 fotos 3×4 recentes (fundo branco)', ok: true },
  { label: 'Certidão de antecedentes criminais apostilada', ok: false },
  { label: 'Autorização PB4 original', ok: false },
  { label: 'Contrato de trabalho em Portugal assinado', ok: false },
  { label: 'Comprovante de meios de subsistência (extrato bancário)', ok: true },
  { label: 'Comprovante de alojamento em Portugal', ok: false },
  { label: 'Seguro de viagem/saúde com cobertura mínima de €30.000', ok: false },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, moeda: 'BRL' | 'EUR') =>
  moeda === 'BRL'
    ? `R$${n.toLocaleString('pt-BR')}`
    : `€${n.toLocaleString('de-DE')}`

const fmtK = (n: number) => `€${Math.round(n / 1000)}k`

// ─── Componentes base ─────────────────────────────────────────────────────────

function AnelProgresso({ pct, tamanho = 120, espessura = 10 }: { pct: number; tamanho?: number; espessura?: number }) {
  const r = (tamanho - espessura) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * pct
  return (
    <svg width={tamanho} height={tamanho} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" stroke="#1E293B" strokeWidth={espessura} />
      <circle
        cx={tamanho / 2} cy={tamanho / 2} r={r}
        fill="none" stroke="#14B8A6" strokeWidth={espessura} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
    </svg>
  )
}

function BadgeStatus({ status }: { status: StatusDoc }) {
  const cfg: Record<StatusDoc, { bg: string; txt: string; dot: string }> = {
    'Concluído':    { bg: 'bg-emerald-950', txt: 'text-emerald-400', dot: '#10B981' },
    'Em Andamento': { bg: 'bg-sky-950',     txt: 'text-sky-400',     dot: '#0284C7' },
    'Pendente':     { bg: 'bg-slate-800',   txt: 'text-slate-400',   dot: '#64748B' },
    'Bloqueado':    { bg: 'bg-red-950',     txt: 'text-red-400',     dot: '#EF4444' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.txt}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  )
}

function BadgeEtapa({ status }: { status: StatusEtapa }) {
  const cfg: Record<StatusEtapa, { bg: string; txt: string; dot: string }> = {
    'Concluído':    { bg: 'bg-emerald-950', txt: 'text-emerald-400', dot: '#10B981' },
    'Em Andamento': { bg: 'bg-amber-950',   txt: 'text-amber-400',   dot: '#F59E0B' },
    'Pendente':     { bg: 'bg-slate-800',   txt: 'text-slate-500',   dot: '#475569' },
  }
  const c = cfg[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.txt}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
      {status}
    </span>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const ITENS_NAV = [
  { id: 'overview',   label: 'Resumo',      icon: IconeGrade },
  { id: 'kanban',     label: 'Vagas',       icon: IconeKanban,  badge: '8' },
  { id: 'documents',  label: 'Burocracia',  icon: IconeArquivo, badge: '3', badgeColor: 'bg-sky-500/20 text-sky-400' },
  { id: 'finance',    label: 'Finanças',    icon: IconeCarteira },
  { id: 'visto',      label: 'Visto D3',    icon: IconePassaporte, badge: '!', badgeColor: 'bg-amber-500/20 text-amber-400' },
] as const

function Sidebar({ ativa, onNav }: { ativa: View; onNav: (v: View) => void }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
              <span className="text-white font-bold text-sm">EP</span>
            </div>
            <div>
              <p className="text-slate-100 font-semibold text-sm leading-none">EuroPlanner</p>
              <p className="text-slate-500 text-xs mt-0.5">BRL → EUR · Rumo a PT</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {ITENS_NAV.map(({ id, label, icon: Icone, badge, badgeColor }) => {
            const ativo = ativa === id
            return (
              <button
                key={id}
                onClick={() => onNav(id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  ativo ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icone size={16} ativo={ativo} />
                {label}
                {badge && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md ${badgeColor ?? 'bg-slate-700 text-slate-300'}`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
              <span className="text-white text-xs font-semibold">VC</span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">Você, Engenheiro(a)</p>
              <p className="text-slate-500 text-xs truncate">São Paulo → Lisboa</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex">
        {ITENS_NAV.map(({ id, label, icon: Icone }) => {
          const ativo = ativa === id
          return (
            <button
              key={id}
              onClick={() => onNav(id as View)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                ativo ? 'text-teal-400' : 'text-slate-500'
              }`}
            >
              <Icone size={18} ativo={ativo} />
              {label}
            </button>
          )
        })}
      </nav>
    </>
  )
}

// ─── Tela: Resumo ─────────────────────────────────────────────────────────────

function PainelResumo() {
  const totalBRL = ITENS_FINANCEIROS.filter(i => i.tipo === 'receita').reduce((s, i) => s + i.valorBRL, 0)
  const totalEUR = ITENS_FINANCEIROS.filter(i => i.tipo === 'receita').reduce((s, i) => s + i.valorEUR, 0)
  const despBRL  = ITENS_FINANCEIROS.filter(i => i.tipo === 'despesa').reduce((s, i) => s + i.valorBRL, 0)
  const despEUR  = ITENS_FINANCEIROS.filter(i => i.tipo === 'despesa').reduce((s, i) => s + i.valorEUR, 0)
  const saldoEUR = totalEUR - despEUR

  const concluidos = DOCUMENTOS.filter(d => d.status === 'Concluído').length
  const total = DOCUMENTOS.length
  const pct = concluidos / total

  const etapasVistoConcluidas = ETAPAS_VISTO.filter(e => e.status === 'Concluído').length
  const etapaAtual = ETAPAS_VISTO.find(e => e.status === 'Em Andamento')

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Visão Geral</h1>
        <p className="text-slate-400 text-sm mt-1">Sua jornada de imigração de relance · Atualizado hoje</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardEstatistica label="Total em Caixa" valor={fmt(totalBRL, 'BRL')} sub="orçamento disponível" cor="#14B8A6" />
        <CardEstatistica label="Convertido em EUR" valor={fmt(totalEUR, 'EUR')} sub="a R$6,10/€1" cor="#0284C7" />
        <CardEstatistica label="Despesas Previstas" valor={fmt(despEUR, 'EUR')} sub={fmt(despBRL, 'BRL')} cor="#8B5CF6" />
        <CardEstatistica label="Saldo Após Mudança" valor={fmt(saldoEUR, 'EUR')} sub="estimativa de reserva" cor="#10B981" />
      </div>

      {/* Linha principal */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        {/* Orçamento */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Composição do Orçamento</h2>
          <div className="space-y-3">
            <BarraOrcamento label="FGTS & Rescisão" brl={48500} pct={48500 / totalBRL} />
            <BarraOrcamento label="Último Salário" brl={14200} pct={14200 / totalBRL} />
            <BarraOrcamento label="Poupança" brl={120300} pct={120300 / totalBRL} />
          </div>
          <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between text-sm">
            <span className="text-slate-400">Total</span>
            <span className="text-slate-100 font-semibold">
              {fmt(totalBRL, 'BRL')} <span className="text-slate-500 font-normal">/ {fmt(totalEUR, 'EUR')}</span>
            </span>
          </div>
        </div>

        {/* Anel de progresso — docs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest self-start">Documentos</h2>
          <div className="relative">
            <AnelProgresso pct={pct} tamanho={120} espessura={11} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-100">{concluidos}</span>
              <span className="text-slate-500 text-xs">de {total}</span>
            </div>
          </div>
          <div className="flex gap-3 text-xs">
            <PontoLegenda cor="#10B981" label="Concluído" />
            <PontoLegenda cor="#0284C7" label="Andamento" />
            <PontoLegenda cor="#475569" label="Pendente" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Prazos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Próximos Prazos</h2>
          <div className="space-y-3">
            {PRAZOS.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  p.urgencia === 'alta' ? 'bg-red-500' : p.urgencia === 'media' ? 'bg-amber-500' : 'bg-teal-500'
                }`} />
                <span className="text-slate-200 text-sm flex-1">{p.label}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                  p.urgencia === 'alta' ? 'bg-red-950 text-red-400' : p.urgencia === 'media' ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>{p.data}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status do visto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-widest">Progresso do Visto D3</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl font-bold text-slate-100">{etapasVistoConcluidas}
              <span className="text-slate-600 text-lg">/{ETAPAS_VISTO.length}</span>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">etapas concluídas</p>
              <p className="text-slate-500 text-xs">Consulado Geral · São Paulo</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 mb-4">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${(etapasVistoConcluidas / ETAPAS_VISTO.length) * 100}%`,
              background: 'linear-gradient(90deg, #F59E0B, #14B8A6)',
            }} />
          </div>
          {etapaAtual && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
              <span className="mt-0.5 text-amber-400 text-xs">●</span>
              <div>
                <p className="text-amber-300 text-xs font-semibold">Em andamento</p>
                <p className="text-slate-300 text-sm">{etapaAtual.titulo}</p>
                {etapaAtual.data && <p className="text-slate-500 text-xs mt-0.5">{etapaAtual.data}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CardEstatistica({ label, valor, sub, cor }: { label: string; valor: string; sub: string; cor: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
      <div className="w-7 h-1 rounded-full mb-3" style={{ background: cor }} />
      <p className="text-slate-400 text-xs font-medium mb-1">{label}</p>
      <p className="text-slate-100 text-lg font-semibold leading-tight">{valor}</p>
      <p className="text-slate-500 text-xs mt-0.5">{sub}</p>
    </div>
  )
}

function BarraOrcamento({ label, brl, pct }: { label: string; brl: number; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-500">{fmt(brl, 'BRL')}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: 'linear-gradient(90deg, #14B8A6, #0284C7)' }} />
      </div>
    </div>
  )
}

function PontoLegenda({ cor, label }: { cor: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2 h-2 rounded-full" style={{ background: cor }} />
      <span className="text-slate-400 text-xs">{label}</span>
    </div>
  )
}

// ─── Tela: Kanban ─────────────────────────────────────────────────────────────

function QuadroVagas() {
  const [vagas, setVagas] = useState<Vaga[]>(VAGAS_INICIAIS)
  const [arrastando, setArrastando] = useState<string | null>(null)
  const sobreRef = useRef<ColunaKanban | null>(null)

  const handleDragStart = (id: string) => setArrastando(id)
  const handleDragEnd = () => {
    if (arrastando && sobreRef.current) {
      setVagas(prev => prev.map(v => v.id === arrastando ? { ...v, coluna: sobreRef.current! } : v))
    }
    setArrastando(null)
    sobreRef.current = null
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Quadro de Vagas</h1>
        <p className="text-slate-400 text-sm mt-1">Acompanhe suas candidaturas em empresas portuguesas de tecnologia</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {COLUNAS.map(col => {
          const colVagas = vagas.filter(v => v.coluna === col)
          return (
            <div
              key={col}
              className="flex-shrink-0 w-72 flex flex-col"
              onDragOver={e => { e.preventDefault(); sobreRef.current = col }}
            >
              <div className="flex items-center gap-2.5 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CORES_COLUNAS[col] }} />
                <h3 className="text-slate-200 text-sm font-semibold">{col}</h3>
                <span className="ml-auto text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{colVagas.length}</span>
              </div>

              <div className="flex-1 bg-slate-900/50 rounded-2xl p-3 space-y-3 border border-slate-800/60">
                {colVagas.map(vaga => (
                  <CartaoVaga
                    key={vaga.id}
                    vaga={vaga}
                    arrastando={arrastando === vaga.id}
                    onDragStart={() => handleDragStart(vaga.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {colVagas.length === 0 && (
                  <div className="flex items-center justify-center h-20 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-xl">
                    Arraste até aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-slate-600 text-xs mt-3 text-center md:text-left">Arraste os cartões entre colunas para atualizar o status</p>
    </div>
  )
}

function CartaoVaga({ vaga, arrastando, onDragStart, onDragEnd }: {
  vaga: Vaga; arrastando: boolean; onDragStart: () => void; onDragEnd: () => void
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all duration-150 hover:border-slate-600 ${arrastando ? 'opacity-40 scale-95' : ''}`}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: vaga.cor }}>
          {vaga.inicial}
        </div>
        <div className="min-w-0">
          <p className="text-slate-100 text-sm font-semibold leading-tight truncate">{vaga.empresa}</p>
          <p className="text-slate-400 text-xs truncate">{vaga.cargo}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-300 text-sm font-medium">{fmtK(vaga.salarioMin)}–{fmtK(vaga.salarioMax)}</span>
        <span className="text-slate-500 text-xs">/ ano</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {vaga.patrocinioVisto && (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-medium">
            ✦ Patrocina Visto
          </span>
        )}
        <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-slate-700 text-slate-400">
          Portugal
        </span>
      </div>
    </div>
  )
}

// ─── Tela: Burocracia ─────────────────────────────────────────────────────────

function RastreadorBurocracia() {
  const [docs, setDocs] = useState<Documento[]>(DOCUMENTOS)

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

  const docsResolvidos = docs.map(d => {
    const bloqueado = d.bloqueadoPor?.some(bid => {
      const bloqueador = docs.find(dd => dd.id === bid)
      return bloqueador && bloqueador.status !== 'Concluído'
    })
    return { ...d, statusResolvido: (bloqueado ? 'Bloqueado' : d.status) as StatusDoc }
  })

  const concluidos = docsResolvidos.filter(d => d.statusResolvido === 'Concluído').length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Rastreador de Burocracia</h1>
          <p className="text-slate-400 text-sm mt-1">Status dos documentos — clique para avançar (se desbloqueado)</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-slate-100">{concluidos}<span className="text-slate-600 text-lg">/{docs.length}</span></p>
          <p className="text-slate-500 text-xs">documentos completos</p>
        </div>
      </div>

      <div className="mb-6 h-1.5 rounded-full bg-slate-800">
        <div className="h-full rounded-full transition-all duration-500" style={{
          width: `${(concluidos / docs.length) * 100}%`,
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
              className={`bg-slate-900 border rounded-2xl p-5 transition-all duration-150 ${
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
                    <p className={`text-sm font-semibold ${doc.statusResolvido === 'Concluído' ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                      {doc.nome}
                    </p>
                    <BadgeStatus status={doc.statusResolvido} />
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
    </div>
  )
}

// ─── Tela: Finanças ───────────────────────────────────────────────────────────

function GerenciadorFinanceiro() {
  const [moeda, setMoeda] = useState<'BRL' | 'EUR'>('BRL')

  const receitas = ITENS_FINANCEIROS.filter(i => i.tipo === 'receita')
  const despesas = ITENS_FINANCEIROS.filter(i => i.tipo === 'despesa')

  const totalReceita = receitas.reduce((s, i) => s + (moeda === 'BRL' ? i.valorBRL : i.valorEUR), 0)
  const totalDespesa = despesas.reduce((s, i) => s + (moeda === 'BRL' ? i.valorBRL : i.valorEUR), 0)
  const saldo = totalReceita - totalDespesa

  const CORES_CAT: Record<string, string> = {
    Rescisão: '#14B8A6', Salário: '#0284C7', Poupança: '#8B5CF6',
    Viagem: '#F59E0B', Moradia: '#EC4899', Logística: '#F97316',
    Jurídico: '#EF4444', Reserva: '#64748B',
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Gerenciador Financeiro</h1>
          <p className="text-slate-400 text-sm mt-1">Receitas e despesas para sua mudança para Portugal</p>
        </div>
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
              <LinhaFinanceira key={item.id} item={item} moeda={moeda} corCat={CORES_CAT[item.categoria] ?? '#475569'} />
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
              <LinhaFinanceira key={item.id} item={item} moeda={moeda} corCat={CORES_CAT[item.categoria] ?? '#475569'} />
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
          <p className="text-slate-500 text-xs mt-0.5">≈ {Math.round(saldo / (moeda === 'BRL' ? 6500 : 1065))} meses de custo de vida</p>
        </div>
      </div>
    </div>
  )
}

function CardResumo({ label, valor, moeda, cor, ehSaldo = false }: {
  label: string; valor: number; moeda: 'BRL' | 'EUR'; cor: string; ehSaldo?: boolean
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="w-6 h-0.5 rounded-full mb-2.5" style={{ background: cor }} />
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="text-slate-100 font-bold text-base md:text-lg leading-tight" style={{ color: ehSaldo ? cor : undefined }}>
        {fmt(valor, moeda)}
      </p>
    </div>
  )
}

function LinhaFinanceira({ item, moeda, corCat }: {
  item: ItemFinanceiro; moeda: 'BRL' | 'EUR'; corCat: string
}) {
  const valor = moeda === 'BRL' ? item.valorBRL : item.valorEUR
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <div className="w-1 h-8 rounded-full shrink-0" style={{ background: corCat }} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-200 text-sm font-medium truncate">{item.label}</p>
        <p className="text-slate-500 text-xs truncate">{item.subLabel}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`text-sm font-semibold ${item.tipo === 'receita' ? 'text-teal-400' : 'text-slate-300'}`}>
          {item.tipo === 'receita' ? '+' : '−'}{fmt(valor, moeda)}
        </p>
        <p className="text-slate-600 text-xs">{item.categoria}</p>
      </div>
    </div>
  )
}

// ─── Tela: Visto D3 ───────────────────────────────────────────────────────────

function RastreadorVisto() {
  const [etapas, setEtapas] = useState<EtapaVisto[]>(ETAPAS_VISTO)
  const [docsConsulado, setDocsConsulado] = useState(DOCS_CONSULADO)

  const concluidas = etapas.filter(e => e.status === 'Concluído').length
  const pct = concluidas / etapas.length

  const avancarEtapa = (id: string) => {
    setEtapas(prev => {
      const idx = prev.findIndex(e => e.id === id)
      if (idx === -1) return prev
      const anteriorPendente = prev.slice(0, idx).some(e => e.status !== 'Concluído')
      if (anteriorPendente) return prev
      const ordem: StatusEtapa[] = ['Pendente', 'Em Andamento', 'Concluído']
      const proximo = ordem[(ordem.indexOf(prev[idx].status) + 1) % ordem.length]
      return prev.map((e, i) => i === idx ? { ...e, status: proximo } : e)
    })
  }

  const toggleDoc = (i: number) => {
    setDocsConsulado(prev => prev.map((d, idx) => idx === i ? { ...d, ok: !d.ok } : d))
  }

  const docsOk = docsConsulado.filter(d => d.ok).length

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Acompanhamento do Visto D3</h1>
        <p className="text-slate-400 text-sm mt-1">Visto de Trabalho Qualificado · Consulado Geral de Portugal em São Paulo</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <InfoCardVisto label="Tipo de Visto" valor="D3 — Qualificado" icone="🛂" />
        <InfoCardVisto label="Consulado" valor="São Paulo · SP" icone="🏛️" />
        <InfoCardVisto label="Agendamento" valor="28 Ago, 2025" icone="📅" />
        <InfoCardVisto label="Prazo Estimado" valor="Nov — Dez 2025" icone="⏳" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Etapas do Processo</h2>
            <span className="text-xs text-slate-500">{concluidas}/{etapas.length} concluídas</span>
          </div>

          {/* Barra geral */}
          <div className="mb-5 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-500" style={{
              width: `${pct * 100}%`,
              background: 'linear-gradient(90deg, #F59E0B, #14B8A6)',
            }} />
          </div>

          {/* Linha do tempo */}
          <div className="relative">
            {etapas.map((etapa, idx) => {
              const ehUltima = idx === etapas.length - 1
              return (
                <div key={etapa.id} className="flex gap-4">
                  {/* Conector vertical */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={() => avancarEtapa(etapa.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 z-10"
                      style={{
                        background:
                          etapa.status === 'Concluído'    ? '#10B981' :
                          etapa.status === 'Em Andamento' ? '#F59E0B' : '#1E293B',
                        border: '2px solid',
                        borderColor:
                          etapa.status === 'Concluído'    ? '#10B981' :
                          etapa.status === 'Em Andamento' ? '#F59E0B' : '#334155',
                      }}
                    >
                      {etapa.status === 'Concluído'    && <span className="text-white text-xs">✓</span>}
                      {etapa.status === 'Em Andamento' && <span className="text-white text-xs font-bold">→</span>}
                      {etapa.status === 'Pendente'     && <span className="text-slate-600 text-xs">{idx + 1}</span>}
                    </button>
                    {!ehUltima && (
                      <div className="w-0.5 flex-1 my-1" style={{
                        background: etapa.status === 'Concluído' ? '#10B981' : '#1E293B',
                        minHeight: '24px',
                      }} />
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className={`flex-1 pb-5 ${ehUltima ? 'pb-0' : ''}`}>
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <p className={`text-sm font-semibold ${etapa.status === 'Concluído' ? 'text-slate-500' : 'text-slate-100'}`}>
                        {etapa.titulo}
                      </p>
                      <BadgeEtapa status={etapa.status} />
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed">{etapa.descricao}</p>
                    {etapa.data && (
                      <p className="text-slate-600 text-xs mt-1.5 flex items-center gap-1">
                        <span>📅</span> {etapa.data}
                      </p>
                    )}
                    {etapa.obs && (
                      <div className="mt-2 p-2.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <p className="text-slate-400 text-xs">{etapa.obs}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <p className="text-slate-600 text-xs mt-2">Clique nos círculos para avançar as etapas em ordem</p>
        </div>

        {/* Checklist do Consulado */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Pasta Consular</h2>
            <span className="text-xs text-slate-500">{docsOk}/{docsConsulado.length} prontos</span>
          </div>

          {/* Progresso */}
          <div className="mb-4 h-1.5 rounded-full bg-slate-800">
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${(docsOk / docsConsulado.length) * 100}%`,
              background: 'linear-gradient(90deg, #0284C7, #14B8A6)',
            }} />
          </div>

          <div className="space-y-2">
            {docsConsulado.map((doc, i) => (
              <button
                key={i}
                onClick={() => toggleDoc(i)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
                  doc.ok
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-150 ${
                  doc.ok ? 'bg-emerald-500' : 'bg-slate-700 border border-slate-600'
                }`}>
                  {doc.ok && <span className="text-white text-xs">✓</span>}
                </div>
                <p className={`text-xs leading-relaxed ${doc.ok ? 'text-slate-500 line-through' : 'text-slate-300'}`}>
                  {doc.label}
                </p>
              </button>
            ))}
          </div>

          {/* Alerta */}
          <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <p className="text-amber-400 text-xs font-semibold mb-1">⚠ Atenção</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Leve sempre originais + 2 cópias de cada documento. O consulado não devolve documentos originais no ato.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCardVisto({ label, valor, icone }: { label: string; valor: string; icone: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <span className="text-xl mb-2 block">{icone}</span>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-slate-200 text-sm font-semibold leading-tight">{valor}</p>
    </div>
  )
}

// ─── Ícones SVG ───────────────────────────────────────────────────────────────

function IconeGrade({ size, ativo }: { size: number; ativo: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="9" y="1" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="1" y="9" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="9" y="9" width="6" height="6" rx="1.5" fill={ativo ? '#14B8A6' : 'currentColor'} fillOpacity={ativo ? 0.5 : 0.3} />
    </svg>
  )
}

function IconeKanban({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="4" height="10" rx="1.5" fill={c} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="6" y="1" width="4" height="7" rx="1.5" fill={c} fillOpacity={ativo ? 1 : 0.6} />
      <rect x="11" y="1" width="4" height="13" rx="1.5" fill={c} fillOpacity={ativo ? 0.5 : 0.3} />
    </svg>
  )
}

function IconeArquivo({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 2C3 1.45 3.45 1 4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2z" fill={c} fillOpacity={ativo ? 0.2 : 0.15} />
      <path d="M9 1v3.5A.5.5 0 0 0 9.5 5H13" stroke={c} strokeOpacity={ativo ? 1 : 0.6} strokeWidth="1.2" />
      <path d="M5 8h6M5 11h4" stroke={c} strokeOpacity={ativo ? 1 : 0.6} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IconeCarteira({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  const op = ativo ? 1 : 0.6
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="4" width="14" height="10" rx="2" fill={c} fillOpacity={ativo ? 0.15 : 0.1} stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M1 7h14" stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M4 2.5A1.5 1.5 0 0 1 5.5 1h5A1.5 1.5 0 0 1 12 2.5V4H4V2.5z" fill={c} fillOpacity={op} />
      <circle cx="11.5" cy="11" r="1.5" fill={c} fillOpacity={op} />
    </svg>
  )
}

function IconePassaporte({ size, ativo }: { size: number; ativo: boolean }) {
  const c = ativo ? '#14B8A6' : 'currentColor'
  const op = ativo ? 1 : 0.6
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="1" width="12" height="14" rx="2" fill={c} fillOpacity={ativo ? 0.15 : 0.1} stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <circle cx="8" cy="7" r="2.5" stroke={c} strokeOpacity={op} strokeWidth="1.2" />
      <path d="M5 12h6M5.5 10h5" stroke={c} strokeOpacity={ativo ? 0.6 : 0.3} strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function IconeCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M5 9l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconeGirar() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="#334155" strokeWidth="2" />
      <path d="M9 3a6 6 0 0 1 6 6" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function IconeCadeado() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="7" width="10" height="8" rx="2" fill="#EF4444" fillOpacity="0.3" stroke="#EF4444" strokeWidth="1.2" />
      <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1" fill="#EF4444" />
    </svg>
  )
}

function IconeRelogio() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="#64748B" strokeWidth="1.2" />
      <path d="M8 5v3.5l2 2" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Raiz ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>('overview')

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar ativa={view} onNav={setView} />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {view === 'overview'   && <PainelResumo />}
        {view === 'kanban'     && <QuadroVagas />}
        {view === 'documents'  && <RastreadorBurocracia />}
        {view === 'finance'    && <GerenciadorFinanceiro />}
        {view === 'visto'      && <RastreadorVisto />}
      </main>
    </div>
  )
}
