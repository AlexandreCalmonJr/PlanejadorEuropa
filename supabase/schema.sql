-- ==============================================================================
-- PLANEJADOR EUROPA — SCHEMA COMPLETO PARA SUPABASE
-- Execute este script no SQL Editor do seu projeto Supabase para criar a estrutura
-- das tabelas, políticas de acesso (RLS) e inserir os dados iniciais.
-- ==============================================================================

-- Habilita extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. TABELA: vagas
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vagas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  empresa TEXT NOT NULL,
  cargo TEXT NOT NULL,
  salario_min NUMERIC NOT NULL DEFAULT 0,
  salario_max NUMERIC NOT NULL DEFAULT 0,
  patrocinio_visto BOOLEAN NOT NULL DEFAULT false,
  coluna TEXT NOT NULL CHECK (coluna IN ('Candidatado', 'Triagem RH', 'Entrevista Técnica', 'Oferta')),
  inicial VARCHAR(5) NOT NULL,
  cor VARCHAR(20) NOT NULL DEFAULT '#14B8A6',
  cidade TEXT,
  modelo TEXT,
  stack TEXT[],
  observacoes TEXT,
  link_vaga TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. TABELA: faculdades
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faculdades (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  instituicao TEXT NOT NULL,
  curso TEXT NOT NULL,
  tipo_curso TEXT NOT NULL CHECK (tipo_curso IN ('Licenciatura', 'Mestrado', 'Grado', 'Máster')),
  area TEXT NOT NULL,
  cidade TEXT NOT NULL,
  pais VARCHAR(5) NOT NULL CHECK (pais IN ('PT', 'ES')),
  taxa_candidatura_eur NUMERIC NOT NULL DEFAULT 0,
  matricula_eur NUMERIC NOT NULL DEFAULT 0,
  propina_anual_eur NUMERIC NOT NULL DEFAULT 0,
  parcelamento INT DEFAULT 10,
  aceita_enem BOOLEAN NOT NULL DEFAULT false,
  aceita_diploma_br BOOLEAN NOT NULL DEFAULT false,
  bolsa_cplp BOOLEAN NOT NULL DEFAULT false,
  coluna TEXT NOT NULL CHECK (coluna IN ('Pesquisando', 'Candidatura', 'Aguardando', 'Aceito')),
  cor VARCHAR(20) NOT NULL DEFAULT '#0284C7',
  observacao TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. TABELA: documentos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.documentos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Concluído', 'Em Andamento', 'Pendente', 'Bloqueado')),
  bloqueado_por TEXT[],
  pais VARCHAR(10) CHECK (pais IN ('PT', 'ES', 'AMBOS')),
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. TABELA: itens_financeiros
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.itens_financeiros (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  sub_label TEXT NOT NULL,
  valor_brl NUMERIC NOT NULL DEFAULT 0,
  valor_eur NUMERIC NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  recorrente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. TABELA: etapas_visto
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.etapas_visto (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Concluído', 'Em Andamento', 'Pendente')),
  data TEXT,
  obs TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. TABELA: docs_consulado
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.docs_consulado (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  ok BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. TABELA: tarefas_logistica
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tarefas_logistica (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  responsavel TEXT NOT NULL CHECK (responsavel IN ('ANFITRIAO', 'TITULAR', 'AMBOS')),
  status TEXT NOT NULL CHECK (status IN ('Concluído', 'Em Andamento', 'Pendente', 'Bloqueado')),
  data_conclusao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. TABELA: prazos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prazos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  label TEXT NOT NULL,
  data TEXT NOT NULL,
  urgencia TEXT NOT NULL CHECK (urgencia IN ('alta', 'media', 'baixa')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & POLÍTICAS DE ACESSO
-- Permite leitura e escrita via Supabase Client (Anon/Authenticated)
-- ==============================================================================

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculdades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.etapas_visto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docs_consulado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_logistica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prazos ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (Anon e Autenticados)
CREATE POLICY "Permitir tudo em vagas" ON public.vagas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em faculdades" ON public.faculdades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em documentos" ON public.documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em itens_financeiros" ON public.itens_financeiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em etapas_visto" ON public.etapas_visto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em docs_consulado" ON public.docs_consulado FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em tarefas_logistica" ON public.tarefas_logistica FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em prazos" ON public.prazos FOR ALL USING (true) WITH CHECK (true);


-- ==============================================================================
-- DADOS INICIAIS (SEED DATA)
-- Preenche o banco de dados com os dados iniciais do Planejador Europa
-- ==============================================================================

-- 1. VAGAS
INSERT INTO public.vagas (id, empresa, cargo, salario_min, salario_max, patrocinio_visto, coluna, inicial, cor, cidade, modelo, stack) VALUES
('j1', 'Critical TechWorks', 'Desenvolvedor Full Stack', 35000, 45000, true, 'Candidatado', 'C', '#14B8A6', 'Coimbra', 'Híbrido', ARRAY['React', 'Node.js', 'Python']),
('j2', 'WIT Software', 'Engenheiro Mobile (Flutter)', 30000, 40000, true, 'Candidatado', 'W', '#8B5CF6', 'Coimbra', 'Presencial', ARRAY['Flutter', 'Dart']),
('j3', 'Feedzai', 'Backend Developer', 45000, 60000, true, 'Triagem RH', 'F', '#0284C7', 'Coimbra', 'Híbrido', ARRAY['Python', 'Java', 'AWS']),
('j4', 'Celfocus', 'Desenvolvedor React Sênior', 40000, 55000, false, 'Triagem RH', 'C', '#F97316', 'Porto', 'Remoto', ARRAY['React', 'TypeScript', 'Node.js']),
('j5', 'Talkdesk', 'Software Engineer II', 50000, 70000, true, 'Entrevista Técnica', 'T', '#EC4899', 'Coimbra', 'Híbrido', ARRAY['Node.js', 'React', 'PostgreSQL']),
('j6', 'Unbabel', 'Full Stack Developer', 42000, 55000, true, 'Entrevista Técnica', 'U', '#10B981', 'Lisboa', 'Remoto', ARRAY['Python', 'React', 'Django']),
('j7', 'OutSystems', 'Engenheiro Principal', 65000, 85000, true, 'Oferta', 'O', '#E11D48', 'Lisboa', 'Híbrido', ARRAY['React', 'Node.js', '.NET'])
ON CONFLICT (id) DO NOTHING;

-- 2. FACULDADES
INSERT INTO public.faculdades (id, instituicao, curso, tipo_curso, area, cidade, pais, taxa_candidatura_eur, matricula_eur, propina_anual_eur, parcelamento, aceita_enem, aceita_diploma_br, bolsa_cplp, coluna, cor, observacao) VALUES
('f1', 'Universidade de Coimbra (UC)', 'Engenharia Informática', 'Licenciatura', 'Tecnologia', 'Coimbra', 'PT', 50, 20, 7000, 10, true, false, false, 'Pesquisando', '#0284C7', NULL),
('f2', 'Universidade de Coimbra (UC)', 'Mestrado em Eng. Informática', 'Mestrado', 'Tecnologia', 'Coimbra', 'PT', 50, 20, 7000, 10, false, true, false, 'Pesquisando', '#14B8A6', NULL),
('f3', 'IPC — ISEC', 'Eng. Informática e Computadores', 'Licenciatura', 'Tecnologia', 'Coimbra', 'PT', 30, 25, 3000, 12, true, false, true, 'Candidatura', '#8B5CF6', NULL),
('f4', 'IPC — ISEC', 'Desenvolvimento de Software', 'Mestrado', 'Tecnologia', 'Coimbra', 'PT', 30, 25, 3000, 12, false, true, true, 'Pesquisando', '#F59E0B', NULL),
('f5', 'IPC — ISCAC', 'Gestão Empresarial', 'Mestrado', 'Gestão / Logística', 'Coimbra', 'PT', 30, 25, 2500, 12, false, true, true, 'Pesquisando', '#10B981', NULL),
('f6', 'Universidad de Salamanca', 'Ing. Informática', 'Grado', 'Tecnologia', 'Salamanca', 'ES', 70, 0, 1500, NULL, false, false, false, 'Pesquisando', '#EF4444', 'Requer homologação UNEDasiss'),
('f7', 'Universidad de Sevilla', 'Ing. Informática', 'Grado', 'Tecnologia', 'Sevilha', 'ES', 60, 0, 1200, NULL, false, false, false, 'Pesquisando', '#F97316', 'Andaluzia — custos mais baixos'),
('f8', 'Universidad Complutense', 'Ing. del Software', 'Grado', 'Tecnologia', 'Madrid', 'ES', 80, 0, 4500, NULL, false, false, false, 'Pesquisando', '#EC4899', 'Custo mais elevado — região de Madrid'),
('f9', 'Universidad de Valencia', 'Máster en Ing. Informática', 'Máster', 'Tecnologia', 'Valência', 'ES', 75, 0, 2800, NULL, false, true, false, 'Pesquisando', '#6366F1', 'Homologação de diploma obrigatória')
ON CONFLICT (id) DO NOTHING;

-- 3. DOCUMENTOS
INSERT INTO public.documentos (id, nome, descricao, status, bloqueado_por, pais) VALUES
('d1', 'Passaportes (Titular + Dependente)', 'Polícia Federal · Válido por 10 anos', 'Concluído', NULL, 'AMBOS'),
('d2', 'Apostila de Haia — Certidão de Casamento', 'Cartório · Apostilamento no padrão internacional', 'Concluído', NULL, 'AMBOS'),
('d3', 'Apostila de Haia — Diplomas', 'Cartório · Graduação em Logística apostilada', 'Em Andamento', NULL, 'AMBOS'),
('d4', 'Certidão de Antecedentes Criminais', 'Polícia Federal + Polícia Civil BA · Apostilada', 'Em Andamento', NULL, 'AMBOS'),
('d5', 'PB4 / CDAM (Seguro Saúde)', 'Ministério da Saúde · Acordo bilateral BR-PT · Substitui seguro viagem', 'Pendente', ARRAY['d4'], 'PT'),
('d6', 'NIF (Número de Identificação Fiscal)', 'Finanças de Portugal · Via Representante Fiscal (Mãe em Coimbra)', 'Em Andamento', NULL, 'PT'),
('d7', 'Carta Convite / Termo de Responsabilidade', 'Emitido pela Mãe em Coimbra · Registrado em notário português', 'Pendente', NULL, 'PT'),
('d8', 'NISS (Segurança Social)', 'Segurança Social Portugal · Necessário para contrato de trabalho', 'Pendente', ARRAY['d6'], 'PT'),
('d9', 'Visto D3 / Procura de Trabalho', 'Consulado de Portugal · Pedido principal do visto', 'Pendente', ARRAY['d4', 'd5', 'd7'], 'PT'),
('d10', 'Credencial UNEDasiss', 'Homologação obrigatória de notas brasileiras para o sistema espanhol', 'Pendente', NULL, 'ES'),
('d11', 'NIE (Número de Identidad de Extranjero)', 'Identificação fiscal de estrangeiro na Espanha', 'Pendente', NULL, 'ES'),
('d12', 'Empadronamiento', 'Registro de residência no ayuntamiento local', 'Pendente', ARRAY['d11'], 'ES'),
('d13', 'Seguro Médico Privado', 'Obrigatório para visto de estudante na Espanha (mín. €30.000 cobertura)', 'Pendente', NULL, 'ES')
ON CONFLICT (id) DO NOTHING;

-- 4. ITENS FINANCEIROS
INSERT INTO public.itens_financeiros (id, label, sub_label, valor_brl, valor_eur, tipo, categoria, recorrente) VALUES
('fin1', 'Reserva Pessoal / Poupança', 'Conta poupança disponível', 30000, 4878, 'receita', 'Poupança', false),
('fin2', 'Acerto Rescisório (8 anos)', 'FGTS + verbas rescisórias', 25000, 4065, 'receita', 'Rescisão', false),
('fin3', 'Passagens Aéreas SSA → LIS (Casal)', '2 passagens · Econômica · Salvador → Lisboa', 9000, 1463, 'despesa', 'Viagem', false),
('fin4', 'Taxas Consulares (VFS Global)', 'Visto D3 + taxas de documentação', 1200, 195, 'despesa', 'Jurídico', false),
('fin5', 'Documentação e Cartórios', 'Apostilamentos + traduções juramentadas', 800, 130, 'despesa', 'Jurídico', false),
('fin6', 'Alimentação Mensal (Casal)', 'Supermercado + refeições · Coimbra', 2460, 400, 'despesa', 'Custo de Vida', true),
('fin7', 'Transporte / Passes (Casal)', 'Passes mensais SMTUC · Coimbra', 369, 60, 'despesa', 'Custo de Vida', true),
('fin8', 'Aluguel / Caução', 'Custo zerado — hospedagem familiar (Mãe)', 0, 0, 'despesa', 'Moradia', false),
('fin9', 'Fundo de Emergência', 'Reserva para 3 meses em Coimbra', 12300, 2000, 'despesa', 'Reserva', false),
('fin10', 'Comprovação de Subsistência (Visto)', 'Titular (100% SM) + Cônjuge (50% SM) — precisa estar disponível', 90774, 14760, 'despesa', 'Comprovação', false)
ON CONFLICT (id) DO NOTHING;

-- 5. ETAPAS VISTO
INSERT INTO public.etapas_visto (id, titulo, descricao, status, data, obs) VALUES
('v1', 'Reunião de Documentos', 'Coleta e apostilamento de todos os documentos obrigatórios para o pedido de visto.', 'Concluído', 'Jul 2026', 'Passaporte e Certidão de Casamento apostilados.'),
('v2', 'Agendamento Consular', 'Marcação de horário no Consulado de Portugal em Salvador/Recife via VFS Global.', 'Em Andamento', '28 Ago, 2026', 'Protocolo VFS: BR-SSA-2026-XXXXX · Comparecer às 09h30.'),
('v3', 'Entrega de Documentos', 'Entrega presencial da pasta completa no consulado com todos os originais e cópias.', 'Pendente', 'Set 2026', NULL),
('v4', 'Análise pelo Consulado', 'Período de análise pelo Consulado. O prazo regulamentar é de 60 dias úteis.', 'Pendente', 'Set — Nov 2026', 'Possível consulta de status via portal SEF/AIMA.'),
('v5', 'Decisão do Consulado', 'Notificação por e-mail e/ou carta com o resultado: aprovação, recusa ou pedido de esclarecimentos.', 'Pendente', 'Nov 2026', NULL),
('v6', 'Retirada do Visto', 'Retirada do passaporte com visto carimbado no consulado ou via Sedex.', 'Pendente', 'Nov — Dez 2026', NULL)
ON CONFLICT (id) DO NOTHING;

-- 6. DOCS CONSULADO
INSERT INTO public.docs_consulado (id, label, ok) VALUES
('dc1', 'Formulário de pedido de visto (impresso e assinado)', true),
('dc2', 'Passaporte válido + 2 cópias', true),
('dc3', '2 fotos 3×4 recentes (fundo branco)', true),
('dc4', 'Certidão de antecedentes criminais apostilada', false),
('dc5', 'Autorização PB4 original', false),
('dc6', 'Contrato de trabalho / promessa de contrato em Portugal', false),
('dc7', 'Comprovante de meios de subsistência (extrato bancário)', true),
('dc8', 'Carta Convite / Termo de Responsabilidade (Mãe)', false),
('dc9', 'Seguro de viagem/saúde com cobertura mínima de €30.000', false)
ON CONFLICT (id) DO NOTHING;

-- 7. TAREFAS LOGÍSTICA
INSERT INTO public.tarefas_logistica (id, titulo, descricao, responsavel, status, data_conclusao) VALUES
('log1', 'Emissão da Carta Convite / Termo de Responsabilidade', 'Documento registrado em cartório/notário português atestando alojamento do casal.', 'ANFITRIAO', 'Pendente', NULL),
('log2', 'Representante Fiscal para NIF', 'Ir presencialmente às Finanças em Coimbra ou via Portal das Finanças.', 'ANFITRIAO', 'Em Andamento', NULL),
('log3', 'Atestado de Morada (Junta de Freguesia)', 'Comprovar residência em Coimbra junto à Junta de Freguesia local.', 'ANFITRIAO', 'Pendente', NULL),
('log4', 'Solicitar PB4 / CDAM no Brasil', 'Portal do Ministério da Saúde · Também necessário para a Andressa.', 'TITULAR', 'Pendente', NULL),
('log5', 'Abrir Conta Bancária (Millennium BCP)', 'Conta para não-residente · Necessita NIF emitido.', 'TITULAR', 'Pendente', NULL),
('log6', 'Registrar NISS (Segurança Social)', 'Necessário para contrato de trabalho · Depende do NIF.', 'TITULAR', 'Pendente', NULL),
('log7', 'Reagrupamento Familiar (Andressa)', 'Entrada no processo de AR para cônjuge com permissão de trabalho.', 'AMBOS', 'Pendente', NULL)
ON CONFLICT (id) DO NOTHING;

-- 8. PRAZOS
INSERT INTO public.prazos (id, label, data, urgencia) VALUES
('p1', 'Apostila dos Diplomas', '15 Ago, 2026', 'alta'),
('p2', 'NIF via Representante Fiscal (Mãe)', '22 Ago, 2026', 'media'),
('p3', 'Prazo de Pedido do Visto D3', '30 Set, 2026', 'baixa'),
('p4', 'Homologação UNEDasiss (Plano B)', '15 Out, 2026', 'baixa')
ON CONFLICT (id) DO NOTHING;
