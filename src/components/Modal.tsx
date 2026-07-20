import { useState, type ReactNode } from 'react'

interface ModalProps {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
  tamanho?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
}

export function Modal({ aberto, onFechar, titulo, children, tamanho = '2xl' }: ModalProps) {
  if (!aberto) return null

  const classesTamanho: Record<string, string> = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }

  const maxWClass = classesTamanho[tamanho] || 'max-w-2xl'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onFechar}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" />
      {/* Content */}
      <div
        className={`relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full ${maxWClass} max-h-[88vh] overflow-y-auto animate-slideUp`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-slate-100 font-semibold text-base">{titulo}</h3>
          <button onClick={onFechar} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Campos de formulário reutilizáveis ───────────────────────────────────────

export function CampoTexto({ label, valor, onChange, placeholder }: {
  label: string; valor: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type="text"
        value={valor}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
      />
    </div>
  )
}

export function CampoNumero({ label, valor, onChange, placeholder }: {
  label: string; valor: number; onChange: (v: number) => void; placeholder?: string
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <input
        type="number"
        value={valor || ''}
        onChange={e => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
      />
    </div>
  )
}

export function CampoSelect<T extends string>({ label, valor, onChange, opcoes }: {
  label: string; valor: T; onChange: (v: T) => void; opcoes: { value: T; label: string }[]
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <select
        value={valor}
        onChange={e => onChange(e.target.value as T)}
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-all"
      >
        {opcoes.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function CampoToggle({ label, valor, onChange }: {
  label: string; valor: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <button
        onClick={() => onChange(!valor)}
        className={`w-10 h-5.5 rounded-full transition-all duration-200 relative ${
          valor ? 'bg-teal-500' : 'bg-slate-700'
        }`}
      >
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-200 ${
          valor ? 'left-5.5' : 'left-0.5'
        }`} />
      </button>
    </div>
  )
}

export function BotaoSubmit({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}
    >
      {label}
    </button>
  )
}

// ─── Hook para modal ──────────────────────────────────────────────────────────

export function useModal() {
  const [aberto, setAberto] = useState(false)
  return { aberto, abrir: () => setAberto(true), fechar: () => setAberto(false) }
}
