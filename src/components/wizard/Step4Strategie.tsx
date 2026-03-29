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

const STRATEGIES = [
  { value: 'contester', label: 'Contester', icon: '⚔️', desc: 'Contester ce chef de demande', color: '#1e2d3d' },
  { value: 'conceder_partiellement', label: 'Concéder partiellement', icon: '⚖️', desc: 'Proposer un montant réduit', color: '#e8842c' },
  { value: 'ne_pas_repondre', label: 'Ne pas répondre', icon: '🔇', desc: 'Pas de réponse stratégique', color: '#6b7280' },
]

const FORCES = [
  { value: 'fort', label: 'Fort', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'moyen', label: 'Moyen', color: '#d97706', bg: '#fffbeb' },
  { value: 'faible', label: 'Faible', color: '#dc2626', bg: '#fef2f2' },
]

export default function Step4Strategie({ state, updateState, onNext, onBack }: Props) {
  const chefs = state.chefs || []

  const updateChef = (index: number, updates: Partial<ConclusionChef>) => {
    const updated = [...chefs]
    updated[index] = { ...updated[index], ...updates }
    updateState({ chefs: updated })
  }

  const [loadingAI, setLoadingAI] = useState<number | null>(null)

  const suggestStrategy = async (index: number) => {
    setLoadingAI(index)
    try {
      const response = await fetch('/api/suggest-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chef: chefs[index],
          dossierInfo: state.conclusion,
        }),
      })
      const data = await response.json()
      if (data.strategie) {
        updateChef(index, {
          strategie: data.strategie,
          force_argument: data.force_argument,
          montant_propose: data.montant_propose,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingAI(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Stratégie de défense</h2>
        <p className="text-base" style={{ color: '#6b7280' }}>Définissez votre stratégie pour chaque chef de demande adverse</p>
      </div>

      <div className="space-y-4">
        {chefs.map((chef, i) => (
          <div key={chef.id || i} className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold text-white flex-shrink-0" style={{ backgroundColor: '#e8842c' }}>{i + 1}</span>
                  <h3 className="font-bold text-base" style={{ color: '#1e2d3d' }}>{chef.chef_demande}</h3>
                </div>
                {chef.montant_demande && (
                  <p className="text-sm ml-8 font-semibold" style={{ color: '#e8842c' }}>
                    {chef.montant_demande.toLocaleString('fr-FR')} € demandés
                  </p>
                )}
              </div>
              <button
                onClick={() => suggestStrategy(i)}
                disabled={loadingAI === i}
                className="text-sm px-3 py-2 rounded-xl font-semibold text-white disabled:opacity-50 flex items-center gap-1.5"
                style={{ backgroundColor: '#1e2d3d' }}
              >
                {loadingAI === i ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    IA…
                  </>
                ) : '🤖 Suggérer'}
              </button>
            </div>

            {/* Strategy choice */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {STRATEGIES.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateChef(i, { strategie: s.value as ConclusionChef['strategie'] })}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: chef.strategie === s.value ? s.color : '#e5e7eb',
                    backgroundColor: chef.strategie === s.value ? `${s.color}10` : 'white',
                    boxShadow: chef.strategie === s.value ? `0 2px 8px ${s.color}20` : 'none',
                  }}
                >
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-sm font-bold" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Force de l'argument */}
            {chef.strategie === 'contester' && (
              <div>
                <p className="form-label">Force de notre argument</p>
                <div className="flex gap-2 flex-wrap">
                  {FORCES.map(f => (
                    <button
                      key={f.value}
                      onClick={() => updateChef(i, { force_argument: f.value as ConclusionChef['force_argument'] })}
                      className="px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all"
                      style={{
                        backgroundColor: chef.force_argument === f.value ? f.bg : 'white',
                        color: chef.force_argument === f.value ? f.color : '#9ca3af',
                        borderColor: chef.force_argument === f.value ? f.color : '#e5e7eb',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Montant proposé */}
            {chef.strategie === 'conceder_partiellement' && (
              <div>
                <label className="form-label">Montant à proposer (€)</label>
                <input
                  type="number"
                  value={chef.montant_propose || ''}
                  onChange={e => updateChef(i, { montant_propose: Number(e.target.value) })}
                  className="form-input max-w-xs"
                  placeholder="Ex: 3 000"
                />
                {chef.montant_demande && chef.montant_propose && (
                  <p className="text-sm mt-2 font-medium" style={{ color: '#16a34a' }}>
                    ↓ Réduction de {((1 - chef.montant_propose / chef.montant_demande) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

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
