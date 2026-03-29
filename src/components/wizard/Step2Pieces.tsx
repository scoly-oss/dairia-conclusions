'use client'

import { useState } from 'react'
import { WizardState, ConclusionPiece } from '@/types'

interface Props {
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
  conclusionId: string | null
}

export default function Step2Pieces({ state, updateState, onNext, onBack }: Props) {
  const [uploading, setUploading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractedPieceId, setExtractedPieceId] = useState<string | null>(null)

  const pieces = state.pieces || []

  const addPiece = (titre: string, type: ConclusionPiece['type'], fichier?: File) => {
    const numero = pieces.filter(p => p.type === type).length + 1
    const id = Date.now().toString()
    const newPiece: Partial<ConclusionPiece> = {
      id,
      numero,
      titre,
      type,
      fichier_url: fichier ? URL.createObjectURL(fichier) : undefined,
    }
    updateState({ pieces: [...pieces, newPiece] })
    return id
  }

  const removePiece = (id: string) => {
    updateState({ pieces: pieces.filter(p => p.id !== id) })
    if (extractedPieceId === id) {
      setExtractedPieceId(null)
      updateState({ conclusionsAdversesText: undefined })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: ConclusionPiece['type']) => {
    const files = e.target.files
    if (!files) return

    setUploading(true)
    for (const file of Array.from(files)) {
      addPiece(file.name.replace(/\.[^.]+$/, ''), type, file)
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleConclusionsAdverses = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setExtractError(null)
    const pieceId = addPiece(file.name.replace(/\.[^.]+$/, ''), 'conclusions_adverses', file)
    setUploading(false)
    e.target.value = ''

    // Extract text from the file
    setExtracting(true)
    try {
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const text = await file.text()
        updateState({ conclusionsAdversesText: text.slice(0, 50_000) })
        setExtractedPieceId(pieceId)
      } else if (file.name.endsWith('.docx')) {
        setExtractError('Format .docx non supporté. Convertissez en PDF ou TXT.')
      } else {
        const formData = new FormData()
        formData.append('file', file)
        const response = await fetch('/api/extract-text', { method: 'POST', body: formData })
        const data = await response.json()
        if (data.error) {
          setExtractError(data.error)
        } else if (data.text) {
          updateState({ conclusionsAdversesText: data.text })
          setExtractedPieceId(pieceId)
        }
      }
    } catch {
      setExtractError('Erreur lors de l\'extraction du texte')
    } finally {
      setExtracting(false)
    }
  }

  const piecesByType = {
    conclusions_adverses: pieces.filter(p => p.type === 'conclusions_adverses'),
    dossier: pieces.filter(p => p.type === 'dossier'),
    adverse: pieces.filter(p => p.type === 'adverse'),
  }

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Pièces du dossier</h2>
        <p className="text-base" style={{ color: '#6b7280' }}>Uploadez les conclusions adverses et les pièces du dossier</p>
      </div>

      {/* Conclusions adverses */}
      <div className="bg-white p-6" style={{ borderRadius: '14px', border: '2px dashed #e8842c', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
              Conclusions adverses <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              L&apos;IA analysera ce document pour extraire les chefs de demande
            </p>
          </div>
          <label className="btn-primary cursor-pointer text-sm" style={{ padding: '0.5rem 1rem' }}>
            {uploading ? 'Upload…' : '+ Ajouter'}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleConclusionsAdverses}
            />
          </label>
        </div>

        {extracting && (
          <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ backgroundColor: '#fef3ec' }}>
            <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" style={{ color: '#e8842c' }}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium" style={{ color: '#e8842c' }}>Extraction du texte en cours…</span>
          </div>
        )}

        {extractError && (
          <div className="mb-3 p-3 rounded-xl" style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
            <p className="text-sm" style={{ color: '#dc2626' }}>{extractError}</p>
          </div>
        )}

        {piecesByType.conclusions_adverses.length > 0 ? (
          <div className="space-y-2">
            {piecesByType.conclusions_adverses.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#fef3ec' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <span className="text-sm font-semibold" style={{ color: '#1e2d3d' }}>{p.titre}</span>
                  {extractedPieceId === p.id && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                      ✓ Texte extrait
                    </span>
                  )}
                </div>
                <button onClick={() => removePiece(p.id!)} className="text-sm w-6 h-6 rounded-full flex items-center justify-center hover:bg-orange-100" style={{ color: '#6b7280' }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Aucun fichier uploadé</p>
        )}
      </div>

      {/* Pièces dossier */}
      <PieceSection
        title="Pièces de notre dossier"
        subtitle="Contrats, courriers, attestations, etc."
        pieces={piecesByType.dossier}
        type="dossier"
        onUpload={handleFileUpload}
        onRemove={removePiece}
        onAddManual={(titre) => addPiece(titre, 'dossier')}
      />

      {/* Pièces adverses */}
      <PieceSection
        title="Pièces adverses"
        subtitle="Pièces communiquées par la partie adverse"
        pieces={piecesByType.adverse}
        type="adverse"
        onUpload={handleFileUpload}
        onRemove={removePiece}
        onAddManual={(titre) => addPiece(titre, 'adverse')}
      />

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary">
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="btn-primary"
        >
          Étape suivante →
        </button>
      </div>
    </div>
  )
}

function PieceSection({ title, subtitle, pieces, type, onUpload, onRemove, onAddManual }: {
  title: string
  subtitle: string
  pieces: Partial<ConclusionPiece>[]
  type: ConclusionPiece['type']
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, type: ConclusionPiece['type']) => void
  onRemove: (id: string) => void
  onAddManual: (titre: string) => void
}) {
  const [showManual, setShowManual] = useState(false)
  const [manualTitle, setManualTitle] = useState('')

  return (
    <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="card-title" style={{ marginBottom: '0.125rem' }}>{title}</h3>
          <p className="text-sm" style={{ color: '#6b7280' }}>{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManual(!showManual)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-colors"
            style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}
          >
            + Manuel
          </button>
          <label className="cursor-pointer px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#1e2d3d', borderRadius: '8px' }}>
            + Upload
            <input type="file" accept=".pdf,.docx" multiple className="hidden" onChange={e => onUpload(e, type)} />
          </label>
        </div>
      </div>

      {showManual && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={manualTitle}
            onChange={e => setManualTitle(e.target.value)}
            placeholder="Titre de la pièce"
            className="form-input flex-1"
          />
          <button
            onClick={() => { onAddManual(manualTitle); setManualTitle(''); setShowManual(false) }}
            disabled={!manualTitle}
            className="btn-primary"
            style={{ padding: '0.625rem 1rem' }}
          >
            Ajouter
          </button>
        </div>
      )}

      {pieces.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: '#9ca3af' }}>Aucune pièce ajoutée</p>
      ) : (
        <div className="space-y-2">
          {pieces.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#f9fafb' }}>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#1e2d3d' }}>
                  {i + 1}
                </span>
                <span className="text-sm font-medium" style={{ color: '#1e2d3d' }}>{p.titre}</span>
              </div>
              <button onClick={() => onRemove(p.id!)} className="text-sm w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200" style={{ color: '#9ca3af' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
