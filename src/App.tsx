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
import { carregarDoSupabase, isSupabaseConfigured, supabase, logoutSupabase } from './lib/supabase'
import { Overview } from './views/Overview'
import { JobBoard } from './views/JobBoard'
import { EducationBoard } from './views/EducationBoard'
import { BureaucracyTracker } from './views/BureaucracyTracker'
import { FinanceManager } from './views/FinanceManager'
import { VisaTracker } from './views/VisaTracker'
import { LogisticsTracker } from './views/LogisticsTracker'
import { FlightPlanner } from './views/FlightPlanner'
import { DemoSeeder } from './views/DemoSeeder'

export default function App() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return sessionStorage.getItem('ep_autenticado') === 'true'
  })
  const [view, setView] = useLocalStorage<View>('ep_view', 'overview')

  // Estado persistido em localStorage (usa arrays vazios se Supabase estiver ativo para evitar dados falsos de teste)
  const [vagas, setVagas] = useLocalStorage<Vaga[]>('ep_vagas', isSupabaseConfigured ? [] : VAGAS_INICIAIS)
  const [faculdades, setFaculdades] = useLocalStorage<Faculdade[]>('ep_faculdades', isSupabaseConfigured ? [] : FACULDADES_INICIAIS)
  const [docs, setDocs] = useLocalStorage<Documento[]>('ep_docs', isSupabaseConfigured ? [] : DOCUMENTOS_INICIAIS)
  const [itensFinanceiros, setItensFinanceiros] = useLocalStorage<ItemFinanceiro[]>('ep_financas', isSupabaseConfigured ? [] : ITENS_FINANCEIROS_INICIAIS)
  const [etapasVisto, setEtapasVisto] = useLocalStorage<EtapaVisto[]>('ep_etapas_visto', isSupabaseConfigured ? [] : ETAPAS_VISTO_INICIAIS)
  const [docsConsulado, setDocsConsulado] = useLocalStorage<DocConsulado[]>('ep_docs_consulado', isSupabaseConfigured ? [] : DOCS_CONSULADO_INICIAIS)
  const [tarefasLogistica, setTarefasLogistica] = useLocalStorage<TarefaLogistica[]>('ep_logistica', isSupabaseConfigured ? [] : TAREFAS_LOGISTICA_INICIAIS)
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

  // Carrega todos os dados do Supabase se configurado
  useEffect(() => {
    if (!isSupabaseConfigured) return
    async function carregarSupabase() {
      const v = await carregarDoSupabase<Vaga>('vagas')
      if (v !== null) setVagas(v)

      const f = await carregarDoSupabase<Faculdade>('faculdades')
      if (f !== null) setFaculdades(f)

      const d = await carregarDoSupabase<Documento>('documentos')
      if (d !== null) setDocs(d)

      const fin = await carregarDoSupabase<ItemFinanceiro>('itens_financeiros')
      if (fin !== null) setItensFinanceiros(fin)

      const ev = await carregarDoSupabase<EtapaVisto>('etapas_visto')
      if (ev !== null) setEtapasVisto(ev)

      const dc = await carregarDoSupabase<DocConsulado>('docs_consulado')
      if (dc !== null) setDocsConsulado(dc)

      const tl = await carregarDoSupabase<TarefaLogistica>('tarefas_logistica')
      if (tl !== null) setTarefasLogistica(tl)

      const voosData = await carregarDoSupabase<Voo>('voos')
      if (voosData !== null) setVoos(voosData)
    }
    carregarSupabase()
  }, [])

  const handleAutenticado = () => {
    sessionStorage.setItem('ep_autenticado', 'true')
    setAutenticado(true)
  }

  const handleSair = async () => {
    sessionStorage.removeItem('ep_autenticado')
    await logoutSupabase()
    setAutenticado(false)
  }

  if (!autenticado) {
    return <AuthLockScreen onAutenticado={handleAutenticado} />
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar
        ativa={view}
        onNav={setView}
        onSair={handleSair}
        vagasCount={vagas.length}
        faculdadesCount={faculdades.length}
        docsCount={docs.length}
        etapasVistoPendentesCount={etapasVisto.filter(e => e.status !== 'Concluído').length}
      />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {view === 'overview'  && (
          <Overview
            itensFinanceiros={itensFinanceiros}
            documentos={docs}
            etapasVisto={etapasVisto}
            prazos={PRAZOS_INICIAIS}
            vagas={vagas}
            faculdades={faculdades}
            tarefasLogistica={tarefasLogistica}
            voos={voos}
          />
        )}
        {view === 'kanban'    && <JobBoard vagas={vagas} setVagas={setVagas} />}
        {view === 'educacao'  && <EducationBoard faculdades={faculdades} setFaculdades={setFaculdades} />}
        {view === 'documents' && <BureaucracyTracker docs={docs} setDocs={setDocs} />}
        {view === 'finance'   && <FinanceManager itens={itensFinanceiros} setItens={setItensFinanceiros} />}
        {view === 'visto'     && <VisaTracker etapas={etapasVisto} setEtapas={setEtapasVisto} docsConsulado={docsConsulado} setDocsConsulado={setDocsConsulado} />}
        {view === 'logistica' && <LogisticsTracker tarefas={tarefasLogistica} setTarefas={setTarefasLogistica} />}
        {view === 'voos'      && <FlightPlanner voos={voos} setVoos={setVoos} />}
        {view === 'demo'      && (
          <DemoSeeder
            setVagas={setVagas}
            setFaculdades={setFaculdades}
            setDocs={setDocs}
            setItensFinanceiros={setItensFinanceiros}
            setEtapasVisto={setEtapasVisto}
            setDocsConsulado={setDocsConsulado}
            setTarefasLogistica={setTarefasLogistica}
            setVoos={setVoos}
            onNavegarResumo={() => setView('overview')}
          />
        )}
      </main>
    </div>
  )
}
