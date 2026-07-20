import type {
  Vaga,
  Faculdade,
  Documento,
  ItemFinanceiro,
  EtapaVisto,
  DocConsulado,
  TarefaLogistica,
  Prazo,
  ColunaKanban,
  ColunaFaculdade,
} from './types'

// ─── Vagas ────────────────────────────────────────────────────────────────────

export const VAGAS_INICIAIS: Vaga[] = [
  { id: 'j1', empresa: 'Critical TechWorks', cargo: 'Desenvolvedor Full Stack', salarioMin: 35000, salarioMax: 45000, patrocinioVisto: true, coluna: 'Candidatado', inicial: 'C', cor: '#14B8A6', cidade: 'Coimbra', modelo: 'Híbrido', stack: ['React', 'Node.js', 'Python'] },
  { id: 'j2', empresa: 'WIT Software', cargo: 'Engenheiro Mobile (Flutter)', salarioMin: 30000, salarioMax: 40000, patrocinioVisto: true, coluna: 'Candidatado', inicial: 'W', cor: '#8B5CF6', cidade: 'Coimbra', modelo: 'Presencial', stack: ['Flutter', 'Dart'] },
  { id: 'j3', empresa: 'Feedzai', cargo: 'Backend Developer', salarioMin: 45000, salarioMax: 60000, patrocinioVisto: true, coluna: 'Triagem RH', inicial: 'F', cor: '#0284C7', cidade: 'Coimbra', modelo: 'Híbrido', stack: ['Python', 'Java', 'AWS'] },
  { id: 'j4', empresa: 'Celfocus', cargo: 'Desenvolvedor React Sênior', salarioMin: 40000, salarioMax: 55000, patrocinioVisto: false, coluna: 'Triagem RH', inicial: 'C', cor: '#F97316', cidade: 'Porto', modelo: 'Remoto', stack: ['React', 'TypeScript', 'Node.js'] },
  { id: 'j5', empresa: 'Talkdesk', cargo: 'Software Engineer II', salarioMin: 50000, salarioMax: 70000, patrocinioVisto: true, coluna: 'Entrevista Técnica', inicial: 'T', cor: '#EC4899', cidade: 'Coimbra', modelo: 'Híbrido', stack: ['Node.js', 'React', 'PostgreSQL'] },
  { id: 'j6', empresa: 'Unbabel', cargo: 'Full Stack Developer', salarioMin: 42000, salarioMax: 55000, patrocinioVisto: true, coluna: 'Entrevista Técnica', inicial: 'U', cor: '#10B981', cidade: 'Lisboa', modelo: 'Remoto', stack: ['Python', 'React', 'Django'] },
  { id: 'j7', empresa: 'OutSystems', cargo: 'Engenheiro Principal', salarioMin: 65000, salarioMax: 85000, patrocinioVisto: true, coluna: 'Oferta', inicial: 'O', cor: '#E11D48', cidade: 'Lisboa', modelo: 'Híbrido', stack: ['React', 'Node.js', '.NET'] },
]

// ─── Faculdades ───────────────────────────────────────────────────────────────

export const FACULDADES_INICIAIS: Faculdade[] = [
  // Portugal — Coimbra
  {
    id: 'f1', instituicao: 'Universidade de Coimbra (UC)', curso: 'Engenharia Informática',
    tipoCurso: 'Licenciatura', area: 'Tecnologia', cidade: 'Coimbra', pais: 'PT',
    taxaCandidaturaEur: 50, matriculaEur: 20, propinaAnualEur: 7000,
    parcelamento: 10, aceitaEnem: true, aceitaDiplomaBr: false, bolsaCplp: false,
    coluna: 'Pesquisando', cor: '#0284C7',
  },
  {
    id: 'f2', instituicao: 'Universidade de Coimbra (UC)', curso: 'Mestrado em Eng. Informática',
    tipoCurso: 'Mestrado', area: 'Tecnologia', cidade: 'Coimbra', pais: 'PT',
    taxaCandidaturaEur: 50, matriculaEur: 20, propinaAnualEur: 7000,
    parcelamento: 10, aceitaEnem: false, aceitaDiplomaBr: true, bolsaCplp: false,
    coluna: 'Pesquisando', cor: '#14B8A6',
  },
  {
    id: 'f3', instituicao: 'IPC — ISEC', curso: 'Eng. Informática e Computadores',
    tipoCurso: 'Licenciatura', area: 'Tecnologia', cidade: 'Coimbra', pais: 'PT',
    taxaCandidaturaEur: 30, matriculaEur: 25, propinaAnualEur: 3000,
    parcelamento: 12, aceitaEnem: true, aceitaDiplomaBr: false, bolsaCplp: true,
    coluna: 'Candidatura', cor: '#8B5CF6',
  },
  {
    id: 'f4', instituicao: 'IPC — ISEC', curso: 'Desenvolvimento de Software',
    tipoCurso: 'Mestrado', area: 'Tecnologia', cidade: 'Coimbra', pais: 'PT',
    taxaCandidaturaEur: 30, matriculaEur: 25, propinaAnualEur: 3000,
    parcelamento: 12, aceitaEnem: false, aceitaDiplomaBr: true, bolsaCplp: true,
    coluna: 'Pesquisando', cor: '#F59E0B',
  },
  {
    id: 'f5', instituicao: 'IPC — ISCAC', curso: 'Gestão Empresarial',
    tipoCurso: 'Mestrado', area: 'Gestão / Logística', cidade: 'Coimbra', pais: 'PT',
    taxaCandidaturaEur: 30, matriculaEur: 25, propinaAnualEur: 2500,
    parcelamento: 12, aceitaEnem: false, aceitaDiplomaBr: true, bolsaCplp: true,
    coluna: 'Pesquisando', cor: '#10B981',
  },
  // Espanha — Plano B
  {
    id: 'f6', instituicao: 'Universidad de Salamanca', curso: 'Ing. Informática',
    tipoCurso: 'Grado', area: 'Tecnologia', cidade: 'Salamanca', pais: 'ES',
    taxaCandidaturaEur: 70, matriculaEur: 0, propinaAnualEur: 1500,
    aceitaEnem: false, aceitaDiplomaBr: false, bolsaCplp: false,
    coluna: 'Pesquisando', cor: '#EF4444',
    observacao: 'Requer homologação UNEDasiss',
  },
  {
    id: 'f7', instituicao: 'Universidad de Sevilla', curso: 'Ing. Informática',
    tipoCurso: 'Grado', area: 'Tecnologia', cidade: 'Sevilha', pais: 'ES',
    taxaCandidaturaEur: 60, matriculaEur: 0, propinaAnualEur: 1200,
    aceitaEnem: false, aceitaDiplomaBr: false, bolsaCplp: false,
    coluna: 'Pesquisando', cor: '#F97316',
    observacao: 'Andaluzia — custos mais baixos',
  },
  {
    id: 'f8', instituicao: 'Universidad Complutense', curso: 'Ing. del Software',
    tipoCurso: 'Grado', area: 'Tecnologia', cidade: 'Madrid', pais: 'ES',
    taxaCandidaturaEur: 80, matriculaEur: 0, propinaAnualEur: 4500,
    aceitaEnem: false, aceitaDiplomaBr: false, bolsaCplp: false,
    coluna: 'Pesquisando', cor: '#EC4899',
    observacao: 'Custo mais elevado — região de Madrid',
  },
  {
    id: 'f9', instituicao: 'Universidad de Valencia', curso: 'Máster en Ing. Informática',
    tipoCurso: 'Máster', area: 'Tecnologia', cidade: 'Valência', pais: 'ES',
    taxaCandidaturaEur: 75, matriculaEur: 0, propinaAnualEur: 2800,
    aceitaEnem: false, aceitaDiplomaBr: true, bolsaCplp: false,
    coluna: 'Pesquisando', cor: '#6366F1',
    observacao: 'Homologação de diploma obrigatória',
  },
]

// ─── Documentos ───────────────────────────────────────────────────────────────

export const DOCUMENTOS_INICIAIS: Documento[] = [
  // Portugal
  { id: 'd1', nome: 'Passaportes (Titular + Dependente)', descricao: 'Polícia Federal · Válido por 10 anos', status: 'Concluído', pais: 'AMBOS' },
  { id: 'd2', nome: 'Apostila de Haia — Certidão de Casamento', descricao: 'Cartório · Apostilamento no padrão internacional', status: 'Concluído', pais: 'AMBOS' },
  { id: 'd3', nome: 'Apostila de Haia — Diplomas', descricao: 'Cartório · Graduação em Logística apostilada', status: 'Em Andamento', pais: 'AMBOS' },
  { id: 'd4', nome: 'Certidão de Antecedentes Criminais', descricao: 'Polícia Federal + Polícia Civil BA · Apostilada', status: 'Em Andamento', pais: 'AMBOS' },
  { id: 'd5', nome: 'PB4 / CDAM (Seguro Saúde)', descricao: 'Ministério da Saúde · Acordo bilateral BR-PT · Substitui seguro viagem', status: 'Pendente', bloqueadoPor: ['d4'], pais: 'PT' },
  { id: 'd6', nome: 'NIF (Número de Identificação Fiscal)', descricao: 'Finanças de Portugal · Via Representante Fiscal (Mãe em Coimbra)', status: 'Em Andamento', pais: 'PT' },
  { id: 'd7', nome: 'Carta Convite / Termo de Responsabilidade', descricao: 'Emitido pela Mãe em Coimbra · Registrado em notário português', status: 'Pendente', pais: 'PT' },
  { id: 'd8', nome: 'NISS (Segurança Social)', descricao: 'Segurança Social Portugal · Necessário para contrato de trabalho', status: 'Pendente', bloqueadoPor: ['d6'], pais: 'PT' },
  { id: 'd9', nome: 'Visto D3 / Procura de Trabalho', descricao: 'Consulado de Portugal · Pedido principal do visto', status: 'Pendente', bloqueadoPor: ['d4', 'd5', 'd7'], pais: 'PT' },
  // Espanha
  { id: 'd10', nome: 'Credencial UNEDasiss', descricao: 'Homologação obrigatória de notas brasileiras para o sistema espanhol', status: 'Pendente', pais: 'ES' },
  { id: 'd11', nome: 'NIE (Número de Identidad de Extranjero)', descricao: 'Identificação fiscal de estrangeiro na Espanha', status: 'Pendente', pais: 'ES' },
  { id: 'd12', nome: 'Empadronamiento', descricao: 'Registro de residência no ayuntamiento local', status: 'Pendente', bloqueadoPor: ['d11'], pais: 'ES' },
  { id: 'd13', nome: 'Seguro Médico Privado', descricao: 'Obrigatório para visto de estudante na Espanha (mín. €30.000 cobertura)', status: 'Pendente', pais: 'ES' },
]

// ─── Finanças ─────────────────────────────────────────────────────────────────

export const ITENS_FINANCEIROS_INICIAIS: ItemFinanceiro[] = [
  // Receitas
  { id: 'fin1', label: 'Reserva Pessoal / Poupança', subLabel: 'Conta poupança disponível', valorBRL: 30000, valorEUR: 4878, tipo: 'receita', categoria: 'Poupança' },
  { id: 'fin2', label: 'Acerto Rescisório (8 anos)', subLabel: 'FGTS + verbas rescisórias', valorBRL: 25000, valorEUR: 4065, tipo: 'receita', categoria: 'Rescisão' },
  // Despesas — Pré-viagem
  { id: 'fin3', label: 'Passagens Aéreas SSA → LIS (Casal)', subLabel: '2 passagens · Econômica · Salvador → Lisboa', valorBRL: 9000, valorEUR: 1463, tipo: 'despesa', categoria: 'Viagem' },
  { id: 'fin4', label: 'Taxas Consulares (VFS Global)', subLabel: 'Visto D3 + taxas de documentação', valorBRL: 1200, valorEUR: 195, tipo: 'despesa', categoria: 'Jurídico' },
  { id: 'fin5', label: 'Documentação e Cartórios', subLabel: 'Apostilamentos + traduções juramentadas', valorBRL: 800, valorEUR: 130, tipo: 'despesa', categoria: 'Jurídico' },
  // Despesas — Chegada Coimbra
  { id: 'fin6', label: 'Alimentação Mensal (Casal)', subLabel: 'Supermercado + refeições · Coimbra', valorBRL: 2460, valorEUR: 400, tipo: 'despesa', categoria: 'Custo de Vida', recorrente: true },
  { id: 'fin7', label: 'Transporte / Passes (Casal)', subLabel: 'Passes mensais SMTUC · Coimbra', valorBRL: 369, valorEUR: 60, tipo: 'despesa', categoria: 'Custo de Vida', recorrente: true },
  { id: 'fin8', label: 'Aluguel / Caução', subLabel: 'Custo zerado — hospedagem familiar (Mãe)', valorBRL: 0, valorEUR: 0, tipo: 'despesa', categoria: 'Moradia' },
  { id: 'fin9', label: 'Fundo de Emergência', subLabel: 'Reserva para 3 meses em Coimbra', valorBRL: 12300, valorEUR: 2000, tipo: 'despesa', categoria: 'Reserva' },
  { id: 'fin10', label: 'Comprovação de Subsistência (Visto)', subLabel: 'Titular (100% SM) + Cônjuge (50% SM) — precisa estar disponível', valorBRL: 90774, valorEUR: 14760, tipo: 'despesa', categoria: 'Comprovação' },
]

// ─── Prazos ───────────────────────────────────────────────────────────────────

export const PRAZOS_INICIAIS: Prazo[] = [
  { label: 'Apostila dos Diplomas', data: '15 Ago, 2026', urgencia: 'alta' },
  { label: 'NIF via Representante Fiscal (Mãe)', data: '22 Ago, 2026', urgencia: 'media' },
  { label: 'Prazo de Pedido do Visto D3', data: '30 Set, 2026', urgencia: 'baixa' },
  { label: 'Homologação UNEDasiss (Plano B)', data: '15 Out, 2026', urgencia: 'baixa' },
]

// ─── Etapas do Visto ──────────────────────────────────────────────────────────

export const ETAPAS_VISTO_INICIAIS: EtapaVisto[] = [
  {
    id: 'v1', titulo: 'Reunião de Documentos',
    descricao: 'Coleta e apostilamento de todos os documentos obrigatórios para o pedido de visto.',
    status: 'Concluído', data: 'Jul 2026',
    obs: 'Passaporte e Certidão de Casamento apostilados.',
  },
  {
    id: 'v2', titulo: 'Agendamento Consular',
    descricao: 'Marcação de horário no Consulado de Portugal em Salvador/Recife via VFS Global.',
    status: 'Em Andamento', data: '28 Ago, 2026',
    obs: 'Protocolo VFS: BR-SSA-2026-XXXXX · Comparecer às 09h30.',
  },
  {
    id: 'v3', titulo: 'Entrega de Documentos',
    descricao: 'Entrega presencial da pasta completa no consulado com todos os originais e cópias.',
    status: 'Pendente', data: 'Set 2026',
  },
  {
    id: 'v4', titulo: 'Análise pelo Consulado',
    descricao: 'Período de análise pelo Consulado. O prazo regulamentar é de 60 dias úteis.',
    status: 'Pendente', data: 'Set — Nov 2026',
    obs: 'Possível consulta de status via portal SEF/AIMA.',
  },
  {
    id: 'v5', titulo: 'Decisão do Consulado',
    descricao: 'Notificação por e-mail e/ou carta com o resultado: aprovação, recusa ou pedido de esclarecimentos.',
    status: 'Pendente', data: 'Nov 2026',
  },
  {
    id: 'v6', titulo: 'Retirada do Visto',
    descricao: 'Retirada do passaporte com visto carimbado no consulado ou via Sedex.',
    status: 'Pendente', data: 'Nov — Dez 2026',
  },
]

export const DOCS_CONSULADO_INICIAIS: DocConsulado[] = [
  { label: 'Formulário de pedido de visto (impresso e assinado)', ok: true },
  { label: 'Passaporte válido + 2 cópias', ok: true },
  { label: '2 fotos 3×4 recentes (fundo branco)', ok: true },
  { label: 'Certidão de antecedentes criminais apostilada', ok: false },
  { label: 'Autorização PB4 original', ok: false },
  { label: 'Contrato de trabalho / promessa de contrato em Portugal', ok: false },
  { label: 'Comprovante de meios de subsistência (extrato bancário)', ok: true },
  { label: 'Carta Convite / Termo de Responsabilidade (Mãe)', ok: false },
  { label: 'Seguro de viagem/saúde com cobertura mínima de €30.000', ok: false },
]

// ─── Logística ────────────────────────────────────────────────────────────────

export const TAREFAS_LOGISTICA_INICIAIS: TarefaLogistica[] = [
  { id: 'log1', titulo: 'Emissão da Carta Convite / Termo de Responsabilidade', descricao: 'Documento registrado em cartório/notário português atestando alojamento do casal.', responsavel: 'ANFITRIAO', status: 'Pendente' },
  { id: 'log2', titulo: 'Representante Fiscal para NIF', descricao: 'Ir presencialmente às Finanças em Coimbra ou via Portal das Finanças.', responsavel: 'ANFITRIAO', status: 'Em Andamento' },
  { id: 'log3', titulo: 'Atestado de Morada (Junta de Freguesia)', descricao: 'Comprovar residência em Coimbra junto à Junta de Freguesia local.', responsavel: 'ANFITRIAO', status: 'Pendente' },
  { id: 'log4', titulo: 'Solicitar PB4 / CDAM no Brasil', descricao: 'Portal do Ministério da Saúde · Também necessário para a Andressa.', responsavel: 'TITULAR', status: 'Pendente' },
  { id: 'log5', titulo: 'Abrir Conta Bancária (Millennium BCP)', descricao: 'Conta para não-residente · Necessita NIF emitido.', responsavel: 'TITULAR', status: 'Pendente' },
  { id: 'log6', titulo: 'Registrar NISS (Segurança Social)', descricao: 'Necessário para contrato de trabalho · Depende do NIF.', responsavel: 'TITULAR', status: 'Pendente' },
  { id: 'log7', titulo: 'Reagrupamento Familiar (Andressa)', descricao: 'Entrada no processo de AR para cônjuge com permissão de trabalho.', responsavel: 'AMBOS', status: 'Pendente' },
]

// ─── Constantes de Layout ─────────────────────────────────────────────────────

export const COLUNAS_KANBAN: ColunaKanban[] = ['Candidatado', 'Triagem RH', 'Entrevista Técnica', 'Oferta']

export const CORES_COLUNAS_KANBAN: Record<ColunaKanban, string> = {
  'Candidatado': '#0284C7',
  'Triagem RH': '#14B8A6',
  'Entrevista Técnica': '#8B5CF6',
  'Oferta': '#10B981',
}

export const COLUNAS_FACULDADE: ColunaFaculdade[] = ['Pesquisando', 'Candidatura', 'Aguardando', 'Aceito']

export const CORES_COLUNAS_FACULDADE: Record<ColunaFaculdade, string> = {
  'Pesquisando': '#0284C7',
  'Candidatura': '#F59E0B',
  'Aguardando': '#8B5CF6',
  'Aceito': '#10B981',
}

export const CORES_CATEGORIAS: Record<string, string> = {
  Rescisão: '#14B8A6',
  Poupança: '#8B5CF6',
  Viagem: '#F59E0B',
  Moradia: '#EC4899',
  'Custo de Vida': '#0284C7',
  Jurídico: '#EF4444',
  Reserva: '#64748B',
  Comprovação: '#F97316',
}
