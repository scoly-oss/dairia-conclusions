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
    } catch {
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
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Génération des conclusions</h2>
        <p className="text-base" style={{ color: '#6b7280' }}>L&apos;IA assemble les conclusions complètes prêtes à être déposées</p>
      </div>

      {!generated ? (
        <div className="bg-white p-8 sm:p-10" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {/* Summary */}
          <div className="mb-8 max-w-sm mx-auto">
            <h3 className="font-bold text-base text-center mb-4" style={{ color: '#1e2d3d' }}>Récapitulatif du dossier</h3>
            <div className="space-y-2.5">
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
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary text-base"
              style={{ padding: '1rem 2.5rem' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Génération en cours… (60-90 sec)
                </>
              ) : '⚡ Générer les conclusions complètes'}
            </button>
          </div>

          {loading && (
            <p className="text-sm mt-5 text-center" style={{ color: '#6b7280' }}>
              L&apos;IA rédige vos conclusions selon la méthodologie DAIRIA…
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copyToClipboard}
              className="btn-secondary"
            >
              {copied ? '✓ Copié !' : '📋 Copier'}
            </button>
            <button
              onClick={downloadTxt}
              className="btn-primary"
            >
              💾 Télécharger (.txt)
            </button>
            <Link
              href="/dashboard"
              className="btn-secondary"
              style={{ textDecoration: 'none' }}
            >
              ← Tableau de bord
            </Link>
          </div>

          {/* Document preview */}
          <div className="bg-white overflow-hidden" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 className="font-bold text-base" style={{ color: '#1e2d3d' }}>Prévisualisation des conclusions</h3>
              <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                ✓ Généré
              </span>
            </div>
            <textarea
              value={documentText}
              onChange={e => setDocumentText(e.target.value)}
              className="w-full px-6 py-5 text-sm font-mono focus:outline-none resize-none"
              rows={40}
              style={{ color: '#1e2d3d', lineHeight: '1.9', backgroundColor: 'white' }}
            />
          </div>
        </div>
      )}

      {!generated && (
        <div className="flex justify-start pt-2">
          <button onClick={onBack} className="btn-secondary">
            ← Retour
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline text-sm gap-4">
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span className="font-semibold text-right" style={{ color: '#1e2d3d' }}>{value}</span>
    </div>
  )
}
