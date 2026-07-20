import type { View } from './types'
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
import { Overview } from './views/Overview'
import { JobBoard } from './views/JobBoard'
import { EducationBoard } from './views/EducationBoard'
import { BureaucracyTracker } from './views/BureaucracyTracker'
import { FinanceManager } from './views/FinanceManager'
import { VisaTracker } from './views/VisaTracker'
import { LogisticsTracker } from './views/LogisticsTracker'

export default function App() {
  const [view, setView] = useLocalStorage<View>('ep_view', 'overview')

  // Estado persistido em localStorage
  const [vagas, setVagas] = useLocalStorage('ep_vagas', VAGAS_INICIAIS)
  const [faculdades, setFaculdades] = useLocalStorage('ep_faculdades', FACULDADES_INICIAIS)
  const [docs, setDocs] = useLocalStorage('ep_docs', DOCUMENTOS_INICIAIS)
  const [itensFinanceiros, setItensFinanceiros] = useLocalStorage('ep_financas', ITENS_FINANCEIROS_INICIAIS)
  const [etapasVisto, setEtapasVisto] = useLocalStorage('ep_etapas_visto', ETAPAS_VISTO_INICIAIS)
  const [docsConsulado, setDocsConsulado] = useLocalStorage('ep_docs_consulado', DOCS_CONSULADO_INICIAIS)
  const [tarefasLogistica, setTarefasLogistica] = useLocalStorage('ep_logistica', TAREFAS_LOGISTICA_INICIAIS)

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
      </main>
    </div>
  )
}
