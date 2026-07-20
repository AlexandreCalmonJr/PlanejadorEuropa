// ─── Anexos de Documentos ──────────────────────────────────────────────────
export interface AnexoDocumento {
  id: string
  nome: string
  tamanho?: string
  tipo?: string
  url: string
  dataUpload: string
}

// ─── Views ────────────────────────────────────────────────────────────────────
export type View = 'overview' | 'kanban' | 'documents' | 'finance' | 'visto' | 'educacao' | 'logistica' | 'voos'

// ─── Voos & Passagens Aereas ──────────────────────────────────────────────────
export interface Voo {
  id: string
  ciaAerea: string
  origem: string
  destino: string
  dataPartida: string
  horaPartida?: string
  dataChegada?: string
  horaChegada?: string
  tipoVoo: 'Somente Ida' | 'Ida e Volta'
  conexoes: 'Direto' | '1 Parada' | '2+ Paradas'
  cidadesConexao?: string
  valorBRL: number
  valorEUR: number
  bagagemMao: boolean
  bagagensDespachadas: number
  codigoReserva?: string
  observacoes?: string
  anexos?: AnexoDocumento[]
}

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
  descricao?: string
  requisitos?: string
  linkVaga?: string
  contato?: string
  observacoes?: string
  responsavel?: string
  anexos?: AnexoDocumento[]
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
  requisitosEntrada?: string
  prazoInscricao?: string
  linkSite?: string
  responsavel?: string
  anexos?: AnexoDocumento[]
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
  observacoes?: string
  anexos?: AnexoDocumento[]
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
  banco?: string
  comprovanteEntrada?: boolean
  anexos?: AnexoDocumento[]
}

// ─── Visto & Múltiplos Vistos ───────────────────────────────────────────
export type StatusEtapa = 'Concluído' | 'Em Andamento' | 'Pendente'

export type StatusConsularVisto =
  | 'Documentação Pronta'
  | 'Enviado para VFS'
  | 'VFS Enviado para Embaixada'
  | 'Chegou na Embaixada'
  | 'Embaixada Analisando'
  | 'Exigência / Correção'
  | 'Embaixada Enviando Passaporte'
  | 'Visto Concluído'

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

export type TipoVistoId = 'pt-d3' | 'pt-d8' | 'pt-procura' | 'pt-d4' | 'es-estudante'

export interface ConfigVisto {
  id: TipoVistoId
  titulo: string
  codigo: string
  pais: PaisDestino
  descricao: string
  consulado: string
  agendamentoEstimado: string
  prazoEstimado: string
  requisitosChave: string[]
  docsConsulado: DocConsulado[]
  etapas: EtapaVisto[]
}

// ─── Logística ────────────────────────────────────────────────────────────────
export interface TarefaLogistica {
  id: string
  titulo: string
  descricao: string
  responsavel: string
  status: StatusDoc
  dataConclusao?: string
  observacoes?: string
  anexos?: AnexoDocumento[]
}

// ─── Prazos ───────────────────────────────────────────────────────────────────
export interface Prazo {
  label: string
  data: string
  urgencia: 'alta' | 'media' | 'baixa'
}
