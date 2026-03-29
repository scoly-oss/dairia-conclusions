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
  const [extractError, setExtractError] = useState<string | null>(null)

  const pieces = state.pieces || []

  const addPiece = (titre: string, type: ConclusionPiece['type'], fichier?: File) => {
    const numero = pieces.filter(p => p.type === type).length + 1
    const newPiece: Partial<ConclusionPiece> = {
      id: Date.now().toString(),
      numero,
      titre,
      type,
      fichier_url: fichier ? URL.createObjectURL(fichier) : undefined,
    }
    updateState({ pieces: [...pieces, newPiece] })
  }

  const removePiece = (id: string) => {
    updateState({ pieces: pieces.filter(p => p.id !== id) })
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
    addPiece(file.name.replace(/\.[^.]+$/, ''), 'conclusions_adverses', file)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/extract-text', { method: 'POST', body: formData })
      const data = await res.json()

      if (data.text) {
        updateState({ conclusionsAdversesText: data.text })
      } else {
        setExtractError(data.error || 'Erreur lors de l\'extraction du texte')
        updateState({ conclusionsAdversesText: '' })
      }
    } catch {
      setExtractError('Impossible d\'extraire le texte. Vérifiez votre connexion.')
      updateState({ conclusionsAdversesText: '' })
    }

    setUploading(false)
    e.target.value = ''
  }

  const piecesByType = {
    conclusions_adverses: pieces.filter(p => p.type === 'conclusions_adverses'),
    dossier: pieces.filter(p => p.type === 'dossier'),
    adverse: pieces.filter(p => p.type === 'adverse'),
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Pièces du dossier</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>Uploadez les conclusions adverses et les pièces du dossier</p>
      </div>

      {/* Conclusions adverses */}
      <div className="bg-white rounded-xl border-2 border-dashed p-6" style={{ borderColor: '#e8842c' }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold mb-1 text-sm" style={{ color: '#1e2d3d' }}>
              Conclusions adverses <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
              L'IA analysera ce document pour extraire les chefs de demande
            </p>
          </div>
          <label className="cursor-pointer px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ backgroundColor: '#e8842c' }}>
            {uploading ? 'Upload...' : '+ Ajouter'}
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleConclusionsAdverses}
            />
          </label>
        </div>

        {extractError && (
          <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-600">{extractError}</p>
          </div>
        )}

        {uploading && (
          <div className="mb-3 flex items-center gap-2 text-xs" style={{ color: '#e8842c' }}>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Extraction du texte en cours...
          </div>
        )}

        {piecesByType.conclusions_adverses.length > 0 ? (
          <div className="space-y-2">
            {piecesByType.conclusions_adverses.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#fef3ec' }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📄</span>
                  <span className="text-sm font-medium" style={{ color: '#1e2d3d' }}>{p.titre}</span>
                  {state.conclusionsAdversesText && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                      ✓ Texte extrait
                    </span>
                  )}
                </div>
                <button onClick={() => removePiece(p.id!)} className="text-xs" style={{ color: '#6b7280' }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-center py-4" style={{ color: '#9ca3af' }}>Aucun fichier uploadé</p>
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

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 rounded-lg font-semibold text-sm border-2" style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 rounded-lg font-semibold text-white text-sm"
          style={{ backgroundColor: '#e8842c' }}
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
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold mb-0.5 text-sm" style={{ color: '#1e2d3d' }}>{title}</h3>
          <p className="text-xs" style={{ color: '#6b7280' }}>{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManual(!showManual)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border"
            style={{ color: '#1e2d3d', borderColor: '#d1d5db' }}
          >
            + Manuel
          </button>
          <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: '#1e2d3d' }}>
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
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
          />
          <button
            onClick={() => { onAddManual(manualTitle); setManualTitle(''); setShowManual(false) }}
            disabled={!manualTitle}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: '#e8842c' }}
          >
            Ajouter
          </button>
        </div>
      )}

      {pieces.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: '#9ca3af' }}>Aucune pièce ajoutée</p>
      ) : (
        <div className="space-y-2">
          {pieces.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#1e2d3d' }}>
                  {i + 1}
                </span>
                <span className="text-sm" style={{ color: '#1e2d3d' }}>{p.titre}</span>
              </div>
              <button onClick={() => onRemove(p.id!)} className="text-xs" style={{ color: '#9ca3af' }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
