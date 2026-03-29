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
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1e2d3d' }}>
              <span className="text-white font-bold">D</span>
            </div>
            <span className="font-bold text-lg" style={{ color: '#1e2d3d' }}>DAIRIA Conclusions</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/bibliotheque" className="text-sm font-medium hover:opacity-80" style={{ color: '#6b7280' }}>
              Bibliothèque
            </Link>
            <span className="text-sm" style={{ color: '#6b7280' }}>{userEmail}</span>
            <button onClick={handleLogout} className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Conclusions prud'homales</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>Générez vos conclusions en défense employeur avec l'IA</p>
          </div>
          <Link
            href="/conclusions/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm"
            style={{ backgroundColor: '#e8842c' }}
          >
            <span>+</span>
            Nouvelles conclusions
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: conclusions.length },
            { label: 'En cours', value: conclusions.filter(c => c.statut === 'en_cours').length },
            { label: 'Finalisés', value: conclusions.filter(c => c.statut === 'finalise').length },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-gray-100">
              <p className="text-sm mb-1" style={{ color: '#6b7280' }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ color: '#1e2d3d' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-semibold" style={{ color: '#1e2d3d' }}>Dossiers récents</h2>
          </div>

          {conclusions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>Aucune conclusion pour le moment</p>
              <Link
                href="/conclusions/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white text-sm"
                style={{ backgroundColor: '#e8842c' }}
              >
                Créer mes premières conclusions
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {conclusions.map(c => {
                const status = statusLabels[c.statut]
                return (
                  <Link
                    key={c.id}
                    href={`/conclusions/${c.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm mb-0.5" style={{ color: '#1e2d3d' }}>
                        {c.societe_info?.nom} c/ {c.salarie_info?.nom} {c.salarie_info?.prenom}
                      </p>
                      <p className="text-xs" style={{ color: '#6b7280' }}>
                        {c.juridiction} — RG {c.n_rg} — Concl. n°{c.numero_conclusions}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ color: status.color, backgroundColor: status.bg }}
                      >
                        {status.label}
                      </span>
                      <span className="text-xs" style={{ color: '#6b7280' }}>
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
