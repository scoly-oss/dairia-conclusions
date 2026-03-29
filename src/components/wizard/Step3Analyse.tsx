'use client'

import { useState, useEffect, useRef } from 'react'
import { WizardState, ConclusionChef } from '@/types'

interface Props {
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
  conclusionId: string | null
}

const CHEFS_COMMUNS = [
  'Licenciement sans cause réelle et sérieuse',
  'Heures supplémentaires',
  'Harcèlement moral',
  'Harcèlement sexuel',
  'Discrimination',
  'Non-paiement du salaire',
  'Rappel de salaire',
  'Indemnité de licenciement',
  'Indemnité compensatrice de préavis',
  'Indemnité compensatrice de congés payés',
  'Dommages et intérêts',
  'Article 700 CPC',
  'Travail dissimulé',
  'Forfait jours nul',
  'Prise d\'acte',
  'Résiliation judiciaire',
]

export default function Step3Analyse({ state, updateState, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [analysed, setAnalysed] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [showAddManual, setShowAddManual] = useState(false)
  const [newChef, setNewChef] = useState({ chef_demande: '', montant_demande: '' })

  const chefs = state.chefs || []
  const autoTriggered = useRef(false)

  // Auto-trigger AI analysis when entering this step if text is available and no chefs yet
  useEffect(() => {
    if (
      !autoTriggered.current &&
      state.conclusionsAdversesText &&
      state.conclusionsAdversesText.trim().length > 0 &&
      chefs.length === 0
    ) {
      autoTriggered.current = true
      analyseWithAI()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const analyseWithAI = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analyse-conclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: state.conclusionsAdversesText || '',
          dossierInfo: state.conclusion,
        }),
      })

      const data = await response.json()
      if (data.chefs) {
        updateState({ chefs: data.chefs })
        setAnalysed(true)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const updateChef = (index: number, updates: Partial<ConclusionChef>) => {
    const updated = [...chefs]
    updated[index] = { ...updated[index], ...updates }
    updateState({ chefs: updated })
  }

  const removeChef = (index: number) => {
    updateState({ chefs: chefs.filter((_, i) => i !== index) })
  }

  const addManualChef = () => {
    if (!newChef.chef_demande) return
    const chef: Partial<ConclusionChef> = {
      id: Date.now().toString(),
      chef_demande: newChef.chef_demande,
      montant_demande: newChef.montant_demande ? Number(newChef.montant_demande) : undefined,
      strategie: 'contester',
      ordre: chefs.length + 1,
    }
    updateState({ chefs: [...chefs, chef] })
    setNewChef({ chef_demande: '', montant_demande: '' })
    setShowAddManual(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Analyse des conclusions adverses</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>L'IA extrait les chefs de demande. Vérifiez et corrigez si nécessaire.</p>
      </div>

      {/* AI Analysis */}
      {!analysed && chefs.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">{loading ? '⏳' : '🤖'}</div>
          <h3 className="font-semibold mb-2" style={{ color: '#1e2d3d' }}>
            {loading ? 'Analyse en cours...' : 'Analyse par l\'IA'}
          </h3>
          <p className="text-sm mb-6" style={{ color: '#6b7280' }}>
            {loading
              ? "Claude extrait les chefs de demande des conclusions adverses..."
              : state.conclusionsAdversesText
                ? "Les conclusions adverses sont prêtes à être analysées"
                : "Aucune conclusion adverse uploadée — vous pouvez ajouter les chefs manuellement"}
          </p>
          {loading && (
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8" style={{ color: '#e8842c' }} viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
          {!loading && (
            <div className="flex gap-3 justify-center">
              {state.conclusionsAdversesText && (
                <button
                  onClick={analyseWithAI}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-semibold text-white text-sm disabled:opacity-50"
                  style={{ backgroundColor: '#e8842c' }}
                >
                  🤖 Analyser avec l&apos;IA
                </button>
              )}
              <button
                onClick={() => setShowAddManual(true)}
                className="px-6 py-3 rounded-lg font-semibold text-sm border-2"
                style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}
              >
                + Ajouter manuellement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chefs list */}
      {chefs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: '#1e2d3d' }}>
              {chefs.length} chef{chefs.length > 1 ? 's' : ''} de demande identifié{chefs.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border"
              style={{ color: '#e8842c', borderColor: '#e8842c' }}
            >
              + Ajouter
            </button>
          </div>

          {chefs.map((chef, i) => (
            <div key={chef.id || i} className="bg-white rounded-xl border border-gray-100 p-4">
              {editingIndex === i ? (
                <div className="space-y-3">
                  <select
                    value={chef.chef_demande}
                    onChange={e => updateChef(i, { chef_demande: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="">Saisir manuellement...</option>
                    {CHEFS_COMMUNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    value={chef.chef_demande}
                    onChange={e => updateChef(i, { chef_demande: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Chef de demande"
                  />
                  <input
                    type="number"
                    value={chef.montant_demande || ''}
                    onChange={e => updateChef(i, { montant_demande: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    placeholder="Montant demandé (€)"
                  />
                  <textarea
                    value={chef.arguments_adverses || ''}
                    onChange={e => updateChef(i, { arguments_adverses: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    rows={3}
                    placeholder="Arguments adverses résumés..."
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingIndex(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#1e2d3d' }}>
                      ✓ Valider
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#e8842c' }}>{i + 1}</span>
                      <p className="font-medium text-sm" style={{ color: '#1e2d3d' }}>{chef.chef_demande}</p>
                    </div>
                    {chef.montant_demande && (
                      <p className="text-xs ml-7" style={{ color: '#e8842c' }}>
                        {chef.montant_demande.toLocaleString('fr-FR')} € demandés
                      </p>
                    )}
                    {chef.arguments_adverses && (
                      <p className="text-xs ml-7 mt-1" style={{ color: '#6b7280' }}>{chef.arguments_adverses}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => setEditingIndex(i)} className="text-xs px-2 py-1 rounded border" style={{ color: '#6b7280', borderColor: '#d1d5db' }}>
                      ✏️
                    </button>
                    <button onClick={() => removeChef(i)} className="text-xs px-2 py-1 rounded border" style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add manual */}
      {showAddManual && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h4 className="font-medium text-sm" style={{ color: '#1e2d3d' }}>Ajouter un chef de demande</h4>
          <select
            value={newChef.chef_demande}
            onChange={e => setNewChef(prev => ({ ...prev, chef_demande: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          >
            <option value="">Choisir dans la liste...</option>
            {CHEFS_COMMUNS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            value={newChef.chef_demande}
            onChange={e => setNewChef(prev => ({ ...prev, chef_demande: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            placeholder="Ou saisissez le chef de demande"
          />
          <input
            type="number"
            value={newChef.montant_demande}
            onChange={e => setNewChef(prev => ({ ...prev, montant_demande: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            placeholder="Montant demandé (€, optionnel)"
          />
          <div className="flex gap-2">
            <button onClick={addManualChef} disabled={!newChef.chef_demande} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: '#e8842c' }}>
              Ajouter
            </button>
            <button onClick={() => setShowAddManual(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: '#6b7280' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-6 py-3 rounded-lg font-semibold text-sm border-2" style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={chefs.length === 0}
          className="px-6 py-3 rounded-lg font-semibold text-white text-sm disabled:opacity-40"
          style={{ backgroundColor: '#e8842c' }}
        >
          Étape suivante →
        </button>
      </div>
    </div>
  )
}
