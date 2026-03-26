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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Stratégie de défense</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>Définissez votre stratégie pour chaque chef de demande adverse</p>
      </div>

      <div className="space-y-4">
        {chefs.map((chef, i) => (
          <div key={chef.id || i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#e8842c' }}>{i + 1}</span>
                  <h3 className="font-semibold text-sm" style={{ color: '#1e2d3d' }}>{chef.chef_demande}</h3>
                </div>
                {chef.montant_demande && (
                  <p className="text-xs ml-7" style={{ color: '#e8842c' }}>
                    {chef.montant_demande.toLocaleString('fr-FR')} € demandés
                  </p>
                )}
              </div>
              <button
                onClick={() => suggestStrategy(i)}
                disabled={loadingAI === i}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: '#1e2d3d' }}
              >
                {loadingAI === i ? '⏳' : '🤖 IA'}
              </button>
            </div>

            {/* Strategy choice */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {STRATEGIES.map(s => (
                <button
                  key={s.value}
                  onClick={() => updateChef(i, { strategie: s.value as ConclusionChef['strategie'] })}
                  className="p-3 rounded-lg border-2 text-left transition-all"
                  style={{
                    borderColor: chef.strategie === s.value ? s.color : '#e5e7eb',
                    backgroundColor: chef.strategie === s.value ? `${s.color}10` : 'white',
                  }}
                >
                  <div className="text-lg mb-1">{s.icon}</div>
                  <div className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>{s.desc}</div>
                </button>
              ))}
            </div>

            {/* Force de l'argument (si contester) */}
            {chef.strategie === 'contester' && (
              <div className="mb-4">
                <p className="text-xs font-medium mb-2" style={{ color: '#6b7280' }}>Force de notre argument</p>
                <div className="flex gap-2">
                  {FORCES.map(f => (
                    <button
                      key={f.value}
                      onClick={() => updateChef(i, { force_argument: f.value as ConclusionChef['force_argument'] })}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
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

            {/* Montant proposé (si conceder partiellement) */}
            {chef.strategie === 'conceder_partiellement' && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#6b7280' }}>
                  Montant à proposer (€)
                </label>
                <input
                  type="number"
                  value={chef.montant_propose || ''}
                  onChange={e => updateChef(i, { montant_propose: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none max-w-xs"
                  placeholder="Ex: 3000"
                />
                {chef.montant_demande && chef.montant_propose && (
                  <p className="text-xs mt-1" style={{ color: '#16a34a' }}>
                    Réduction de {((1 - chef.montant_propose / chef.montant_demande) * 100).toFixed(0)}%
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

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
