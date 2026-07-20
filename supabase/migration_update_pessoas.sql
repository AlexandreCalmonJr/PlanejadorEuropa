-- ==============================================================================
-- PLANEJADOR EUROPA — SCRIPT DE MIGRAÇÃO (SUPABASE)
-- Execute este script no SQL Editor do seu projeto Supabase se o seu banco
-- já foi criado anteriormente e precisa das novas colunas de pessoa/requerente.
-- ==============================================================================

-- 1. Adiciona coluna "pessoa" na tabela de documentos
ALTER TABLE public.documentos 
ADD COLUMN IF NOT EXISTS pessoa TEXT DEFAULT 'Ambos';

-- 2. Garante coluna "responsavel" nas tabelas de vagas e faculdades
ALTER TABLE public.vagas 
ADD COLUMN IF NOT EXISTS responsavel TEXT DEFAULT 'Alexandre';

ALTER TABLE public.faculdades 
ADD COLUMN IF NOT EXISTS responsavel TEXT DEFAULT 'Alexandre';

-- 3. Adiciona coluna "pessoa" na tabela de etapas_visto
ALTER TABLE public.etapas_visto 
ADD COLUMN IF NOT EXISTS pessoa TEXT DEFAULT 'Alexandre';

-- 4. Tabela para histórico de datas e horários da tramitação consular (VFS/Consulado)
CREATE TABLE IF NOT EXISTS public.historico_tramitacao_visto (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pessoa TEXT NOT NULL,
  visto_id TEXT NOT NULL,
  fase TEXT NOT NULL,
  data_hora TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pessoa, visto_id, fase)
);

-- Ativa políticas de acesso (RLS) para a nova tabela
ALTER TABLE public.historico_tramitacao_visto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura anonima historico_tramitacao_visto"
  ON public.historico_tramitacao_visto FOR SELECT USING (true);

CREATE POLICY "Permitir insercao anonima historico_tramitacao_visto"
  ON public.historico_tramitacao_visto FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir edicao anonima historico_tramitacao_visto"
  ON public.historico_tramitacao_visto FOR UPDATE USING (true);

CREATE POLICY "Permitir delecao anonima historico_tramitacao_visto"
  ON public.historico_tramitacao_visto FOR DELETE USING (true);
