import { useState, type ReactNode } from 'react'
import type { View, Vaga, Faculdade, Documento } from '../types'
import { IconeGrade, IconeKanban, IconeArquivo, IconeCarteira, IconePassaporte, IconeGraduacao, IconeLogistica, IconeVoo, IconeDemo, IconeTutorial, IconeNotas, IconeCalendario } from './Icons'
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
  { id: 'calendario', label: 'Calendário',   icon: IconeCalendario },
  { id: 'notas',      label: 'Notas',        icon: IconeNotas },
  { id: 'tutorial',   label: 'Tutorial',     icon: IconeTutorial },
  { id: 'demo',       label: 'Modo Demo',    icon: IconeDemo },
]

// Abas de acesso rapido para a barra inferior no mobile
const ABAS_ATALHO_MOBILE: View[] = ['overview', 'kanban', 'documents', 'visto']

export function Sidebar({
  ativa,
  onNav,
  onSair,
  vagasCount = 0,
  faculdadesCount = 0,
  docsCount = 0,
  etapasVistoPendentesCount = 0,
  vagas = [],
  faculdades = [],
  docs = [],
}: {
  ativa: View
  onNav: (v: View) => void
  onSair: () => void
  vagasCount?: number
  faculdadesCount?: number
  docsCount?: number
  etapasVistoPendentesCount?: number
  vagas?: Vaga[]
  faculdades?: Faculdade[]
  docs?: Documento[]
}) {
  const [recuada, setRecuada] = useLocalStorage<boolean>('ep_sidebar_recuada', false)
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)
  const [buscaGlobal, setBuscaGlobal] = useState('')
  const [buscaFoco, setBuscaFoco] = useState(false)

  const getBadgeValue = (key?: string) => {
    if (key === 'vagas') return vagasCount > 0 ? String(vagasCount) : null
    if (key === 'faculdades') return faculdadesCount > 0 ? String(faculdadesCount) : null
    if (key === 'documents') return docsCount > 0 ? String(docsCount) : null
    if (key === 'visto') return etapasVistoPendentesCount > 0 ? '!' : null
    return null
  }

  const itemAtivo = ITENS_NAV.find(i => i.id === ativa)

  // ─── Busca Global ──────────────────────────────────────────────────────────
  const termo = buscaGlobal.trim().toLowerCase()
  const resultadosBusca = termo ? [
    ...ITENS_NAV.filter(n => n.label.toLowerCase().includes(termo)).map(n => ({
      id: `nav-${n.id}`,
      titulo: n.label,
      subtitulo: 'Módulo do sistema',
      modulo: n.id,
      icone: '📌',
    })),
    ...vagas.filter(v => v.empresa.toLowerCase().includes(termo) || v.cargo.toLowerCase().includes(termo)).map(v => ({
      id: `vaga-${v.id}`,
      titulo: `${v.empresa} — ${v.cargo}`,
      subtitulo: `Candidatura (${v.coluna})`,
      modulo: 'kanban' as View,
      icone: '💼',
    })),
    ...faculdades.filter(f => f.instituicao.toLowerCase().includes(termo) || f.curso.toLowerCase().includes(termo)).map(f => ({
      id: `fac-${f.id}`,
      titulo: `${f.instituicao} — ${f.curso}`,
      subtitulo: `Faculdade (${f.coluna})`,
      modulo: 'educacao' as View,
      icone: '🎓',
    })),
    ...docs.filter(d => d.nome.toLowerCase().includes(termo) || d.descricao.toLowerCase().includes(termo)).map(d => ({
      id: `doc-${d.id}`,
      titulo: d.nome,
      subtitulo: `Documento (${d.status})`,
      modulo: 'documents' as View,
      icone: '📜',
    })),
  ].slice(0, 8) : []

  return (
    <>
      {/* Top Mobile Bar (Header no celular com botao de Hambúrguer) */}
      <header className="md:hidden w-full sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
            EP
          </div>
          <div>
            <p className="text-slate-100 font-bold text-sm leading-none">EuroPlanner</p>
            <p className="text-teal-400 text-[11px] font-semibold mt-1 flex items-center gap-1">
              <span>●</span> {itemAtivo?.label || 'Resumo'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuMobileAberto(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all text-xs font-bold"
        >
          <span className="text-base leading-none">☰</span>
          <span>Menu</span>
        </button>
      </header>

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

        {/* Campo de Busca Global */}
        {!recuada && (
          <div className="p-3 border-b border-slate-800 relative">
            <input
              type="text"
              placeholder="🔍 Busca rápida..."
              value={buscaGlobal}
              onChange={e => setBuscaGlobal(e.target.value)}
              onFocus={() => setBuscaFoco(true)}
              onBlur={() => setTimeout(() => setBuscaFoco(false), 200)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
            />
            {/* Popover de Resultados */}
            {buscaFoco && termo && (
              <div className="absolute top-full left-3 right-3 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                {resultadosBusca.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">Nenhum resultado encontrado.</div>
                ) : (
                  resultadosBusca.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onNav(r.modulo)
                        setBuscaGlobal('')
                      }}
                      className="w-full p-2.5 text-left hover:bg-slate-800 flex items-center gap-2.5 transition-all"
                    >
                      <span className="text-sm shrink-0">{r.icone}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-slate-200 text-xs font-semibold truncate">{r.titulo}</p>
                        <p className="text-slate-500 text-[10px] truncate">{r.subtitulo}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Links de Navegacao */}
        <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
          {ITENS_NAV.map(({ id, label, icon: Icone, badgeKey, badgeColor }) => {
            const ativo = ativa === id
            const badge = getBadgeValue(badgeKey)
            return (
              <button
                key={id}
                onClick={() => onNav(id as View)}
                title={recuada ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
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
                      <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md ${badgeColor ?? 'bg-slate-700 text-slate-300'}`}>
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

      {/* Mobile Streamlined Bottom Nav (Apenas 4 atalhos + Botao Hambúrguer) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center">
        {ABAS_ATALHO_MOBILE.map(id => {
          const item = ITENS_NAV.find(i => i.id === id)!
          const Icone = item.icon
          const ativo = ativa === id
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-all ${
                ativo ? 'text-teal-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icone size={18} ativo={ativo} />
              <span>{item.label}</span>
            </button>
          )
        })}

        {/* Botao de Menu Hambúrguer na Barra Inferior */}
        <button
          onClick={() => setMenuMobileAberto(true)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-all ${
            menuMobileAberto ? 'text-teal-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-lg leading-none">☰</span>
          <span>Mais</span>
        </button>
      </nav>

      {/* Mobile Drawer (Menu Hambúrguer Completo no Celular) */}
      {menuMobileAberto && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          {/* Overlay de fechar ao clicar fora */}
          <div className="flex-1" onClick={() => setMenuMobileAberto(false)} />

          {/* Painel do Menu Hambúrguer */}
          <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
                  EP
                </div>
                <div>
                  <h3 className="text-slate-100 font-bold text-base">Menu EuroPlanner</h3>
                  <p className="text-slate-500 text-xs">Todas as ferramentas de imigração</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuMobileAberto(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-sm font-bold transition-all"
              >
                ✕
              </button>
            </div>

            {/* Grid de Links do Menu */}
            <div className="grid grid-cols-2 gap-2">
              {ITENS_NAV.map(({ id, label, icon: Icone, badgeKey, badgeColor }) => {
                const ativo = ativa === id
                const badge = getBadgeValue(badgeKey)
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onNav(id as View)
                      setMenuMobileAberto(false)
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-xs font-semibold transition-all text-left ${
                      ativo
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-md font-bold'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                    }`}
                  >
                    <Icone size={18} ativo={ativo} />
                    <span className="truncate flex-1">{label}</span>
                    {badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${badgeColor ?? 'bg-slate-700 text-slate-300'}`}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Perfil & Sair */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #14B8A6, #0284C7)' }}>
                  <span className="text-white text-xs font-semibold">AC</span>
                </div>
                <div className="min-w-0">
                  <p className="text-slate-200 text-xs font-semibold truncate">Alexandre Calmon</p>
                  <p className="text-slate-500 text-[10px] truncate">Salvador → Coimbra</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuMobileAberto(false)
                  onSair()
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
              >
                <span>🚪</span> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

