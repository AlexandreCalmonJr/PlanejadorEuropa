import { useState } from 'react'
import type { Voo, AnexoDocumento } from '../types'
import { fmt, gerarId, COTACAO_EURO } from '../helpers'
import { IconeMais, IconeLixeira } from '../components/Icons'
import { Modal, CampoTexto, CampoNumero, CampoSelect, BotaoSubmit, useModal } from '../components/Modal'
import { FileUploader } from '../components/FileUploader'
import { DocumentPreviewModal } from '../components/DocumentPreviewModal'

interface FlightPlannerProps {
  voos: Voo[]
  setVoos: React.Dispatch<React.SetStateAction<Voo[]>>
}

export function FlightPlanner({ voos, setVoos }: FlightPlannerProps) {
  const modalNovo = useModal()
  const [vooDetalhe, setVooDetalhe] = useState<Voo | null>(null)
  const [anexoPreview, setAnexoPreview] = useState<AnexoDocumento | null>(null)

  // Form State Novo Voo
  const [ciaAerea, setCiaAerea] = useState('TAP Air Portugal')
  const [origem, setOrigem] = useState('SSA — Salvador')
  const [destino, setDestino] = useState('LIS — Lisboa')
  const [dataPartida, setDataPartida] = useState('')
  const [horaPartida, setHoraPartida] = useState('23:05')
  const [dataChegada, setDataChegada] = useState('')
  const [horaChegada, setHoraChegada] = useState('11:40')
  const [tipoVoo, setTipoVoo] = useState<'Somente Ida' | 'Ida e Volta'>('Somente Ida')
  const [conexoes, setConexoes] = useState<'Direto' | '1 Parada' | '2+ Paradas'>('Direto')
  const [cidadesConexao, setCidadesConexao] = useState('')
  const [valorBRL, setValorBRL] = useState(4500)
  const [detalheBagagem, setDetalheBagagem] = useState('1x Mochila 10kg + 1x Mala Bordo 10kg + 2x Despachada 23kg')
  const [assentos, setAssentos] = useState('12A, 12B')
  const [passageiros, setPassageiros] = useState('Alexandre & Andressa')
  const [codigoReserva, setCodigoReserva] = useState('')

  const totalBRL = voos.reduce((s, v) => s + v.valorBRL, 0)
  const totalEUR = voos.reduce((s, v) => s + v.valorEUR, 0)

  const adicionarVoo = () => {
    if (!ciaAerea.trim() || !origem.trim() || !destino.trim()) return
    const valorEurCalculado = Math.round(valorBRL / COTACAO_EURO)
    const novo: Voo = {
      id: gerarId(),
      ciaAerea,
      origem,
      destino,
      dataPartida: dataPartida || '15 Out, 2026',
      horaPartida,
      dataChegada: dataChegada || dataPartida || '16 Out, 2026',
      horaChegada,
      tipoVoo,
      conexoes,
      cidadesConexao: conexoes !== 'Direto' ? cidadesConexao : undefined,
      valorBRL,
      valorEUR: valorEurCalculado,
      bagagemMao: true,
      bagagensDespachadas: 2,
      detalheBagagem,
      assentos,
      passageiros,
      codigoReserva,
      anexos: [],
    }
    setVoos(prev => [...prev, novo])
    modalNovo.fechar()
    setCiaAerea('TAP Air Portugal')
    setValorBRL(4500)
    setCodigoReserva('')
  }

  const salvarVoo = (vooAtualizado: Voo) => {
    setVoos(prev => prev.map(v => v.id === vooAtualizado.id ? vooAtualizado : v))
    if (vooDetalhe?.id === vooAtualizado.id) setVooDetalhe(vooAtualizado)
  }

  const removerVoo = (id: string) => {
    setVoos(prev => prev.filter(v => v.id !== id))
    if (vooDetalhe?.id === id) setVooDetalhe(null)
  }

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 w-full space-y-6">
      {/* Cabecalho */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Voos & Passagens Aéreas</h1>
          <p className="text-slate-400 text-sm mt-1">Passageiros, assentos, limite de bagagem (10kg/23kg), cotações e e-tickets</p>
        </div>
        <button
          onClick={modalNovo.abrir}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all shadow-sm"
        >
          <IconeMais /> Adicionar Voo / Cotação
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total em Passagens (BRL)</p>
          <p className="text-2xl font-extrabold text-slate-100 mt-1">
            {fmt(totalBRL, 'BRL')}
          </p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total em Passagens (EUR)</p>
          <p className="text-2xl font-extrabold text-teal-400 mt-1">
            {fmt(totalEUR, 'EUR')}
          </p>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Voos Cadastrados</p>
          <p className="text-2xl font-extrabold text-slate-100 mt-1">
            {voos.length} {voos.length === 1 ? 'itinerário' : 'itinerários'}
          </p>
        </div>
      </div>

      {/* Lista de Voos */}
      <div className="space-y-4">
        {voos.map(voo => {
          const numAnexos = voo.anexos?.length || 0

          return (
            <div
              key={voo.id}
              onClick={() => setVooDetalhe(voo)}
              className="group bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 cursor-pointer transition-all duration-150 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap border-b border-slate-800/80 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-lg font-bold">
                    ✈
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-100">{voo.ciaAerea}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {voo.tipoVoo}
                      </span>
                      {voo.passageiros && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 font-semibold">
                          👤 {voo.passageiros}
                        </span>
                      )}
                      {voo.assentos && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                          💺 {voo.assentos}
                        </span>
                      )}
                      {voo.codigoReserva && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-mono font-bold">
                          PNR: {voo.codigoReserva}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      📍 {voo.origem} ➔ {voo.destino}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-slate-100">{fmt(voo.valorBRL, 'BRL')}</p>
                    <p className="text-xs text-teal-400 font-semibold">{fmt(voo.valorEUR, 'EUR')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      removerVoo(voo.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all p-1"
                  >
                    <IconeLixeira />
                  </button>
                </div>
              </div>

              {/* Detalhes de Conexao, Horarios e Bagagem */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Partida</p>
                  <p className="text-slate-200 font-bold mt-0.5">{voo.dataPartida}</p>
                  {voo.horaPartida && <p className="text-slate-400">{voo.horaPartida}</p>}
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Chegada</p>
                  <p className="text-slate-200 font-bold mt-0.5">{voo.dataChegada || voo.dataPartida}</p>
                  {voo.horaChegada && <p className="text-slate-400">{voo.horaChegada}</p>}
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Escalas & Conexões</p>
                  <p className="text-slate-200 font-bold mt-0.5">{voo.conexoes}</p>
                  {voo.cidadesConexao && <p className="text-slate-400 truncate">{voo.cidadesConexao}</p>}
                </div>
                <div>
                  <p className="text-slate-500 font-semibold uppercase">Detalhamento de Bagagens</p>
                  <p className="text-teal-300 font-bold mt-0.5 leading-snug">
                    🧳 {voo.detalheBagagem || `${voo.bagagensDespachadas}x Despachada (23kg)`}
                  </p>
                </div>
              </div>

              {/* Anexos do voo */}
              {numAnexos > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
                    📎 {numAnexos} {numAnexos === 1 ? 'e-ticket anexado' : 'e-tickets anexados'}
                  </span>
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      if (voo.anexos && voo.anexos[0]) setAnexoPreview(voo.anexos[0])
                    }}
                    className="text-xs px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 font-semibold transition-all"
                  >
                    👁 Visualizar Passagem
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {voos.length === 0 && (
          <div className="p-12 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-3">
            <div className="text-4xl">✈</div>
            <p className="text-slate-300 font-semibold text-sm">Nenhum voo ou cotação cadastrada ainda.</p>
            <p className="text-slate-500 text-xs">Adicione passagens aéreas para comparar preços, assentos, limites de bagagem e guardar seus bilhetes.</p>
            <button
              onClick={modalNovo.abrir}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
            >
              <IconeMais /> Cadastrar Primeiro Voo
            </button>
          </div>
        )}
      </div>

      {/* Modal Novo Voo */}
      <Modal aberto={modalNovo.aberto} onFechar={modalNovo.fechar} titulo="Novo Voo / Cotação de Passagem" tamanho="3xl">
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Companhia Aérea" valor={ciaAerea} onChange={setCiaAerea} placeholder="Ex: TAP Air Portugal, Iberia, LATAM" />
          <CampoTexto label="Nome do(s) Passageiro(s)" valor={passageiros} onChange={setPassageiros} placeholder="Ex: Alexandre Calmon, Andressa" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Aeroporto de Origem" valor={origem} onChange={setOrigem} placeholder="Ex: SSA — Salvador" />
          <CampoTexto label="Aeroporto de Destino" valor={destino} onChange={setDestino} placeholder="Ex: LIS — Lisboa" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Data Partida" valor={dataPartida} onChange={setDataPartida} placeholder="Ex: 15 Out, 2026" />
          <CampoTexto label="Hora Partida" valor={horaPartida} onChange={setHoraPartida} placeholder="Ex: 23:05" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Data Chegada" valor={dataChegada} onChange={setDataChegada} placeholder="Ex: 16 Out, 2026" />
          <CampoTexto label="Hora Chegada" valor={horaChegada} onChange={setHoraChegada} placeholder="Ex: 11:40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoSelect label="Tipo de Voo" valor={tipoVoo} onChange={v => setTipoVoo(v as Voo['tipoVoo'])} opcoes={[
            { value: 'Somente Ida', label: 'Somente Ida' },
            { value: 'Ida e Volta', label: 'Ida e Volta' },
          ]} />
          <CampoSelect label="Escalas / Conexões" valor={conexoes} onChange={v => setConexoes(v as Voo['conexoes'])} opcoes={[
            { value: 'Direto', label: '✈ Voo Direto' },
            { value: '1 Parada', label: '🔄 1 Parada' },
            { value: '2+ Paradas', label: '🔄 2+ Paradas' },
          ]} />
        </div>
        {conexoes !== 'Direto' && (
          <CampoTexto label="Cidades das Conexões" valor={cidadesConexao} onChange={setCidadesConexao} placeholder="Ex: Conexão em Madri (MAD)" />
        )}
        <div className="grid grid-cols-2 gap-3">
          <CampoTexto label="Número dos Assentos" valor={assentos} onChange={setAssentos} placeholder="Ex: 12A, 12B" />
          <CampoTexto label="Código de Reserva (PNR)" valor={codigoReserva} onChange={setCodigoReserva} placeholder="Ex: X9Y8Z7 (se emitida)" />
        </div>
        <CampoTexto label="Detalhamento de Bagagens (10kg, 23kg, etc)" valor={detalheBagagem} onChange={setDetalheBagagem} placeholder="Ex: Mochila 10kg + Mala de Bordo 10kg + 2x Despachada 23kg" />
        <CampoNumero label="Valor Total da Passagem (R$ BRL)" valor={valorBRL} onChange={setValorBRL} />
        <BotaoSubmit label="Adicionar Voo" onClick={adicionarVoo} />
      </Modal>

      {/* Modal Detalhes e Anexos do Voo */}
      {vooDetalhe && (
        <Modal aberto={Boolean(vooDetalhe)} onFechar={() => setVooDetalhe(null)} titulo="Detalhes & Bilhete do Voo" tamanho="3xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{vooDetalhe.ciaAerea}</h3>
                <p className="text-xs text-teal-400 font-semibold mt-0.5">{vooDetalhe.origem} ➔ {vooDetalhe.destino}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-slate-100">{fmt(vooDetalhe.valorBRL, 'BRL')}</p>
                <p className="text-xs text-slate-400">~{fmt(vooDetalhe.valorEUR, 'EUR')}</p>
              </div>
            </div>

            {/* Edicao de Passageiro, Assentos e Bagagens */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Passageiro(s)
                </label>
                <input
                  type="text"
                  value={vooDetalhe.passageiros || ''}
                  onChange={e => {
                    const at = { ...vooDetalhe, passageiros: e.target.value }
                    salvarVoo(at)
                  }}
                  placeholder="Ex: Alexandre Calmon, Andressa"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Assento(s)
                </label>
                <input
                  type="text"
                  value={vooDetalhe.assentos || ''}
                  onChange={e => {
                    const at = { ...vooDetalhe, assentos: e.target.value }
                    salvarVoo(at)
                  }}
                  placeholder="Ex: 12A, 12B"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Código Reserva (PNR)
                </label>
                <input
                  type="text"
                  value={vooDetalhe.codigoReserva || ''}
                  onChange={e => {
                    const at = { ...vooDetalhe, codigoReserva: e.target.value }
                    salvarVoo(at)
                  }}
                  placeholder="Ex: X9Y8Z7"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 font-bold font-mono focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Detalhamento de Bagagens (Tipos e Pesos: 10kg, 23kg)
              </label>
              <input
                type="text"
                value={vooDetalhe.detalheBagagem || ''}
                onChange={e => {
                  const at = { ...vooDetalhe, detalheBagagem: e.target.value }
                  salvarVoo(at)
                }}
                placeholder="Ex: 1x Mochila 10kg + 1x Mala de Bordo 10kg + 2x Mala Despachada 23kg"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Upload de E-tickets */}
            <FileUploader
              anexos={vooDetalhe.anexos}
              onAdicionarAnexo={anexo => {
                const atualizado = { ...vooDetalhe, anexos: [...(vooDetalhe.anexos || []), anexo] }
                salvarVoo(atualizado)
              }}
              onRemoverAnexo={id => {
                const atualizado = { ...vooDetalhe, anexos: (vooDetalhe.anexos || []).filter(a => a.id !== id) }
                salvarVoo(atualizado)
              }}
            />

            <div className="pt-2 flex justify-between items-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  removerVoo(vooDetalhe.id)
                  setVooDetalhe(null)
                }}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
              >
                Excluir Voo
              </button>
              <button
                type="button"
                onClick={() => setVooDetalhe(null)}
                className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Salvar & Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Pre-visualizacao de Passagem */}
      <DocumentPreviewModal
        anexo={anexoPreview}
        onFechar={() => setAnexoPreview(null)}
      />
    </div>
  )
}
