import { useState } from 'react'
import { isSupabaseConfigured, loginComGoogle } from '../lib/supabase'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface AuthLockScreenProps {
  onAutenticado: () => void
}

export function AuthLockScreen({ onAutenticado }: AuthLockScreenProps) {
  const [chaveMestra, setChaveMestra] = useLocalStorage<string>('ep_master_key', 'europa2026')
  const [senhaDigitada, setSenhaDigitada] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [modoAlterarSenha, setModoAlterarSenha] = useState(false)
  const [novaChave, setNovaChave] = useState('')
  const [confirmarChave, setConfirmarChave] = useState('')
  const [sucessoTroca, setSucessoTroca] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (senhaDigitada === chaveMestra) {
      setErro('')
      onAutenticado()
    } else {
      setErro('Chave Mestra incorreta! Verifique a senha digitada.')
    }
  }

  const handleTrocarChave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!novaChave.trim() || novaChave.length < 4) {
      setErro('A nova chave mestra deve ter pelo menos 4 caracteres.')
      return
    }
    if (novaChave !== confirmarChave) {
      setErro('As senhas digitadas não coincidem.')
      return
    }
    setChaveMestra(novaChave)
    setSucessoTroca('Chave Mestra alterada com sucesso!')
    setErro('')
    setNovaChave('')
    setConfirmarChave('')
    setTimeout(() => {
      setModoAlterarSenha(false)
      setSucessoTroca('')
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 px-4">
      {/* Fundo com gradiente suave */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950/30 pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Icone e Marca */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-lg" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
            EP
          </div>
          <h1 className="text-2xl font-bold text-slate-100">EuroPlanner</h1>
          <p className="text-slate-400 text-xs">Planejador Europa · Acesso Protegido por Chave Mestra</p>

          {/* Badge Conexao Supabase */}
          <div className="pt-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full font-medium border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isSupabaseConfigured ? 'Supabase Conectado (Vercel)' : 'Modo Armazenamento Local'}
            </span>
          </div>
        </div>

        {!modoAlterarSenha ? (
          /* Form Login */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Digite a Chave Mestra
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senhaDigitada}
                  onChange={e => {
                    setSenhaDigitada(e.target.value)
                    setErro('')
                  }}
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-teal-500 transition-all tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-2 py-1 rounded"
                >
                  {mostrarSenha ? '🙈 Ocultar' : '👁 Revelar'}
                </button>
              </div>
            </div>

            {erro && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium animate-bounce">
                {erro}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              🔑 Desbloquear com Chave Mestra
            </button>

            {/* Separador e Login com Google */}
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                OU ACESSE COM GOOGLE
              </span>
            </div>

            <button
              type="button"
              onClick={loginComGoogle}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 border border-slate-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Entrar com Google
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setModoAlterarSenha(true)
                  setErro('')
                }}
                className="text-xs text-slate-500 hover:text-teal-400 transition-colors"
              >
                ⚙ Redefinir / Alterar Chave Mestra
              </button>
            </div>
          </form>
        ) : (
          /* Form Redefinir Chave Mestra */
          <form onSubmit={handleTrocarChave} className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 text-center border-b border-slate-800 pb-2">
              Alterar Chave Mestra
            </h2>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Nova Chave Mestra
              </label>
              <input
                type="password"
                placeholder="Digite a nova chave..."
                value={novaChave}
                onChange={e => setNovaChave(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Confirmar Nova Chave Mestra
              </label>
              <input
                type="password"
                placeholder="Confirme a nova chave..."
                value={confirmarChave}
                onChange={e => setConfirmarChave(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>

            {erro && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                {erro}
              </div>
            )}

            {sucessoTroca && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs text-center font-medium">
                {sucessoTroca}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setModoAlterarSenha(false)
                  setErro('')
                }}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Salvar Nova Chave
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
