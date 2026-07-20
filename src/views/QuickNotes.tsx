import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { gerarId } from '../helpers'

interface Nota {
  id: string
  titulo: string
  conteudo: string
  cor: string
  fixada: boolean
  criadoEm: string
  atualizadoEm: string
}

const CORES_NOTAS = ['#14B8A6', '#0284C7', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#F97316', '#E11D48']

export function QuickNotes() {
  const [notas, setNotas] = useLocalStorage<Nota[]>('ep_notas', [])
  const [notaEditando, setNotaEditando] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  const agora = () => {
    const d = new Date()
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  const adicionarNota = () => {
    const nova: Nota = {
      id: gerarId(),
      titulo: '',
      conteudo: '',
      cor: CORES_NOTAS[notas.length % CORES_NOTAS.length],
      fixada: false,
      criadoEm: agora(),
      atualizadoEm: agora(),
    }
    setNotas(prev => [nova, ...prev])
    setNotaEditando(nova.id)
  }

  const atualizarNota = (id: string, campo: Partial<Nota>) => {
    setNotas(prev => prev.map(n => n.id === id ? { ...n, ...campo, atualizadoEm: agora() } : n))
  }

  const removerNota = (id: string) => {
    setNotas(prev => prev.filter(n => n.id !== id))
    if (notaEditando === id) setNotaEditando(null)
  }

  const fixarNota = (id: string) => {
    setNotas(prev => prev.map(n => n.id === id ? { ...n, fixada: !n.fixada } : n))
  }

  const notasFiltradas = notas.filter(n =>
    !busca.trim() ||
    n.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    n.conteudo.toLowerCase().includes(busca.toLowerCase())
  )

  const notasOrdenadas = [...notasFiltradas].sort((a, b) => {
    if (a.fixada && !b.fixada) return -1
    if (!a.fixada && b.fixada) return 1
    return 0
  })

  const notaAberta = notaEditando ? notas.find(n => n.id === notaEditando) : null

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
            <span className="text-2xl">📋</span> Notas Rápidas
          </h1>
          <p className="text-slate-400 text-sm mt-1">Anote lembretes, links úteis, contatos e protocolos</p>
        </div>
        <button
          onClick={adicionarNota}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all shadow-sm"
        >
          <span className="text-lg">+</span> Nova Nota
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar notas..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all"
        />
      </div>

      {notaAberta ? (
        /* Editor de Nota */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 max-w-3xl">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setNotaEditando(null)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1"
            >
              ← Voltar
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fixarNota(notaAberta.id)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${notaAberta.fixada ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300 bg-slate-800'}`}
              >
                {notaAberta.fixada ? '📌 Fixada' : '📌 Fixar'}
              </button>
              <button
                onClick={() => removerNota(notaAberta.id)}
                className="text-xs px-2.5 py-1 rounded-lg text-red-400 hover:bg-red-500/10 bg-slate-800 transition-all"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>

          {/* Cor */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Cor:</span>
            {CORES_NOTAS.map(cor => (
              <button
                key={cor}
                onClick={() => atualizarNota(notaAberta.id, { cor })}
                className={`w-5 h-5 rounded-full transition-all ${notaAberta.cor === cor ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                style={{ background: cor }}
              />
            ))}
          </div>

          {/* Título */}
          <input
            type="text"
            placeholder="Título da nota..."
            value={notaAberta.titulo}
            onChange={e => atualizarNota(notaAberta.id, { titulo: e.target.value })}
            className="w-full bg-transparent text-xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none border-b border-slate-800 pb-2"
          />

          {/* Conteúdo */}
          <textarea
            placeholder="Escreva aqui... Links, contatos, números de protocolo, lembretes..."
            value={notaAberta.conteudo}
            onChange={e => atualizarNota(notaAberta.id, { conteudo: e.target.value })}
            rows={14}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-all resize-none leading-relaxed"
          />

          <p className="text-slate-600 text-[10px] text-right">
            Criado: {notaAberta.criadoEm} · Atualizado: {notaAberta.atualizadoEm}
          </p>
        </div>
      ) : (
        /* Grid de Notas */
        <>
          {notasOrdenadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-3">
              <span className="text-5xl">📝</span>
              <p className="text-sm font-medium">Nenhuma nota ainda</p>
              <p className="text-xs">Clique em "+ Nova Nota" para começar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {notasOrdenadas.map(nota => (
                <button
                  key={nota.id}
                  onClick={() => setNotaEditando(nota.id)}
                  className="group text-left bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 rounded-2xl p-4 transition-all hover:shadow-lg relative overflow-hidden"
                >
                  {/* Barra de cor */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: nota.cor }} />

                  {/* Fixada badge */}
                  {nota.fixada && (
                    <span className="absolute top-2.5 right-3 text-amber-400 text-xs">📌</span>
                  )}

                  <h3 className="text-slate-100 text-sm font-bold truncate mt-1 pr-6">
                    {nota.titulo || 'Sem título'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                    {nota.conteudo || 'Nota vazia...'}
                  </p>
                  <p className="text-slate-600 text-[10px] mt-3">
                    {nota.atualizadoEm}
                  </p>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
