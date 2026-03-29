'use client'

import { useState } from 'react'
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
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Analyse des conclusions adverses</h2>
        <p className="text-base" style={{ color: '#6b7280' }}>L&apos;IA extrait les chefs de demande. Vérifiez et corrigez si nécessaire.</p>
      </div>

      {/* AI Analysis */}
      {!analysed && chefs.length === 0 && (
        <div className="bg-white p-10 text-center" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#1e2d3d' }}>Analyse par l&apos;IA</h3>
          <p className="text-base mb-8" style={{ color: '#6b7280' }}>
            {state.conclusionsAdversesText
              ? 'Les conclusions adverses sont prêtes à être analysées'
              : 'Aucune conclusion adverse uploadée — vous pouvez ajouter les chefs manuellement'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {state.conclusionsAdversesText && (
              <button
                onClick={analyseWithAI}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyse en cours…
                  </>
                ) : '🤖 Analyser avec l\'IA'}
              </button>
            )}
            <button
              onClick={() => setShowAddManual(true)}
              className="btn-secondary"
            >
              + Ajouter manuellement
            </button>
          </div>
        </div>
      )}

      {/* Chefs list */}
      {chefs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold" style={{ color: '#1e2d3d' }}>
              {chefs.length} chef{chefs.length > 1 ? 's' : ''} de demande identifié{chefs.length > 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setShowAddManual(!showAddManual)}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg border-2 transition-colors"
              style={{ color: '#e8842c', borderColor: '#e8842c' }}
            >
              + Ajouter
            </button>
          </div>

          {chefs.map((chef, i) => (
            <div key={chef.id || i} className="bg-white p-5" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              {editingIndex === i ? (
                <div className="space-y-3">
                  <select
                    value={chef.chef_demande}
                    onChange={e => updateChef(i, { chef_demande: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Saisir manuellement…</option>
                    {CHEFS_COMMUNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    value={chef.chef_demande}
                    onChange={e => updateChef(i, { chef_demande: e.target.value })}
                    className="form-input"
                    placeholder="Chef de demande"
                  />
                  <input
                    type="number"
                    value={chef.montant_demande || ''}
                    onChange={e => updateChef(i, { montant_demande: Number(e.target.value) })}
                    className="form-input"
                    placeholder="Montant demandé (€)"
                  />
                  <textarea
                    value={chef.arguments_adverses || ''}
                    onChange={e => updateChef(i, { arguments_adverses: e.target.value })}
                    className="form-input"
                    rows={3}
                    placeholder="Arguments adverses résumés…"
                  />
                  <button onClick={() => setEditingIndex(null)} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                    ✓ Valider
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: '#e8842c' }}>{i + 1}</span>
                      <p className="font-semibold text-base" style={{ color: '#1e2d3d' }}>{chef.chef_demande}</p>
                    </div>
                    {chef.montant_demande && (
                      <p className="text-sm ml-8 font-medium" style={{ color: '#e8842c' }}>
                        {chef.montant_demande.toLocaleString('fr-FR')} € demandés
                      </p>
                    )}
                    {chef.arguments_adverses && (
                      <p className="text-sm ml-8 mt-1" style={{ color: '#6b7280' }}>{chef.arguments_adverses}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => setEditingIndex(i)} className="text-sm px-2.5 py-1.5 rounded-lg border" style={{ color: '#6b7280', borderColor: '#d1d5db' }}>
                      ✏️
                    </button>
                    <button onClick={() => removeChef(i)} className="text-sm px-2.5 py-1.5 rounded-lg border" style={{ color: '#ef4444', borderColor: '#fca5a5' }}>
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
        <div className="bg-white p-6 space-y-4" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h4 className="font-bold text-base" style={{ color: '#1e2d3d' }}>Ajouter un chef de demande</h4>
          <div>
            <label className="form-label">Choisir dans la liste</label>
            <select
              value={newChef.chef_demande}
              onChange={e => setNewChef(prev => ({ ...prev, chef_demande: e.target.value }))}
              className="form-input"
            >
              <option value="">Choisir dans la liste…</option>
              {CHEFS_COMMUNS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Ou saisir manuellement</label>
            <input
              type="text"
              value={newChef.chef_demande}
              onChange={e => setNewChef(prev => ({ ...prev, chef_demande: e.target.value }))}
              className="form-input"
              placeholder="Chef de demande"
            />
          </div>
          <div>
            <label className="form-label">Montant demandé (€, optionnel)</label>
            <input
              type="number"
              value={newChef.montant_demande}
              onChange={e => setNewChef(prev => ({ ...prev, montant_demande: e.target.value }))}
              className="form-input"
              placeholder="Ex: 15 000"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={addManualChef} disabled={!newChef.chef_demande} className="btn-primary">
              Ajouter
            </button>
            <button onClick={() => setShowAddManual(false)} className="btn-secondary">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={onBack} className="btn-secondary">
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={chefs.length === 0}
          className="btn-primary"
        >
          Étape suivante →
        </button>
      </div>
    </div>
  )
}
