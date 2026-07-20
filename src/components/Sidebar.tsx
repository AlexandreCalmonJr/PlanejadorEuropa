import type { ReactNode } from 'react'
import type { View } from '../types'
import { IconeGrade, IconeKanban, IconeArquivo, IconeCarteira, IconePassaporte, IconeGraduacao, IconeLogistica, IconeVoo } from './Icons'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface ItemNav {
  id: View
  label: string
  icon: (props: { size: number; ativo: boolean }) => ReactNode
  badgeKey?: 'vagas' | 'faculdades' | 'documents' | 'visto'
  badgeColor?: string
}

const ITENS_NAV: ItemNav[] = [
  { id: 'overview',   label: 'Resumo',       icon: IconeGrade },
  { id: 'kanban',     label: 'Vagas',        icon: IconeKanban,     badgeKey: 'vagas' },
  { id: 'educacao',   label: 'Faculdades',   icon: IconeGraduacao,  badgeKey: 'faculdades', badgeColor: 'bg-violet-500/20 text-violet-400' },
  { id: 'documents',  label: 'Burocracia',   icon: IconeArquivo,    badgeKey: 'documents',  badgeColor: 'bg-sky-500/20 text-sky-400' },
  { id: 'finance',    label: 'Finanças',     icon: IconeCarteira },
  { id: 'visto',      label: 'Visto',        icon: IconePassaporte, badgeKey: 'visto',      badgeColor: 'bg-amber-500/20 text-amber-400' },
  { id: 'logistica',  label: 'Logística',    icon: IconeLogistica },
  { id: 'voos',       label: 'Voos',         icon: IconeVoo },
]

export function Sidebar({
  ativa,
  onNav,
  onSair,
  vagasCount = 0,
  faculdadesCount = 0,
  docsCount = 0,
  etapasVistoPendentesCount = 0,
}: {
  ativa: View
  onNav: (v: View) => void
  onSair: () => void
  vagasCount?: number
  faculdadesCount?: number
  docsCount?: number
  etapasVistoPendentesCount?: number
}) {
  const [recuada, setRecuada] = useLocalStorage<boolean>('ep_sidebar_recuada', false)

  const getBadgeValue = (key?: string) => {
    if (key === 'vagas') return vagasCount > 0 ? String(vagasCount) : null
    if (key === 'faculdades') return faculdadesCount > 0 ? String(faculdadesCount) : null
    if (key === 'documents') return docsCount > 0 ? String(docsCount) : null
    if (key === 'visto') return etapasVistoPendentesCount > 0 ? '!' : null
    return null
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 transition-all duration-300 ${recuada ? 'w-16' : 'w-60'}`}>
        {/* Header com Botao de Recuar */}
        <div className="px-3 py-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
              <span className="text-white font-bold text-xs">EP</span>
            </div>
            {!recuada && (
              <div className="min-w-0 flex-1">
                <p className="text-slate-100 font-bold text-sm leading-none truncate">EuroPlanner</p>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate">Salvador → Coimbra</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setRecuada(!recuada)}
            title={recuada ? 'Expandir menu' : 'Recuar menu'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all text-xs flex items-center justify-center shrink-0"
          >
            {recuada ? '❯' : '❮'}
          </button>
        </div>

        {/* Links de Navegacao */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {ITENS_NAV.map(({ id, label, icon: Icone, badgeKey, badgeColor }) => {
            const ativo = ativa === id
            const badge = getBadgeValue(badgeKey)
            return (
              <button
                key={id}
                onClick={() => onNav(id as View)}
                title={recuada ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  recuada ? 'justify-center px-0' : ''
                } ${
                  ativo ? 'bg-teal-500/10 text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icone size={18} ativo={ativo} />
                {!recuada && (
                  <>
                    <span className="truncate">{label}</span>
                    {badge && (
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md ${badgeColor ?? 'bg-slate-700 text-slate-300'}`}>
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* Rodape Perfil Usuario & Botao Sair */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <div className={`flex items-center gap-3 ${recuada ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
              <span className="text-white text-xs font-semibold">AC</span>
            </div>
            {!recuada && (
              <div className="min-w-0 flex-1">
                <p className="text-slate-200 text-xs font-semibold truncate">Alexandre Calmon</p>
                <p className="text-slate-500 text-[11px] truncate">Salvador → Coimbra</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSair}
            title="Sair da conta / Bloquear painel"
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/30 transition-all ${
              recuada ? 'px-0' : ''
            }`}
          >
            <span>🚪</span>
            {!recuada && <span>Sair / Bloquear</span>}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center">
        {ITENS_NAV.map(({ id, label, icon: Icone }) => {
          const ativo = ativa === id
          return (
            <button
              key={id}
              onClick={() => onNav(id as View)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors ${
                ativo ? 'text-teal-400' : 'text-slate-500'
              }`}
            >
              <Icone size={16} ativo={ativo} />
              {label}
            </button>
          )
        })}
        <button
          onClick={onSair}
          title="Sair"
          className="flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium text-red-400 hover:text-red-300 transition-colors"
        >
          <span className="text-sm">🚪</span>
          Sair
        </button>
      </nav>
    </>
  )
}
