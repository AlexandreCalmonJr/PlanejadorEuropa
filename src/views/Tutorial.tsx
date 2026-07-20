import { useState } from 'react'
import type { View } from '../types'

interface SecaoTutorial {
  id: View | 'geral' | 'mobile'
  icone: string
  titulo: string
  subtitulo: string
  cor: string
  passos: {
    titulo: string
    descricao: string
    dica?: string
  }[]
}

const TUTORIAIS: SecaoTutorial[] = [
  {
    id: 'geral',
    icone: '🏠',
    titulo: 'Primeiros Passos',
    subtitulo: 'Como começar a usar o EuroPlanner',
    cor: '#14B8A6',
    passos: [
      {
        titulo: 'Acesse o painel',
        descricao: 'Ao abrir o EuroPlanner, você será recebido pela tela de bloqueio. Digite a Chave Mestra (senha padrão: europa2026) para desbloquear o painel ou use o botão "Entrar com Google" se configurou o Supabase.',
        dica: 'A chave mestra fica salva no navegador. Cada computador/celular pode ter sua própria chave.',
      },
      {
        titulo: 'Navegue pelos módulos',
        descricao: 'No desktop, use o menu lateral esquerdo para navegar entre os módulos. No celular, use a barra inferior com 4 atalhos rápidos ou clique em "☰ Mais" para ver todos os módulos.',
        dica: 'No desktop, clique no botão ❮ para recolher o menu lateral e ganhar mais espaço na tela.',
      },
      {
        titulo: 'Filtro por pessoa',
        descricao: 'Em vários módulos (Vagas, Faculdades, Burocracia, Visto), você pode filtrar por pessoa. Selecione "Alexandre", "Andressa" ou "Todos" na barra de filtros. Você também pode adicionar novas pessoas com o botão "+ Nova Pessoa".',
      },
      {
        titulo: 'Dados salvos automaticamente',
        descricao: 'Todas as alterações são salvas automaticamente no navegador (localStorage). Se configurou o Supabase, os dados também são sincronizados na nuvem em tempo real.',
        dica: 'Se limpar os dados do navegador, os dados locais serão perdidos. Use o Supabase para backup na nuvem.',
      },
    ],
  },
  {
    id: 'overview',
    icone: '📊',
    titulo: 'Resumo / Visão Geral',
    subtitulo: 'Painel com todos os indicadores de imigração',
    cor: '#14B8A6',
    passos: [
      {
        titulo: 'Painel Financeiro',
        descricao: 'No topo, veja o Total em Caixa (R$), Convertido em EUR (€), Despesas Previstas e Saldo Após Mudança. Os valores são calculados automaticamente com base no módulo Finanças.',
        dica: 'A cotação EUR/BRL é atualizada automaticamente. Você pode ajustar no módulo Finanças.',
      },
      {
        titulo: 'Vagas de TI e Universidades',
        descricao: 'Veja um resumo rápido das candidaturas a vagas (quantas em entrevista, quantas com oferta) e universidades (quantas aceitas, quantas aguardando).',
      },
      {
        titulo: 'Próximos Passos & Prazos',
        descricao: 'A caixa "Próximos Passos" agrega automaticamente itens pendentes de todos os módulos: vistos em andamento, documentos pendentes, tarefas logísticas, faculdades aguardando e prazos importantes.',
        dica: 'Os itens são ordenados por urgência. Badges coloridas indicam de qual módulo cada item vem (🛂 Visto, 📜 Doc, 📦 Logística, etc.)',
      },
      {
        titulo: 'Checklist de Documentos',
        descricao: 'Veja uma lista rápida dos documentos com seus status (Concluído ✅, Em Andamento 🔄, Pendente ⏳, Bloqueado 🔒).',
      },
    ],
  },
  {
    id: 'kanban',
    icone: '💼',
    titulo: 'Quadro de Vagas & Emprego',
    subtitulo: 'Kanban para acompanhar candidaturas a vagas',
    cor: '#0284C7',
    passos: [
      {
        titulo: 'Visualize suas candidaturas',
        descricao: 'O quadro Kanban tem 4 colunas: Candidatado → Triagem RH → Entrevista Técnica → Oferta. Cada cartão representa uma vaga de emprego.',
      },
      {
        titulo: 'Arraste entre colunas',
        descricao: 'Arraste um cartão de uma coluna para outra para atualizar o status da candidatura. Ex: ao receber uma ligação do RH, arraste de "Candidatado" para "Triagem RH".',
        dica: 'No celular, o arraste também funciona, mas é mais fácil abrir o cartão e alterar o status manualmente.',
      },
      {
        titulo: 'Adicione novas vagas',
        descricao: 'Clique no botão "+ Nova Vaga" para cadastrar uma nova candidatura. Preencha empresa, cargo, cidade, faixa salarial, se patrocina visto e quem é o candidato responsável (Alexandre, Andressa ou Ambos).',
      },
      {
        titulo: 'Detalhes da vaga',
        descricao: 'Clique em qualquer cartão para abrir o modal de detalhes. Lá você pode editar todos os campos, adicionar stack de tecnologias, descrição, requisitos, link da vaga, contato do recrutador e anexar arquivos (currículos, testes, etc.).',
        dica: 'O modal também exibe o salário convertido em BRL mensal para facilitar a comparação.',
      },
      {
        titulo: 'Filtro por candidato',
        descricao: 'Na barra "CANDIDATO:", selecione quem está se candidatando: "🌐 Todos os Candidatos", "👤 Alexandre", "👤 Andressa" ou adicione novas pessoas.',
      },
    ],
  },
  {
    id: 'educacao',
    icone: '🎓',
    titulo: 'Faculdades & Universidades',
    subtitulo: 'Kanban para acompanhar candidaturas universitárias',
    cor: '#8B5CF6',
    passos: [
      {
        titulo: 'Colunas do Kanban',
        descricao: 'O quadro tem 4 fases: Pesquisando → Candidatura → Aguardando → Aceito. Arraste os cartões conforme avança no processo de admissão.',
      },
      {
        titulo: 'Cadastrar nova faculdade',
        descricao: 'Clique em "+ Nova Faculdade" e preencha: instituição, curso, tipo (Licenciatura, Mestrado, Grado, Máster), cidade, país (Portugal ou Espanha), taxas, se aceita ENEM, diploma BR e bolsa CPLP.',
        dica: 'O sistema calcula automaticamente o custo total anual e mensal incluindo taxa de candidatura, matrícula e propina.',
      },
      {
        titulo: 'Detalhes da faculdade',
        descricao: 'Clique no cartão para abrir os detalhes. Veja custos detalhados, requisitos, adicione observações e anexe documentos como cartas de motivação, históricos e certificados.',
      },
      {
        titulo: 'Filtro por estudante',
        descricao: 'Na barra "ESTUDANTE:", filtre por quem está se candidatando. Cada pessoa pode estar em faculdades diferentes com status independentes.',
      },
    ],
  },
  {
    id: 'documents',
    icone: '📜',
    titulo: 'Rastreador de Burocracia',
    subtitulo: 'Controle todos os documentos de imigração',
    cor: '#0EA5E9',
    passos: [
      {
        titulo: 'Visão geral dos documentos',
        descricao: 'Veja todos os documentos organizados por status: Concluído (verde), Em Andamento (amarelo), Pendente (laranja), Bloqueado (vermelho). Cada cartão mostra o nome, descrição e badges de status.',
      },
      {
        titulo: 'Presets de documentos',
        descricao: 'Na parte superior, clique nos chips de documentos pré-configurados (Passaporte, Certidão de Nascimento, Antecedentes Criminais, PB4, etc.) para adicionar rapidamente com 1 clique.',
        dica: 'São 15 documentos de imigração mais solicitados já pré-configurados com nome e descrição.',
      },
      {
        titulo: 'Dependências (Bloqueado por)',
        descricao: 'Um documento pode depender de outros. Ex: a Apostila de Haia depende do Antecedente Criminal. Quando o documento pai está pendente, o filho fica "Bloqueado". Ao concluir o pai, o filho é desbloqueado automaticamente.',
        dica: 'Use os botões "✓ Concluir" e "✕ Trava" no cartão para alterar rapidamente o status.',
      },
      {
        titulo: 'Detalhes e anexos',
        descricao: 'Clique em qualquer documento para abrir os detalhes completos. Adicione observações, mude o status, gerencie dependências e anexe arquivos escaneados (PDF, foto do documento, etc.).',
      },
      {
        titulo: 'Filtro por pessoa',
        descricao: 'Use a barra "PESSOA:" para ver documentos de Alexandre, Andressa ou de ambos. Cada documento pode ser atribuído a uma pessoa específica.',
      },
    ],
  },
  {
    id: 'finance',
    icone: '💰',
    titulo: 'Gerenciador Financeiro',
    subtitulo: 'Controle receitas, despesas e orçamento da mudança',
    cor: '#F59E0B',
    passos: [
      {
        titulo: 'Painel de totais',
        descricao: 'No topo, veja Total em Caixa (R$), Convertido em EUR (€), Despesas Previstas e Saldo Após Mudança com cálculos automáticos em tempo real.',
      },
      {
        titulo: 'Adicionar itens',
        descricao: 'Clique em "+ Novo Item" para cadastrar uma receita ou despesa. Preencha: categoria, descrição, valor em BRL ou EUR, se é recorrente e se já foi concluído.',
        dica: 'A conversão entre BRL e EUR é feita automaticamente usando a cotação atual (R$6,15/€1).',
      },
      {
        titulo: 'Categorias',
        descricao: 'Organize seus itens em categorias como: Poupança, Salário, Venda de Bens, Visto, Passagens, Moradia, Documentos, etc. Cada categoria tem ícone e cor próprios.',
      },
      {
        titulo: 'Marcação de concluído',
        descricao: 'Marque itens como concluídos (✅) quando o pagamento for efetuado. Itens concluídos entram no cálculo do "Total em Caixa".',
      },
    ],
  },
  {
    id: 'visto',
    icone: '🛂',
    titulo: 'Rastreador de Visto',
    subtitulo: 'Acompanhe o status do visto e tramitação consular',
    cor: '#F97316',
    passos: [
      {
        titulo: 'Selecionar tipo de visto',
        descricao: 'Escolha entre os tipos de visto disponíveis: D1 (Trabalho), D4 (Estudante), D7 (Aposentado/Renda), Nômade Digital, Tech Visa e Autorizacion Inicial (Espanha). Cada tipo tem etapas específicas.',
      },
      {
        titulo: 'Pipeline de status',
        descricao: 'Veja todas as etapas do processo de visto em um pipeline visual. Clique em cada etapa para marcar como concluída. A data e hora são registradas automaticamente.',
        dica: 'Cada mudança de fase registra automaticamente o dia e horário no formato DD/MM/AAAA HH:mm.',
      },
      {
        titulo: 'Editar data/hora manualmente',
        descricao: 'Se precisar alterar ou inserir manualmente uma data/hora para uma fase, clique no botão "✏️ Data" ao lado de cada fase. Digite no formato DD/MM/AAAA HH:mm.',
      },
      {
        titulo: 'Histórico de tramitação',
        descricao: 'Na seção "🕒 Histórico Registrado de Tramitação", veja todas as fases que foram registradas com suas datas. Cada entrada pode ser editada clicando no ícone ✏️.',
        dica: 'Use o botão "🗑️ Limpar Histórico" se precisar resetar todo o histórico de uma pessoa.',
      },
      {
        titulo: 'Filtro por requerente',
        descricao: 'Na barra de pessoas, selecione o requerente do visto (Alexandre ou Andressa). Cada pessoa tem seu próprio tipo de visto selecionado e histórico de tramitação independente.',
      },
      {
        titulo: 'Checklist de documentos do consulado',
        descricao: 'Na parte inferior, veja a checklist dos documentos específicos exigidos pelo consulado/VFS Global. Marque cada item conforme for providenciando.',
      },
    ],
  },
  {
    id: 'logistica',
    icone: '📦',
    titulo: 'Logística da Mudança',
    subtitulo: 'Tarefas para organizar a mudança internacional',
    cor: '#10B981',
    passos: [
      {
        titulo: 'Lista de tarefas',
        descricao: 'Veja todas as tarefas logísticas organizadas por status: Concluído, Em Andamento, Pendente e Bloqueado. Cada tarefa tem um responsável (Anfitrião, Titular ou Ambos).',
      },
      {
        titulo: 'Adicionar tarefa',
        descricao: 'Clique em "+ Nova Tarefa" e preencha: título, descrição, responsável e status inicial. Ex: "Cancelar contrato de aluguel", "Vacinar pets", "Reservar hotel temporário".',
      },
      {
        titulo: 'Atualizar status',
        descricao: 'Clique na tarefa para ver detalhes e mudar o status. Ao concluir, adicione a data de conclusão. Anexe comprovantes se necessário.',
        dica: 'Tarefas bloqueadas são destacadas em vermelho e ficam no topo da lista.',
      },
    ],
  },
  {
    id: 'voos',
    icone: '✈️',
    titulo: 'Planejador de Voos',
    subtitulo: 'Compare e organize passagens aéreas',
    cor: '#EC4899',
    passos: [
      {
        titulo: 'Cadastrar voo',
        descricao: 'Clique em "+ Novo Voo" para registrar uma opção de voo. Preencha: companhia, origem, destino, datas de ida e volta, valor, número de escalas, bagagens e dados dos passageiros.',
      },
      {
        titulo: 'Comparar opções',
        descricao: 'Cadastre vários voos para comparar preços, escalas e horários lado a lado. O sistema destaca o voo mais barato e o mais direto.',
        dica: 'Adicione o código de reserva quando comprar a passagem para ter tudo organizado.',
      },
      {
        titulo: 'Detalhes e anexos',
        descricao: 'Clique no cartão do voo para ver todos os detalhes. Anexe comprovantes de compra, e-tickets e confirmações de reserva.',
      },
    ],
  },
  {
    id: 'demo',
    icone: '✨',
    titulo: 'Modo Demo',
    subtitulo: 'Preencher o sistema com dados de exemplo',
    cor: '#6366F1',
    passos: [
      {
        titulo: 'O que é o Modo Demo?',
        descricao: 'O Modo Demo permite preencher todos os módulos com dados de exemplo realistas para testar e explorar o sistema. Isso é útil para ver como o app funciona antes de cadastrar seus dados reais.',
      },
      {
        titulo: 'Ativar o Modo Demo',
        descricao: 'Acesse a aba "Modo Demo" no menu lateral e clique em "Carregar Dados de Demo". Todos os módulos serão preenchidos com vagas, faculdades, documentos, finanças, etapas de visto e tarefas logísticas.',
        dica: 'Cuidado: ativar o modo demo sobrescreverá os dados existentes! Use apenas para teste.',
      },
      {
        titulo: 'Limpar dados de demo',
        descricao: 'Para remover os dados de demo e começar do zero, clique em "Limpar Todos os Dados" na mesma página.',
      },
    ],
  },
  {
    id: 'mobile',
    icone: '📱',
    titulo: 'Uso no Celular',
    subtitulo: 'Dicas para melhor experiência no mobile',
    cor: '#A855F7',
    passos: [
      {
        titulo: 'Barra inferior',
        descricao: 'No celular, os 4 módulos mais usados ficam na barra inferior: Resumo, Vagas, Burocracia e Visto. Para acessar os outros módulos, clique em "☰ Mais".',
      },
      {
        titulo: 'Menu Hambúrguer',
        descricao: 'Clique no botão "☰ Menu" no topo da tela ou "☰ Mais" na barra inferior para abrir o menu completo. Todos os módulos aparecem em grade com ícones grandes.',
      },
      {
        titulo: 'Arrastar cartões',
        descricao: 'Os quadros Kanban (Vagas e Faculdades) funcionam com arraste no celular, mas para maior facilidade, abra o cartão e altere o status pelo modal de detalhes.',
        dica: 'Use o celular na horizontal (landscape) para ver mais colunas do Kanban ao mesmo tempo.',
      },
    ],
  },
]

export function Tutorial() {
  const [secaoAberta, setSecaoAberta] = useState<string | null>('geral')

  return (
    <div className="p-6 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-3">
          <span className="text-3xl">📖</span>
          Tutorial & Guia de Uso
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Aprenda a usar cada módulo do EuroPlanner em detalhes · Clique em qualquer seção para expandir
        </p>
      </div>

      {/* Dica rápida */}
      <div className="mb-6 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20">
        <p className="text-teal-300 text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">💡</span> Dica Rápida
        </p>
        <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
          O EuroPlanner foi projetado para organizar toda a sua jornada de imigração — de Salvador a Coimbra (ou Espanha como Plano B). 
          Todos os dados ficam salvos automaticamente no seu navegador. Se conectar ao Supabase, os dados também são sincronizados na nuvem.
        </p>
      </div>

      {/* Seções de Tutorial (Acordeão) */}
      <div className="space-y-3">
        {TUTORIAIS.map(secao => {
          const aberta = secaoAberta === secao.id
          return (
            <div key={secao.id} className="rounded-2xl border border-slate-800 overflow-hidden transition-all">
              {/* Cabeçalho da Seção */}
              <button
                onClick={() => setSecaoAberta(aberta ? null : secao.id)}
                className={`w-full flex items-center gap-3 p-4 text-left transition-all ${
                  aberta
                    ? 'bg-slate-800/60'
                    : 'bg-slate-900/60 hover:bg-slate-800/40'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md"
                  style={{ background: `${secao.cor}20`, border: `1px solid ${secao.cor}40` }}
                >
                  {secao.icone}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-slate-100 text-sm font-bold truncate">{secao.titulo}</h2>
                  <p className="text-slate-400 text-xs truncate">{secao.subtitulo}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                    {secao.passos.length} {secao.passos.length === 1 ? 'passo' : 'passos'}
                  </span>
                  <span className={`text-slate-400 text-sm transition-transform duration-200 ${aberta ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </button>

              {/* Conteúdo Expandido */}
              {aberta && (
                <div className="border-t border-slate-800 bg-slate-950/50 p-4 space-y-4">
                  {secao.passos.map((passo, idx) => (
                    <div key={idx} className="flex gap-3">
                      {/* Número do passo */}
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                        style={{ background: `${secao.cor}25`, color: secao.cor, border: `1px solid ${secao.cor}50` }}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-100 text-sm font-semibold mb-1">{passo.titulo}</h3>
                        <p className="text-slate-300 text-xs leading-relaxed">{passo.descricao}</p>

                        {passo.dica && (
                          <div className="mt-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                            <span className="text-sm shrink-0 mt-0.5">💡</span>
                            <span>{passo.dica}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Rodapé */}
      <div className="mt-8 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
        <p className="text-slate-300 text-sm font-semibold">🇧🇷 → 🇵🇹 Boa sorte na sua jornada!</p>
        <p className="text-slate-500 text-xs">
          EuroPlanner — O planejador completo para sua imigração para Europa.
          <br />
          Alexandre & Andressa · Salvador → Coimbra
        </p>
      </div>
    </div>
  )
}
