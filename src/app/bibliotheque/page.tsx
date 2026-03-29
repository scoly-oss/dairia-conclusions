import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PartieDroit } from '@/types'
import BibliothequeClient from './BibliothequeClient'

export const metadata = {
  title: 'Bibliothèque — DAIRIA Conclusions',
}

export default async function BibliotequePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parties } = await supabase
    .from('parties_droit')
    .select('*')
    .order('theme')
    .returns<PartieDroit[]>()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      {/* Header */}
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1e2d3d' }}>
              <span className="text-white font-bold text-base">D</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-base" style={{ color: '#1e2d3d' }}>DAIRIA</span>
              <span className="font-semibold text-base ml-1.5" style={{ color: '#e8842c' }}>Conclusions</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold transition-colors"
              style={{ color: '#6b7280' }}
            >
              ← Tableau de bord
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: '#1e2d3d' }}>
            📚 Bibliothèque de parties en droit
          </h1>
          <p className="text-base" style={{ color: '#6b7280' }}>
            Parties en droit pré-rédigées — copiez et insérez dans vos conclusions
          </p>
        </div>

        <BibliothequeClient parties={parties ?? []} />
      </main>
    </div>
  )
}
