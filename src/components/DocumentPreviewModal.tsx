import type { AnexoDocumento } from '../types'

interface DocumentPreviewModalProps {
  anexo: AnexoDocumento | null
  onFechar: () => void
}

export function DocumentPreviewModal({ anexo, onFechar }: DocumentPreviewModalProps) {
  if (!anexo) return null

  const nomeLower = anexo.nome.toLowerCase()
  const ehPdf = nomeLower.endsWith('.pdf') || anexo.tipo?.includes('pdf') || anexo.url.startsWith('data:application/pdf')
  const ehImagem = anexo.tipo?.startsWith('image/') || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(nomeLower) || anexo.url.startsWith('data:image/')
  const ehLink = anexo.tipo === 'link'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Cabecalho da Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 min-w-0 mr-4">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-base">
              {ehPdf && '📄'}
              {ehImagem && '🖼️'}
              {ehLink && '🔗'}
              {!ehPdf && !ehImagem && !ehLink && '📁'}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-100 truncate">{anexo.nome}</h3>
              <p className="text-[11px] text-slate-400">
                {anexo.tamanho} · Enviado em {anexo.dataUpload}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={anexo.url}
              target="_blank"
              rel="noreferrer"
              download={!ehLink ? anexo.nome : undefined}
              className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              📥 {ehLink ? 'Abrir Link' : 'Baixar Arquivo'}
            </a>
            <button
              type="button"
              onClick={onFechar}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all text-base leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Conteudo de Pre-visualizacao */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-950/60 flex items-center justify-center min-h-[50vh]">
          {ehPdf && (
            <iframe
              src={anexo.url}
              className="w-full h-[75vh] rounded-xl border border-slate-800 bg-slate-900 shadow-inner"
              title={anexo.nome}
            />
          )}

          {ehImagem && (
            <div className="flex items-center justify-center w-full h-full p-2">
              <img
                src={anexo.url}
                alt={anexo.nome}
                className="max-h-[75vh] max-w-full w-auto h-auto rounded-xl shadow-2xl border border-slate-800 object-contain"
              />
            </div>
          )}

          {ehLink && (
            <div className="p-8 text-center space-y-4 max-w-md bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-4xl">🔗</div>
              <div>
                <h4 className="text-base font-bold text-slate-100">{anexo.nome}</h4>
                <p className="text-xs text-slate-400 mt-1 break-all">{anexo.url}</p>
              </div>
              <a
                href={anexo.url}
                target="_blank"
                rel="noreferrer"
                className="inline-block px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-teal-500/20"
              >
                Abrir Link Externo
              </a>
            </div>
          )}

          {!ehPdf && !ehImagem && !ehLink && (
            <div className="p-8 text-center space-y-4 max-w-md bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-4xl">📁</div>
              <div>
                <h4 className="text-base font-bold text-slate-100">{anexo.nome}</h4>
                <p className="text-xs text-slate-400 mt-1">Pré-visualização direta indisponível para este tipo de arquivo.</p>
              </div>
              <a
                href={anexo.url}
                download={anexo.nome}
                className="inline-block px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Baixar para Visualizar
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
