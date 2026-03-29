'use client'

import { useState } from 'react'
import { WizardState, ConclusionChef } from '@/types'
import BibliothequeClient from '@/app/bibliotheque/BibliothequeClient'

interface Props {
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
  conclusionId: string | null
}

type BiblioTarget = { chefIndex: number; section: 'droit' | 'fait' } | null

export default function Step5Redaction({ state, updateState, onNext, onBack }: Props) {
  const [activeChef, setActiveChef] = useState(0)
  const [loadingSection, setLoadingSection] = useState<string | null>(null)
  const [biblioTarget, setBiblioTarget] = useState<BiblioTarget>(null)

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

  const handleInsertFromBiblio = (contenu: string) => {
    if (!biblioTarget) return
    const { chefIndex, section } = biblioTarget
    const field = section === 'droit' ? 'section_droit' : 'section_fait'
    const current = (chefs[chefIndex] as Partial<ConclusionChef>)[field] || ''
    updateChef(chefIndex, { [field]: current ? `${current}\n\n${contenu}` : contenu })
    setBiblioTarget(null)
  }

  if (chefs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Rédaction assistée</h2>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>
            Aucun chef de demande à contester. Passez à la génération.
          </p>
          <button onClick={onNext} className="px-6 py-3 rounded-lg font-semibold text-white text-sm" style={{ backgroundColor: '#e8842c' }}>
            Générer les conclusions →
          </button>
        </div>
        <div className="flex justify-start">
          <button onClick={onBack} className="px-6 py-3 rounded-lg font-semibold text-sm border-2" style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}>
            ← Retour
          </button>
        </div>
      </div>
    )
  }

  const currentChef = chefs[activeChef]

  return (
    <div className="space-y-6">
      {/* Bibliothèque modal */}
      {biblioTarget && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setBiblioTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-sm" style={{ color: '#1e2d3d' }}>
                  Bibliothèque juridique
                </h3>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  Insertion dans la section{' '}
                  <span className="font-medium">EN {biblioTarget.section.toUpperCase()}</span>
                  {' '}— {chefs[biblioTarget.chefIndex]?.chef_demande?.slice(0, 40)}
                </p>
              </div>
              <button
                onClick={() => setBiblioTarget(null)}
                className="text-sm font-medium px-3 py-1.5 rounded-lg"
                style={{ color: '#6b7280', backgroundColor: '#f3f4f6' }}
              >
                Fermer
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <BibliothequeClient onInsert={handleInsertFromBiblio} />
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Rédaction assistée</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>L'IA génère les sections EN DROIT et EN FAIT pour chaque chef contesté</p>
      </div>

      {/* Chef tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {chefs.map((chef, i) => (
          <button
            key={chef.id || i}
            onClick={() => setActiveChef(i)}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: activeChef === i ? '#1e2d3d' : 'white',
              color: activeChef === i ? 'white' : '#6b7280',
              border: `1px solid ${activeChef === i ? '#1e2d3d' : '#e5e7eb'}`,
            }}
          >
            {i + 1}. {chef.chef_demande?.slice(0, 30)}{(chef.chef_demande?.length || 0) > 30 ? '...' : ''}
          </button>
        ))}
      </div>

      {/* Current chef sections */}
      {currentChef && (
        <div className="space-y-4">
          {/* EN DROIT */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ color: '#1e2d3d' }}>
                EN DROIT — {currentChef.chef_demande}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setBiblioTarget({ chefIndex: activeChef, section: 'droit' })}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border"
                  style={{ color: '#1e2d3d', borderColor: '#d1d5db', backgroundColor: 'white' }}
                >
                  📚 Bibliothèque
                </button>
                <button
                  onClick={() => generateSection(activeChef, 'droit')}
                  disabled={loadingSection === `${activeChef}-droit`}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#e8842c' }}
                >
                  {loadingSection === `${activeChef}-droit` ? '⏳ Génération...' : '🤖 Générer'}
                </button>
              </div>
            </div>
            <textarea
              value={currentChef.section_droit || ''}
              onChange={e => updateChef(activeChef, { section_droit: e.target.value })}
              className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none"
              rows={10}
              placeholder="La section EN DROIT sera générée par l'IA ou peut être saisie manuellement.

Elle doit citer :
- Les articles du Code du travail applicables
- La jurisprudence de la Cour de cassation (Cass. soc.)
- Les principes juridiques favorables à l'employeur"
            />
          </div>

          {/* EN FAIT */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm" style={{ color: '#1e2d3d' }}>
                EN FAIT — {currentChef.chef_demande}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setBiblioTarget({ chefIndex: activeChef, section: 'fait' })}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border"
                  style={{ color: '#1e2d3d', borderColor: '#d1d5db', backgroundColor: 'white' }}
                >
                  📚 Bibliothèque
                </button>
                <button
                  onClick={() => generateSection(activeChef, 'fait')}
                  disabled={loadingSection === `${activeChef}-fait`}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: '#e8842c' }}
                >
                  {loadingSection === `${activeChef}-fait` ? '⏳ Génération...' : '🤖 Générer'}
                </button>
              </div>
            </div>
            <textarea
              value={currentChef.section_fait || ''}
              onChange={e => updateChef(activeChef, { section_fait: e.target.value })}
              className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none"
              rows={10}
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
              className="text-xs px-3 py-2 rounded-lg border disabled:opacity-30"
              style={{ color: '#6b7280', borderColor: '#d1d5db' }}
            >
              ← Chef précédent
            </button>
            <span className="text-xs" style={{ color: '#6b7280' }}>
              {activeChef + 1} / {chefs.length}
            </span>
            <button
              onClick={() => setActiveChef(Math.min(chefs.length - 1, activeChef + 1))}
              disabled={activeChef === chefs.length - 1}
              className="text-xs px-3 py-2 rounded-lg border disabled:opacity-30"
              style={{ color: '#6b7280', borderColor: '#d1d5db' }}
            >
              Chef suivant →
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
          className="px-6 py-3 rounded-lg font-semibold text-white text-sm"
          style={{ backgroundColor: '#e8842c' }}
        >
          Générer les conclusions →
        </button>
      </div>
    </div>
  )
}
