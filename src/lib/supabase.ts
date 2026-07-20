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
 * Inicia a autenticacao com Google OAuth no Supabase.
 */
export async function loginComGoogle(): Promise<boolean> {
  if (!supabase) {
    alert('Supabase nao configurado. Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para usar Login com Google.')
    return false
  }
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      alert(`Erro no Login Google: ${error.message}`)
      return false
    }
    return true
  } catch (err) {
    console.error('Erro ao conectar com Google Auth:', err)
    return false
  }
}

/**
 * Encerra a sessao de usuario no Supabase.
 */
export async function logoutSupabase(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}
