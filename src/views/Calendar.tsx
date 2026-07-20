import { useState } from 'react'
import type { Voo, Prazo } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { gerarId } from '../helpers'

interface EventoCalendario {
  id: string
  label: string
  data: string // YYYY-MM-DD
  cor: string
  modulo: string
}

interface ContadorRegressivo {
  id: string
  label: string
  data: string // YYYY-MM-DD
  icone: string
}

interface CalendarProps {
  voos: Voo[]
  prazos: Prazo[]
}

const NOMES_MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const NOMES_DIA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MESES_MAP: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
  janeiro: 0, fevereiro: 1, marco: 2, 'março': 2, abril: 3, maio: 4, junho: 5, julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
}

function parseDateStr(str: string): Date | null {
  if (!str) return null
  // Tenta YYYY-MM-DD ou ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.substring(0, 10) + 'T00:00:00')
    if (!isNaN(d.getTime())) return d
  }
  // Tenta DD/MM/YYYY
  const partsSlash = str.split('/')
  if (partsSlash.length === 3) {
    const d = new Date(+partsSlash[2], +partsSlash[1] - 1, +partsSlash[0])
    if (!isNaN(d.getTime())) return d
  }
  // Tenta "30 Set, 2026" ou "30 Set 2026"
  const matchPt = str.match(/(\d{1,2})\s+([A-Za-zçÇ]+)[,\s]+(\d{4})/)
  if (matchPt) {
    const dia = parseInt(matchPt[1], 10)
    const mesStr = matchPt[2].toLowerCase().substring(0, 3)
    const ano = parseInt(matchPt[3], 10)
    const mes = MESES_MAP[mesStr]
    if (mes !== undefined) {
      return new Date(ano, mes, dia)
    }
  }
  const iso = new Date(str)
  if (!isNaN(iso.getTime())) return iso
  return null
}

export function Calendar({ voos, prazos }: CalendarProps) {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(hoje.getMonth())
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const [contadores, setContadores] = useLocalStorage<ContadorRegressivo[]>('ep_countdowns', [])
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null)
  const [novoEvLabel, setNovoEvLabel] = useState('')
  const [novoEvData, setNovoEvData] = useState('')
  const [novoEvIcone, setNovoEvIcone] = useState('📌')
  const [eventosCustom, setEventosCustom] = useLocalStorage<ContadorRegressivo[]>('ep_calendar_events', [])

  // Gerar eventos do sistema
  const eventosDoSistema: EventoCalendario[] = []

  // Prazos
  prazos.forEach((p, idx) => {
    const d = parseDateStr(p.data)
    if (d) {
      eventosDoSistema.push({
        id: `prazo-${idx}`,
        label: p.label,
        data: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
        cor: p.urgencia === 'alta' ? '#EF4444' : p.urgencia === 'media' ? '#F59E0B' : '#10B981',
        modulo: '🗓 Prazo',
      })
    }
  })

  // Voos
  voos.forEach(v => {
    const dPartida = parseDateStr(v.dataPartida)
    if (dPartida) {
      eventosDoSistema.push({
        id: `voo-ida-${v.id}`,
        label: `✈️ ${v.ciaAerea} — ${v.origem} → ${v.destino}`,
        data: `${dPartida.getFullYear()}-${String(dPartida.getMonth()+1).padStart(2,'0')}-${String(dPartida.getDate()).padStart(2,'0')}`,
        cor: '#EC4899',
        modulo: '✈️ Voo',
      })
    }
  })

  // Contadores regressivos como eventos
  contadores.forEach(c => {
    eventosDoSistema.push({
      id: c.id,
      label: `${c.icone} ${c.label}`,
      data: c.data,
      cor: '#8B5CF6',
      modulo: '⏰ Contador',
    })
  })

  // Eventos custom
  eventosCustom.forEach(c => {
    eventosDoSistema.push({
      id: c.id,
      label: `${c.icone} ${c.label}`,
      data: c.data,
      cor: '#14B8A6',
      modulo: '📌 Evento',
    })
  })

  // Calendário
  const primeiroDiaMes = new Date(anoAtual, mesAtual, 1)
  const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0)
  const diasNoMes = ultimoDiaMes.getDate()
  const diaSemanaInicio = primeiroDiaMes.getDay()

  const dias: (number | null)[] = []
  for (let i = 0; i < diaSemanaInicio; i++) dias.push(null)
  for (let d = 1; d <= diasNoMes; d++) dias.push(d)

  const getEventosDia = (dia: number) => {
    const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return eventosDoSistema.filter(e => e.data === dataStr)
  }

  const navMes = (dir: number) => {
    let m = mesAtual + dir
    let a = anoAtual
    if (m < 0) { m = 11; a-- }
    if (m > 11) { m = 0; a++ }
    setMesAtual(m)
    setAnoAtual(a)
  }

  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`

  const adicionarEvento = () => {
    if (!novoEvLabel.trim() || !novoEvData) return
    setEventosCustom(prev => [...prev, { id: gerarId(), label: novoEvLabel, data: novoEvData, icone: novoEvIcone }])
    setNovoEvLabel('')
    setNovoEvData('')
  }

  const adicionarContador = () => {
    if (!novoEvLabel.trim() || !novoEvData) return
    setContadores(prev => [...prev, { id: gerarId(), label: novoEvLabel, data: novoEvData, icone: novoEvIcone }])
    setNovoEvLabel('')
    setNovoEvData('')
  }

  const removerContador = (id: string) => {
    setContadores(prev => prev.filter(c => c.id !== id))
  }

  const eventosDoDia = diaSelecionado ? eventosDoSistema.filter(e => e.data === diaSelecionado) : []

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100 flex items-center gap-2">
          <span className="text-2xl">📅</span> Calendário Unificado
        </h1>
        <p className="text-slate-400 text-sm mt-1">Todos os prazos, voos e eventos em um só lugar</p>
      </div>

      {/* Contadores Regressivos */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {contadores.map(c => {
          const dataAlvo = new Date(c.data + 'T00:00:00')
          const diffMs = dataAlvo.getTime() - hoje.getTime()
          const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          const passado = diffDias < 0
          return (
            <div key={c.id} className="relative bg-slate-900/60 border border-slate-800 rounded-2xl p-4 group">
              <button
                onClick={() => removerContador(c.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-xs transition-all"
              >
                ✕
              </button>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{c.icone}</span>
                <span className="text-xs text-slate-400 font-medium truncate">{c.label}</span>
              </div>
              <p className={`text-2xl font-black ${passado ? 'text-red-400' : diffDias <= 30 ? 'text-amber-400' : 'text-teal-400'}`}>
                {passado ? `${Math.abs(diffDias)} dias atrás` : `${diffDias} dias`}
              </p>
              <p className="text-slate-600 text-[10px] mt-1">
                {dataAlvo.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )
        })}

        {/* Adicionar contador */}
        <div className="bg-slate-900/40 border border-dashed border-slate-700 rounded-2xl p-4 space-y-2">
          <p className="text-xs text-slate-500 font-semibold">⏰ Novo Contador</p>
          <input
            type="text"
            placeholder="Ex: Embarque"
            value={novoEvLabel}
            onChange={e => setNovoEvLabel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          />
          <input
            type="date"
            value={novoEvData}
            onChange={e => setNovoEvData(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          />
          <div className="flex gap-1">
            <select value={novoEvIcone} onChange={e => setNovoEvIcone(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none">
              <option value="✈️">✈️</option>
              <option value="📄">📄</option>
              <option value="🛂">🛂</option>
              <option value="🎓">🎓</option>
              <option value="💼">💼</option>
              <option value="📦">📦</option>
              <option value="🏠">🏠</option>
              <option value="📌">📌</option>
            </select>
            <button onClick={adicionarContador} className="flex-1 bg-teal-500/20 text-teal-400 text-xs font-bold rounded-lg py-1.5 hover:bg-teal-500/30 transition-all">
              + Contador
            </button>
            <button onClick={adicionarEvento} className="flex-1 bg-violet-500/20 text-violet-400 text-xs font-bold rounded-lg py-1.5 hover:bg-violet-500/30 transition-all">
              + Evento
            </button>
          </div>
        </div>
      </div>

      {/* Calendário Mensal */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {/* Header do mês */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <button onClick={() => navMes(-1)} className="text-slate-400 hover:text-slate-100 text-sm font-bold px-3 py-1 rounded-lg hover:bg-slate-800 transition-all">
            ❮ Anterior
          </button>
          <h2 className="text-slate-100 font-bold text-lg">
            {NOMES_MES[mesAtual]} {anoAtual}
          </h2>
          <button onClick={() => navMes(1)} className="text-slate-400 hover:text-slate-100 text-sm font-bold px-3 py-1 rounded-lg hover:bg-slate-800 transition-all">
            Próximo ❯
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-800">
          {NOMES_DIA.map(d => (
            <div key={d} className="text-center py-2 text-[11px] font-bold text-slate-500 uppercase">
              {d}
            </div>
          ))}
        </div>

        {/* Grid de dias */}
        <div className="grid grid-cols-7">
          {dias.map((dia, i) => {
            if (dia === null) return <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-slate-800/50" />
            const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
            const eventos = getEventosDia(dia)
            const eHoje = dataStr === hojeStr
            const eSelecionado = dataStr === diaSelecionado
            return (
              <button
                key={dia}
                onClick={() => setDiaSelecionado(eSelecionado ? null : dataStr)}
                className={`min-h-[80px] border-b border-r border-slate-800/50 p-1.5 text-left transition-all hover:bg-slate-800/40 ${eSelecionado ? 'bg-teal-500/10 ring-1 ring-teal-500/40' : ''}`}
              >
                <span className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                  eHoje ? 'bg-teal-500 text-slate-950' : 'text-slate-300'
                }`}>
                  {dia}
                </span>
                <div className="mt-1 space-y-0.5">
                  {eventos.slice(0, 2).map(ev => (
                    <div key={ev.id} className="text-[9px] font-medium truncate rounded px-1 py-0.5" style={{ background: `${ev.cor}20`, color: ev.cor }}>
                      {ev.label}
                    </div>
                  ))}
                  {eventos.length > 2 && (
                    <div className="text-[9px] text-slate-500 pl-1">+{eventos.length - 2} mais</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Eventos do dia selecionado */}
      {diaSelecionado && (
        <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-slate-100 text-sm font-bold mb-3">
            📌 Eventos em {diaSelecionado.split('-').reverse().join('/')}
          </h3>
          {eventosDoDia.length === 0 ? (
            <p className="text-slate-500 text-xs">Nenhum evento neste dia.</p>
          ) : (
            <div className="space-y-2">
              {eventosDoDia.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: ev.cor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-xs font-semibold truncate">{ev.label}</p>
                    <p className="text-slate-500 text-[10px]">{ev.modulo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
