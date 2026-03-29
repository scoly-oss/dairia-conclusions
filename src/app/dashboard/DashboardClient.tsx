'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Conclusion } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const statusLabels = {
  brouillon: { label: 'Brouillon', color: '#6b7280', bg: '#f3f4f6' },
  en_cours: { label: 'En cours', color: '#e8842c', bg: '#fef3ec' },
  finalise: { label: 'Finalisé', color: '#16a34a', bg: '#f0fdf4' },
}

export default function DashboardClient({ conclusions, userEmail }: { conclusions: Conclusion[], userEmail: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1e2d3d' }}>
              <span className="text-white font-bold text-base">D</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base" style={{ color: '#1e2d3d' }}>DAIRIA</span>
              <span className="font-semibold text-base ml-1.5" style={{ color: '#e8842c' }}>Conclusions</span>
            </div>
            <div className="sm:hidden">
              <span className="font-bold text-base" style={{ color: '#1e2d3d' }}>DAIRIA Conclusions</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:block text-sm" style={{ color: '#6b7280' }}>{userEmail}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#6b7280' }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#1e2d3d' }}>
              Conclusions prud&apos;homales
            </h1>
            <p className="text-base" style={{ color: '#6b7280' }}>
              Générez vos conclusions en défense employeur avec l&apos;IA
            </p>
          </div>
          <Link
            href="/conclusions/new"
            className="btn-primary self-start sm:self-auto"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-lg leading-none">+</span>
            Nouvelles conclusions
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-5 mb-8">
          {[
            { label: 'Total', value: conclusions.length, icon: '📁' },
            { label: 'En cours', value: conclusions.filter(c => c.statut === 'en_cours').length, icon: '⚡', accent: '#e8842c' },
            { label: 'Finalisés', value: conclusions.filter(c => c.statut === 'finalise').length, icon: '✅', accent: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-4 sm:p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-medium" style={{ color: '#6b7280' }}>{stat.label}</p>
                <span className="hidden sm:block text-lg">{stat.icon}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: stat.accent || '#1e2d3d' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Conclusions list */}
        <div className="bg-white overflow-hidden" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div className="px-5 sm:px-7 py-4 sm:py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
            <h2 className="text-base font-bold" style={{ color: '#1e2d3d' }}>Dossiers récents</h2>
          </div>

          {conclusions.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-5xl mb-5">📋</div>
              <p className="text-base font-medium mb-2" style={{ color: '#1e2d3d' }}>Aucune conclusion pour le moment</p>
              <p className="text-sm mb-6" style={{ color: '#6b7280' }}>Commencez par créer votre premier dossier</p>
              <Link
                href="/conclusions/new"
                className="btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <span>+</span> Créer mes premières conclusions
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
              {conclusions.map(c => {
                const status = statusLabels[c.statut]
                return (
                  <Link
                    key={c.id}
                    href={`/conclusions/${c.id}`}
                    className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 transition-colors hover:bg-gray-50"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="font-semibold text-sm sm:text-base mb-0.5 truncate" style={{ color: '#1e2d3d' }}>
                        {c.societe_info?.nom} <span style={{ color: '#6b7280' }}>c/</span> {c.salarie_info?.nom} {c.salarie_info?.prenom}
                      </p>
                      <p className="text-xs sm:text-sm truncate" style={{ color: '#6b7280' }}>
                        {c.juridiction} — RG {c.n_rg} — Concl. n°{c.numero_conclusions}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                      <span
                        className="badge"
                        style={{ color: status.color, backgroundColor: status.bg }}
                      >
                        {status.label}
                      </span>
                      <span className="hidden sm:block text-sm" style={{ color: '#9ca3af' }}>
                        {format(new Date(c.created_at), 'd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
