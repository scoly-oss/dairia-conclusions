'use client'

import { useState } from 'react'
import { WizardState } from '@/types'
import Link from 'next/link'

interface Props {
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
  conclusionId: string
}

export default function Step6Generation({ state, updateState, onBack, conclusionId }: Props) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [documentText, setDocumentText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/generate-conclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conclusion: state.conclusion,
          chefs: state.chefs,
          pieces: state.pieces,
          conclusionId,
        }),
      })

      const data = await response.json()
      if (data.document) {
        setDocumentText(data.document)
        updateState({ documentGenere: data.document })
        setGenerated(true)
      } else {
        setError('Erreur lors de la génération')
      }
    } catch (e) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = globalThis.document.createElement('a')
    a.href = url
    const societe = state.conclusion?.societe_info?.nom?.replace(/\s+/g, '_') || 'societe'
    const salarie = state.conclusion?.salarie_info?.nom?.replace(/\s+/g, '_') || 'salarie'
    a.download = `Conclusions_${societe}_c_${salarie}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Génération des conclusions</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>L'IA assemble les conclusions complètes prêtes à être déposées</p>
      </div>

      {!generated ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          {/* Summary */}
          <div className="mb-6 text-left max-w-sm mx-auto">
            <h3 className="font-semibold mb-3 text-sm text-center" style={{ color: '#1e2d3d' }}>Récapitulatif</h3>
            <div className="space-y-2">
              <SummaryRow label="Affaire" value={`${state.conclusion?.societe_info?.nom} c/ ${state.conclusion?.salarie_info?.nom} ${state.conclusion?.salarie_info?.prenom}`} />
              <SummaryRow label="Juridiction" value={state.conclusion?.juridiction || '-'} />
              <SummaryRow label="N° RG" value={state.conclusion?.n_rg || '-'} />
              <SummaryRow label="Chefs de demande" value={`${state.chefs.length} identifiés`} />
              <SummaryRow label="À contester" value={`${state.chefs.filter(c => c.strategie === 'contester').length}`} />
              <SummaryRow label="À concéder partiellement" value={`${state.chefs.filter(c => c.strategie === 'conceder_partiellement').length}`} />
              <SummaryRow label="Pièces" value={`${state.pieces.length} pièces`} />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="px-8 py-4 rounded-xl font-bold text-white text-base disabled:opacity-50"
            style={{ backgroundColor: '#e8842c' }}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération en cours... (60-90 secondes)
              </span>
            ) : '⚡ Générer les conclusions complètes'}
          </button>

          {loading && (
            <p className="text-xs mt-4" style={{ color: '#6b7280' }}>
              L'IA rédige vos conclusions selon la méthodologie DAIRIA...
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2"
              style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}
            >
              {copied ? '✓ Copié !' : '📋 Copier'}
            </button>
            <button
              onClick={downloadTxt}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#1e2d3d' }}
            >
              💾 Télécharger (.txt)
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: '#6b7280' }}
            >
              ← Retour au tableau de bord
            </Link>
          </div>

          {/* Document preview */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-sm" style={{ color: '#1e2d3d' }}>Prévisualisation des conclusions</h3>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                ✓ Généré
              </span>
            </div>
            <textarea
              value={documentText}
              onChange={e => setDocumentText(e.target.value)}
              className="w-full px-6 py-4 text-sm font-mono focus:outline-none resize-none"
              rows={40}
              style={{ color: '#1e2d3d', lineHeight: '1.8' }}
            />
          </div>
        </div>
      )}

      {!generated && (
        <div className="flex justify-start">
          <button onClick={onBack} className="px-6 py-3 rounded-lg font-semibold text-sm border-2" style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}>
            ← Retour
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span className="font-medium" style={{ color: '#1e2d3d' }}>{value}</span>
    </div>
  )
}
