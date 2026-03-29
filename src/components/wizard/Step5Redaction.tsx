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

export default function Step5Redaction({ state, updateState, onNext, onBack }: Props) {
  const [activeChef, setActiveChef] = useState(0)
  const [loadingSection, setLoadingSection] = useState<string | null>(null)

  const chefs = state.chefs.filter(c => c.strategie === 'contester')

  const updateChef = (index: number, updates: Partial<ConclusionChef>) => {
    const allChefs = [...state.chefs]
    const realIndex = state.chefs.findIndex((c, i) => {
      let contestedCount = 0
      for (let j = 0; j < state.chefs.length; j++) {
        if (state.chefs[j].strategie === 'contester') {
          if (contestedCount === index) return j === i
          contestedCount++
        }
      }
      return false
    })
    if (realIndex !== -1) {
      allChefs[realIndex] = { ...allChefs[realIndex], ...updates }
      updateState({ chefs: allChefs })
    }
  }

  const generateSection = async (chefIndex: number, section: 'droit' | 'fait') => {
    const key = `${chefIndex}-${section}`
    setLoadingSection(key)
    try {
      const response = await fetch('/api/generate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chef: chefs[chefIndex],
          section,
          dossierInfo: state.conclusion,
          pieces: state.pieces,
        }),
      })
      const data = await response.json()
      if (data.content) {
        const field = section === 'droit' ? 'section_droit' : 'section_fait'
        updateChef(chefIndex, { [field]: data.content })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingSection(null)
    }
  }

  if (chefs.length === 0) {
    return (
      <div className="space-y-5">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Rédaction assistée</h2>
        </div>
        <div className="bg-white p-10 text-center" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-base mb-6" style={{ color: '#6b7280' }}>
            Aucun chef de demande à contester. Passez à la génération.
          </p>
          <button onClick={onNext} className="btn-primary">
            Générer les conclusions →
          </button>
        </div>
        <div className="flex justify-start">
          <button onClick={onBack} className="btn-secondary">
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  const currentChef = chefs[activeChef]

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Rédaction assistée</h2>
        <p className="text-base" style={{ color: '#6b7280' }}>L&apos;IA génère les sections EN DROIT et EN FAIT pour chaque chef contesté</p>
      </div>

      {/* Chef tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {chefs.map((chef, i) => (
          <button
            key={chef.id || i}
            onClick={() => setActiveChef(i)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: activeChef === i ? '#1e2d3d' : 'white',
              color: activeChef === i ? 'white' : '#6b7280',
              border: `1.5px solid ${activeChef === i ? '#1e2d3d' : '#e5e7eb'}`,
            }}
          >
            {i + 1}. {chef.chef_demande?.slice(0, 30)}{(chef.chef_demande?.length || 0) > 30 ? '…' : ''}
          </button>
        ))}
      </div>

      {/* Current chef sections */}
      {currentChef && (
        <div className="space-y-4">
          {/* EN DROIT */}
          <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base" style={{ color: '#1e2d3d' }}>EN DROIT</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>{currentChef.chef_demande}</p>
              </div>
              <button
                onClick={() => generateSection(activeChef, 'droit')}
                disabled={loadingSection === `${activeChef}-droit`}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem' }}
              >
                {loadingSection === `${activeChef}-droit` ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Génération…
                  </>
                ) : '🤖 Générer'}
              </button>
            </div>
            <textarea
              value={currentChef.section_droit || ''}
              onChange={e => updateChef(activeChef, { section_droit: e.target.value })}
              className="form-input"
              rows={12}
              placeholder="La section EN DROIT sera générée par l'IA ou peut être saisie manuellement.

Elle doit citer :
- Les articles du Code du travail applicables
- La jurisprudence de la Cour de cassation (Cass. soc.)
- Les principes juridiques favorables à l'employeur"
            />
          </div>

          {/* EN FAIT */}
          <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base" style={{ color: '#1e2d3d' }}>EN FAIT</h3>
                <p className="text-sm" style={{ color: '#6b7280' }}>{currentChef.chef_demande}</p>
              </div>
              <button
                onClick={() => generateSection(activeChef, 'fait')}
                disabled={loadingSection === `${activeChef}-fait`}
                className="btn-primary"
                style={{ padding: '0.5rem 1rem' }}
              >
                {loadingSection === `${activeChef}-fait` ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Génération…
                  </>
                ) : '🤖 Générer'}
              </button>
            </div>
            <textarea
              value={currentChef.section_fait || ''}
              onChange={e => updateChef(activeChef, { section_fait: e.target.value })}
              className="form-input"
              rows={12}
              placeholder="La section EN FAIT sera générée par l'IA ou peut être saisie manuellement.

Elle doit exposer :
- Les faits favorables à l'employeur
- La chronologie des événements
- Les pièces justificatives (Pièce n°X)"
            />
          </div>

          {/* Navigation between chefs */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveChef(Math.max(0, activeChef - 1))}
              disabled={activeChef === 0}
              className="text-sm px-4 py-2 rounded-xl border-2 font-semibold disabled:opacity-30 transition-colors"
              style={{ color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              ← Chef précédent
            </button>
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
              {activeChef + 1} / {chefs.length}
            </span>
            <button
              onClick={() => setActiveChef(Math.min(chefs.length - 1, activeChef + 1))}
              disabled={activeChef === chefs.length - 1}
              className="text-sm px-4 py-2 rounded-xl border-2 font-semibold disabled:opacity-30 transition-colors"
              style={{ color: '#6b7280', borderColor: '#e5e7eb' }}
            >
              Chef suivant →
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
          className="btn-primary"
        >
          Générer les conclusions →
        </button>
      </div>
    </div>
  )
}
