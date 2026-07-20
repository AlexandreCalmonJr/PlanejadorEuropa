import { useState, useRef } from 'react'
import type { AnexoDocumento } from '../types'
import { gerarId } from '../helpers'
import { IconeLixeira } from './Icons'
import { DocumentPreviewModal } from './DocumentPreviewModal'

interface FileUploaderProps {
  anexos?: AnexoDocumento[]
  onAdicionarAnexo: (anexo: AnexoDocumento) => void
  onRemoverAnexo: (id: string) => void
}

export function FileUploader({ anexos = [], onAdicionarAnexo, onRemoverAnexo }: FileUploaderProps) {
  const [modoLink, setModoLink] = useState(false)
  const [nomeLink, setNomeLink] = useState('')
  const [urlLink, setUrlLink] = useState('')
  const [anexoPreview, setAnexoPreview] = useState<AnexoDocumento | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        const tamanhoKb = (file.size / 1024).toFixed(1)
        const novoAnexo: AnexoDocumento = {
          id: gerarId(),
          nome: file.name,
          tamanho: file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${tamanhoKb} KB`,
          tipo: file.type || 'application/octet-stream',
          url: result,
          dataUpload: new Date().toLocaleDateString('pt-BR'),
        }
        onAdicionarAnexo(novoAnexo)
      }
      reader.readAsDataURL(file)
    })

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleAdicionarLink = () => {
    if (!urlLink.trim()) return
    const novoAnexo: AnexoDocumento = {
      id: gerarId(),
      nome: nomeLink.trim() || 'Link Externo',
      tamanho: 'Web Link',
      tipo: 'link',
      url: urlLink.startsWith('http') ? urlLink : `https://${urlLink}`,
      dataUpload: new Date().toLocaleDateString('pt-BR'),
    }
    onAdicionarAnexo(novoAnexo)
    setNomeLink('')
    setUrlLink('')
    setModoLink(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Anexos e Documentos ({anexos.length})
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 transition-all font-medium flex items-center gap-1"
          >
            📎 Upload Arquivo
          </button>
          <button
            type="button"
            onClick={() => setModoLink(!modoLink)}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all font-medium flex items-center gap-1"
          >
            🔗 Add Link
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {modoLink && (
        <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
          <input
            type="text"
            placeholder="Nome do documento/link (ex: Certidão Apostilada)"
            value={nomeLink}
            onChange={e => setNomeLink(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="URL do link (https://...)"
              value={urlLink}
              onChange={e => setUrlLink(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={handleAdicionarLink}
              className="px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-all"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Lista de anexos */}
      {anexos.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {anexos.map(anexo => {
            const ehPdf = anexo.nome.toLowerCase().endsWith('.pdf') || anexo.tipo?.includes('pdf')
            const ehImagem = anexo.tipo?.startsWith('image/')
            const ehLink = anexo.tipo === 'link'

            return (
              <div
                key={anexo.id}
                className="flex items-center justify-between p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 text-sm">
                    {ehPdf && '📄'}
                    {ehImagem && '🖼️'}
                    {ehLink && '🔗'}
                    {!ehPdf && !ehImagem && !ehLink && '📁'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 font-medium truncate leading-tight">{anexo.nome}</p>
                    <p className="text-slate-500 text-[10px]">
                      {anexo.tamanho} · {anexo.dataUpload}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAnexoPreview(anexo)}
                    className="px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20 hover:bg-teal-500/20 font-semibold transition-all flex items-center gap-1"
                  >
                    👁 Prévia
                  </button>
                  <a
                    href={anexo.url}
                    target="_blank"
                    rel="noreferrer"
                    download={!ehLink ? anexo.nome : undefined}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all"
                  >
                    {ehLink ? 'Abrir' : 'Baixar'}
                  </a>
                  <button
                    type="button"
                    onClick={() => onRemoverAnexo(anexo.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-all opacity-80 group-hover:opacity-100"
                  >
                    <IconeLixeira />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-4 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
          Nenhum documento anexado ainda. Faça upload de PDFs/imagens ou insira links.
        </div>
      )}

      {/* Modal de Pre-visualizacao de Documento */}
      <DocumentPreviewModal
        anexo={anexoPreview}
        onFechar={() => setAnexoPreview(null)}
      />
    </div>
  )
}
