'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PartieDroit } from '@/types'

const THEMES = [
  { value: '', label: 'Tous' },
  { value: 'licenciement', label: 'Licenciement' },
  { value: 'harcelement', label: 'Harcèlement' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'heures_supplementaires', label: 'Heures sup.' },
  { value: 'forfait_jours', label: 'Forfait jours' },
]

const THEME_COLORS: Record<string, { bg: string; color: string }> = {
  licenciement: { bg: '#eff6ff', color: '#1d4ed8' },
  harcelement: { bg: '#fdf4ff', color: '#7e22ce' },
  discrimination: { bg: '#fff7ed', color: '#c2410c' },
  heures_supplementaires: { bg: '#f0fdf4', color: '#15803d' },
  forfait_jours: { bg: '#fef3ec', color: '#e8842c' },
  article_700: { bg: '#f3f4f6', color: '#374151' },
  execution_provisoire: { bg: '#f3f4f6', color: '#374151' },
  prise_acte: { bg: '#fef9c3', color: '#a16207' },
  travail_dissimule: { bg: '#fff1f2', color: '#be123c' },
  inaptitude: { bg: '#ecfdf5', color: '#065f46' },
}

const THEME_LABELS: Record<string, string> = {
  licenciement: 'Licenciement',
  harcelement: 'Harcèlement',
  discrimination: 'Discrimination',
  heures_supplementaires: 'Heures sup.',
  forfait_jours: 'Forfait jours',
  article_700: 'Art. 700 CPC',
  execution_provisoire: 'Exéc. provisoire',
  prise_acte: "Prise d'acte",
  travail_dissimule: 'Travail dissimulé',
  inaptitude: 'Inaptitude',
}

interface Props {
  parties?: PartieDroit[]
  onInsert?: (contenu: string) => void
}

export default function BibliothequeClient({ parties: initialParties, onInsert }: Props) {
  const [parties, setParties] = useState<PartieDroit[]>(initialParties || [])
  const [search, setSearch] = useState('')
  const [activeTheme, setActiveTheme] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(!initialParties)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!initialParties) {
      const supabase = createClient()
      supabase
        .from('parties_droit')
        .select('*')
        .order('theme')
        .then(({ data }) => {
          if (data) setParties(data)
          setLoading(false)
        })
    }
  }, [initialParties])

  const filtered = parties.filter(p => {
    const matchTheme = !activeTheme || p.theme === activeTheme
    if (!matchTheme) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.titre.toLowerCase().includes(q) ||
      p.contenu.toLowerCase().includes(q) ||
      p.articles_loi.some(a => a.toLowerCase().includes(q)) ||
      p.jurisprudences.some(j => j.toLowerCase().includes(q))
    )
  })

  const handleCopy = (partie: PartieDroit) => {
    navigator.clipboard.writeText(partie.contenu)
    setCopied(partie.id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-sm" style={{ color: '#6b7280' }}>
        Chargement de la bibliothèque...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Rechercher par mot-clé, article, jurisprudence..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400"
        style={{ backgroundColor: 'white' }}
      />

      {/* Theme filters */}
      <div className="flex gap-2 flex-wrap">
        {THEMES.map(t => (
          <button
            key={t.value}
            onClick={() => setActiveTheme(t.value)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: activeTheme === t.value ? '#1e2d3d' : '#f3f4f6',
              color: activeTheme === t.value ? 'white' : '#6b7280',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs" style={{ color: '#6b7280' }}>
        {filtered.length} partie{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(p => {
          const themeStyle = THEME_COLORS[p.theme] || THEME_COLORS.article_700
          const isExpanded = expanded === p.id

          return (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: themeStyle.bg, color: themeStyle.color }}
                    >
                      {THEME_LABELS[p.theme] || p.theme}
                    </span>
                    {p.sous_theme && (
                      <span className="text-xs" style={{ color: '#6b7280' }}>
                        {p.sous_theme.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm" style={{ color: '#1e2d3d' }}>
                    {p.titre}
                  </h3>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {onInsert ? (
                    <button
                      onClick={() => onInsert(p.contenu)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium text-white"
                      style={{ backgroundColor: '#e8842c' }}
                    >
                      Insérer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCopy(p)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: copied === p.id ? '#f0fdf4' : '#f3f4f6',
                        color: copied === p.id ? '#15803d' : '#374151',
                      }}
                    >
                      {copied === p.id ? '✓ Copié' : 'Copier'}
                    </button>
                  )}
                </div>
              </div>

              {/* Content preview / expanded */}
              <div className="mb-3">
                <p
                  className="text-xs leading-relaxed whitespace-pre-line"
                  style={{ color: '#6b7280' }}
                >
                  {isExpanded ? p.contenu : `${p.contenu.slice(0, 220)}${p.contenu.length > 220 ? '…' : ''}`}
                </p>
                {p.contenu.length > 220 && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : p.id)}
                    className="text-xs mt-1 font-medium"
                    style={{ color: '#e8842c' }}
                  >
                    {isExpanded ? 'Réduire ↑' : 'Voir tout ↓'}
                  </button>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {p.articles_loi.slice(0, 4).map(a => (
                  <span key={a} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                    {a}
                  </span>
                ))}
                {p.jurisprudences.slice(0, 2).map(j => (
                  <span key={j} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                    {j.length > 35 ? `${j.slice(0, 35)}…` : j}
                  </span>
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#6b7280' }}>
              Aucune partie trouvée pour cette recherche
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
