import type { ReactNode } from 'react'
import type { View } from '../types'
import { IconeGrade, IconeKanban, IconeArquivo, IconeCarteira, IconePassaporte, IconeGraduacao, IconeLogistica } from './Icons'

interface ItemNav {
  id: View
  label: string
  icon: (props: { size: number; ativo: boolean }) => ReactNode
  badge?: string
  badgeColor?: string
}

const ITENS_NAV: ItemNav[] = [
  { id: 'overview',   label: 'Resumo',       icon: IconeGrade },
  { id: 'kanban',     label: 'Vagas',        icon: IconeKanban,     badge: '7' },
  { id: 'educacao',   label: 'Faculdades',   icon: IconeGraduacao,  badge: '9', badgeColor: 'bg-violet-500/20 text-violet-400' },
  { id: 'documents',  label: 'Burocracia',   icon: IconeArquivo,    badge: '4', badgeColor: 'bg-sky-500/20 text-sky-400' },
  { id: 'finance',    label: 'Finanças',     icon: IconeCarteira },
  { id: 'visto',      label: 'Visto',        icon: IconePassaporte, badge: '!', badgeColor: 'bg-amber-500/20 text-amber-400' },
  { id: 'logistica',  label: 'Logística',    icon: IconeLogistica },
]

export function Sidebar({ ativa, onNav }: { ativa: View; onNav: (v: View) => void }) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
        <div className="px-5 py-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
              <span className="text-white font-bold text-sm">EP</span>
            </div>
            <div>
              <p className="text-slate-100 font-semibold text-sm leading-none">EuroPlanner</p>
              <p className="text-slate-500 text-xs mt-0.5">Salvador → Coimbra</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ITENS_NAV.map(({ id, label, icon: Icone, badge, badgeColor }) => {
            const ativo = ativa === id
            return (
              <button
                key={id}
                onClick={() => onNav(id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  ativo ? 'bg-teal-500/10 text-teal-400' : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icone size={16} ativo={ativo} />
                {label}
                {badge && (
                  <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-md ${badgeColor ?? 'bg-slate-700 text-slate-300'}`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
              <span className="text-white text-xs font-semibold">AC</span>
            </div>
            <div className="min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">Alexandre Calmon Jr.</p>
              <p className="text-slate-500 text-xs truncate">Salvador → Coimbra</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex">
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
      </nav>
    </>
  )
}
