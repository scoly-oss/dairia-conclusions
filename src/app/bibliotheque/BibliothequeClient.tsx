'use client'

import { useState, useMemo } from 'react'
import { PartieDroit } from '@/types'

const THEMES = [
  { value: 'all', label: 'Tous' },
  { value: 'licenciement', label: 'Licenciement' },
  { value: 'harcelement', label: 'Harcèlement' },
  { value: 'discrimination', label: 'Discrimination' },
  { value: 'heures_supplementaires', label: 'Heures sup.' },
  { value: 'forfait_jours', label: 'Forfait jours' },
  { value: 'inaptitude', label: 'Inaptitude' },
  { value: 'prise_acte', label: 'Prise d\'acte' },
  { value: 'travail_dissimule', label: 'Travail dissimulé' },
  { value: 'article_700', label: 'Article 700' },
  { value: 'execution_provisoire', label: 'Exécution provisoire' },
]

interface Props {
  parties: PartieDroit[]
  onInsert?: (contenu: string, section: 'droit' | 'fait') => void
  insertMode?: boolean
}

export default function BibliothequeClient({ parties, onInsert, insertMode = false }: Props) {
  const [search, setSearch] = useState('')
  const [activeTheme, setActiveTheme] = useState('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return parties.filter(p => {
      const matchTheme = activeTheme === 'all' || p.theme === activeTheme
      if (!matchTheme) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return (
        p.titre.toLowerCase().includes(q) ||
        p.contenu.toLowerCase().includes(q) ||
        p.articles_loi.some(a => a.toLowerCase().includes(q)) ||
        p.jurisprudences.some(j => j.toLowerCase().includes(q))
      )
    })
  }, [parties, search, activeTheme])

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCopy = async (p: PartieDroit) => {
    await navigator.clipboard.writeText(p.contenu)
    setCopied(p.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const themeLabel = (theme: string) => {
    const found = THEMES.find(t => t.value === theme)
    return found ? found.label : theme
  }

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par mot-clé, article, jurisprudence…"
          className="form-input"
        />
        <div className="flex gap-2 flex-wrap">
          {THEMES.map(t => (
            <button
              key={t.value}
              onClick={() => setActiveTheme(t.value)}
              className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeTheme === t.value ? '#1e2d3d' : 'white',
                color: activeTheme === t.value ? 'white' : '#6b7280',
                border: `1.5px solid ${activeTheme === t.value ? '#1e2d3d' : '#e5e7eb'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm" style={{ color: '#6b7280' }}>
        {filtered.length} partie{filtered.length !== 1 ? 's' : ''} en droit
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white p-10 text-center" style={{ borderRadius: '14px', border: '1px solid #e5e7eb' }}>
          <p className="text-base" style={{ color: '#6b7280' }}>Aucun résultat pour cette recherche.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const isExpanded = expanded.has(p.id)
            return (
              <div
                key={p.id}
                className="bg-white"
                style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: '#fef3ec', color: '#e8842c' }}
                        >
                          {themeLabel(p.theme)}
                        </span>
                        {p.sous_theme && (
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                          >
                            {p.sous_theme.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-base" style={{ color: '#1e2d3d' }}>{p.titre}</h3>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {insertMode && onInsert ? (
                        <>
                          <button
                            onClick={() => onInsert(p.contenu, 'droit')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                            style={{ backgroundColor: '#1e2d3d', color: 'white' }}
                          >
                            → EN DROIT
                          </button>
                          <button
                            onClick={() => onInsert(p.contenu, 'fait')}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                            style={{ backgroundColor: '#e8842c', color: 'white' }}
                          >
                            → EN FAIT
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleCopy(p)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
                          style={{
                            backgroundColor: copied === p.id ? '#f0fdf4' : '#f3f4f6',
                            color: copied === p.id ? '#16a34a' : '#6b7280',
                            border: `1.5px solid ${copied === p.id ? '#16a34a' : '#e5e7eb'}`,
                          }}
                        >
                          {copied === p.id ? '✓ Copié' : 'Copier'}
                        </button>
                      )}
                      <button
                        onClick={() => toggle(p.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                        style={{ backgroundColor: '#f3f4f6', color: '#6b7280', border: '1.5px solid #e5e7eb' }}
                      >
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-1.5 flex-wrap">
                    {p.articles_loi.slice(0, 4).map(a => (
                      <span
                        key={a}
                        className="text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ backgroundColor: '#eff6ff', color: '#1d4ed8' }}
                      >
                        {a}
                      </span>
                    ))}
                    {p.jurisprudences.slice(0, 2).map(j => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded-lg font-medium"
                        style={{ backgroundColor: '#fdf4ff', color: '#7e22ce' }}
                      >
                        {j.length > 40 ? j.slice(0, 40) + '…' : j}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div
                    className="px-5 pb-5"
                    style={{ borderTop: '1px solid #f3f4f6' }}
                  >
                    <pre
                      className="text-sm mt-4 whitespace-pre-wrap leading-relaxed"
                      style={{ color: '#374151', fontFamily: 'inherit' }}
                    >
                      {p.contenu}
                    </pre>
                    {!insertMode && (
                      <button
                        onClick={() => handleCopy(p)}
                        className="mt-4 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                        style={{
                          backgroundColor: copied === p.id ? '#f0fdf4' : '#1e2d3d',
                          color: copied === p.id ? '#16a34a' : 'white',
                          border: copied === p.id ? '1.5px solid #16a34a' : 'none',
                        }}
                      >
                        {copied === p.id ? '✓ Copié dans le presse-papier' : 'Copier le texte'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
