import { useState, useEffect } from 'react'
import type { View, Vaga, Faculdade, Documento, ItemFinanceiro, EtapaVisto, DocConsulado, TarefaLogistica, Voo } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  VAGAS_INICIAIS,
  FACULDADES_INICIAIS,
  DOCUMENTOS_INICIAIS,
  ITENS_FINANCEIROS_INICIAIS,
  ETAPAS_VISTO_INICIAIS,
  DOCS_CONSULADO_INICIAIS,
  TAREFAS_LOGISTICA_INICIAIS,
  PRAZOS_INICIAIS,
} from './data'

import { Sidebar } from './components/Sidebar'
import { AuthLockScreen } from './components/AuthLockScreen'
import { carregarDoSupabase, isSupabaseConfigured, supabase } from './lib/supabase'
import { Overview } from './views/Overview'
import { JobBoard } from './views/JobBoard'
import { EducationBoard } from './views/EducationBoard'
import { BureaucracyTracker } from './views/BureaucracyTracker'
import { FinanceManager } from './views/FinanceManager'
import { VisaTracker } from './views/VisaTracker'
import { LogisticsTracker } from './views/LogisticsTracker'
import { FlightPlanner } from './views/FlightPlanner'

export default function App() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return sessionStorage.getItem('ep_autenticado') === 'true'
  })
  const [view, setView] = useLocalStorage<View>('ep_view', 'overview')

  // Estado persistido em localStorage
  const [vagas, setVagas] = useLocalStorage<Vaga[]>('ep_vagas', VAGAS_INICIAIS)
  const [faculdades, setFaculdades] = useLocalStorage<Faculdade[]>('ep_faculdades', FACULDADES_INICIAIS)
  const [docs, setDocs] = useLocalStorage<Documento[]>('ep_docs', DOCUMENTOS_INICIAIS)
  const [itensFinanceiros, setItensFinanceiros] = useLocalStorage<ItemFinanceiro[]>('ep_financas', ITENS_FINANCEIROS_INICIAIS)
  const [etapasVisto, setEtapasVisto] = useLocalStorage<EtapaVisto[]>('ep_etapas_visto', ETAPAS_VISTO_INICIAIS)
  const [docsConsulado, setDocsConsulado] = useLocalStorage<DocConsulado[]>('ep_docs_consulado', DOCS_CONSULADO_INICIAIS)
  const [tarefasLogistica, setTarefasLogistica] = useLocalStorage<TarefaLogistica[]>('ep_logistica', TAREFAS_LOGISTICA_INICIAIS)
  const [voos, setVoos] = useLocalStorage<Voo[]>('ep_voos', [])

  // Monitora login/logout via Supabase Auth (ex: Google OAuth)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAutenticado(true)
        sessionStorage.setItem('ep_autenticado', 'true')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAutenticado(true)
        sessionStorage.setItem('ep_autenticado', 'true')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carrega dados do Supabase se configurado
  useEffect(() => {
    if (!isSupabaseConfigured) return
    async function carregarSupabase() {
      const v = await carregarDoSupabase<Vaga>('vagas')
      if (v && v.length > 0) setVagas(v)

      const f = await carregarDoSupabase<Faculdade>('faculdades')
      if (f && f.length > 0) setFaculdades(f)

      const d = await carregarDoSupabase<Documento>('documentos')
      if (d && d.length > 0) setDocs(d)

      const fin = await carregarDoSupabase<ItemFinanceiro>('itens_financeiros')
      if (fin && fin.length > 0) setItensFinanceiros(fin)

      const voosData = await carregarDoSupabase<Voo>('voos')
      if (voosData && voosData.length > 0) setVoos(voosData)
    }
    carregarSupabase()
  }, [])

  const handleAutenticado = () => {
    sessionStorage.setItem('ep_autenticado', 'true')
    setAutenticado(true)
  }

  if (!autenticado) {
    return <AuthLockScreen onAutenticado={handleAutenticado} />
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar ativa={view} onNav={setView} />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {view === 'overview'  && <Overview itensFinanceiros={itensFinanceiros} documentos={docs} etapasVisto={etapasVisto} prazos={PRAZOS_INICIAIS} />}
        {view === 'kanban'    && <JobBoard vagas={vagas} setVagas={setVagas} />}
        {view === 'educacao'  && <EducationBoard faculdades={faculdades} setFaculdades={setFaculdades} />}
        {view === 'documents' && <BureaucracyTracker docs={docs} setDocs={setDocs} />}
        {view === 'finance'   && <FinanceManager itens={itensFinanceiros} setItens={setItensFinanceiros} />}
        {view === 'visto'     && <VisaTracker etapas={etapasVisto} setEtapas={setEtapasVisto} docsConsulado={docsConsulado} setDocsConsulado={setDocsConsulado} />}
        {view === 'logistica' && <LogisticsTracker tarefas={tarefasLogistica} setTarefas={setTarefasLogistica} />}
        {view === 'voos'      && <FlightPlanner voos={voos} setVoos={setVoos} />}
      </main>
    </div>
  )
}
