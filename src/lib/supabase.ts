import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('seu-projeto'))

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Carrega dados de uma tabela no Supabase. Retorna null se nao configurado ou em caso de erro.
 */
export async function carregarDoSupabase<T>(tabela: string): Promise<T[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.from(tabela).select('*')
    if (error) {
      console.warn(`[Supabase] Erro ao carregar ${tabela}:`, error.message)
      return null
    }
    return data as T[]
  } catch (err) {
    console.warn(`[Supabase] Falha na conexao para ${tabela}:`, err)
    return null
  }
}

/**
 * Salva ou atualiza um item em uma tabela do Supabase.
 */
export async function salvarItemSupabase<T extends { id: string }>(tabela: string, item: T): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from(tabela).upsert(item)
    if (error) {
      console.warn(`[Supabase] Erro ao salvar item em ${tabela}:`, error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[Supabase] Falha ao sincronizar item em ${tabela}:`, err)
    return false
  }
}

/**
 * Remove um item de uma tabela do Supabase.
 */
export async function removerItemSupabase(tabela: string, id: string): Promise<boolean> {
  if (!supabase) return false
  try {
    const { error } = await supabase.from(tabela).delete().eq('id', id)
    if (error) {
      console.warn(`[Supabase] Erro ao remover de ${tabela}:`, error.message)
      return false
    }
    return true
  } catch (err) {
    console.warn(`[Supabase] Falha ao excluir item em ${tabela}:`, err)
    return false
  }
}
