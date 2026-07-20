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
  responsavel TEXT,
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
  responsavel TEXT,
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
  pessoa TEXT DEFAULT 'Ambos',
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
  concluido BOOLEAN DEFAULT false,
  banco TEXT,
  comprovante_entrada BOOLEAN DEFAULT false,
  anexos JSONB DEFAULT '[]'::jsonb,
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
  pessoa TEXT DEFAULT 'Alexandre',
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
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
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


-- ------------------------------------------------------------------------------
-- 9. TABELA: voos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.voos (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cia_aerea TEXT NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  data_partida TEXT NOT NULL,
  hora_partida TEXT,
  data_chegada TEXT,
  hora_chegada TEXT,
  tipo_voo TEXT NOT NULL DEFAULT 'Somente Ida',
  conexoes TEXT NOT NULL DEFAULT 'Direto',
  cidades_conexao TEXT,
  valor_brl NUMERIC NOT NULL DEFAULT 0,
  valor_eur NUMERIC NOT NULL DEFAULT 0,
  bagagem_mao BOOLEAN NOT NULL DEFAULT true,
  bagagens_despachadas INT NOT NULL DEFAULT 1,
  detalhe_bagagem TEXT,
  assentos TEXT,
  passageiros TEXT,
  codigo_reserva TEXT,
  observacoes TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
ALTER TABLE public.voos ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público (Anon e Autenticados)
CREATE POLICY "Permitir tudo em vagas" ON public.vagas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em faculdades" ON public.faculdades FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em documentos" ON public.documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em itens_financeiros" ON public.itens_financeiros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em etapas_visto" ON public.etapas_visto FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em docs_consulado" ON public.docs_consulado FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em tarefas_logistica" ON public.tarefas_logistica FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em prazos" ON public.prazos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em voos" ON public.voos FOR ALL USING (true) WITH CHECK (true);


