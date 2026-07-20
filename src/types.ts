// ─── Views ────────────────────────────────────────────────────────────────────
export type View = 'overview' | 'kanban' | 'documents' | 'finance' | 'visto' | 'educacao' | 'logistica'

// ─── Kanban de Vagas ──────────────────────────────────────────────────────────
export type ColunaKanban = 'Candidatado' | 'Triagem RH' | 'Entrevista Técnica' | 'Oferta'

export interface Vaga {
  id: string
  empresa: string
  cargo: string
  salarioMin: number
  salarioMax: number
  patrocinioVisto: boolean
  coluna: ColunaKanban
  inicial: string
  cor: string
  cidade?: string
  modelo?: string
  stack?: string[]
}

// ─── Kanban de Faculdades ─────────────────────────────────────────────────────
export type ColunaFaculdade = 'Pesquisando' | 'Candidatura' | 'Aguardando' | 'Aceito'

export type PaisDestino = 'PT' | 'ES'

export interface Faculdade {
  id: string
  instituicao: string
  curso: string
  tipoCurso: 'Licenciatura' | 'Mestrado' | 'Grado' | 'Máster'
  area: string
  cidade: string
  pais: PaisDestino
  taxaCandidaturaEur: number
  matriculaEur: number
  propinaAnualEur: number
  parcelamento?: number
  aceitaEnem: boolean
  aceitaDiplomaBr: boolean
  bolsaCplp: boolean
  coluna: ColunaFaculdade
  cor: string
  observacao?: string
}

// ─── Documentos ───────────────────────────────────────────────────────────────
export type StatusDoc = 'Concluído' | 'Em Andamento' | 'Pendente' | 'Bloqueado'

export interface Documento {
  id: string
  nome: string
  descricao: string
  status: StatusDoc
  bloqueadoPor?: string[]
  pais?: PaisDestino | 'AMBOS'
}

// ─── Finanças ─────────────────────────────────────────────────────────────────
export interface ItemFinanceiro {
  id: string
  label: string
  subLabel: string
  valorBRL: number
  valorEUR: number
  tipo: 'receita' | 'despesa'
  categoria: string
  recorrente?: boolean
}

// ─── Visto ────────────────────────────────────────────────────────────────────
export type StatusEtapa = 'Concluído' | 'Em Andamento' | 'Pendente'

export interface EtapaVisto {
  id: string
  titulo: string
  descricao: string
  status: StatusEtapa
  data?: string
  obs?: string
}

export interface DocConsulado {
  label: string
  ok: boolean
}

// ─── Logística ────────────────────────────────────────────────────────────────
export type ResponsavelTarefa = 'ANFITRIAO' | 'TITULAR' | 'AMBOS'

export interface TarefaLogistica {
  id: string
  titulo: string
  descricao: string
  responsavel: ResponsavelTarefa
  status: StatusDoc
  dataConclusao?: string
}

// ─── Prazos ───────────────────────────────────────────────────────────────────
export interface Prazo {
  label: string
  data: string
  urgencia: 'alta' | 'media' | 'baixa'
}
