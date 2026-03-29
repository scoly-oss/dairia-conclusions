import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import BibliothequeClient from './BibliothequeClient'

export default async function BibliothequePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parties } = await supabase
    .from('parties_droit')
    .select('*')
    .order('theme')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#1e2d3d' }}
            >
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold text-base" style={{ color: '#1e2d3d' }}>
              DAIRIA Conclusions
            </span>
          </div>
          <span style={{ color: '#d1d5db' }}>|</span>
          <Link href="/dashboard" className="text-sm font-medium hover:opacity-80" style={{ color: '#6b7280' }}>
            Tableau de bord
          </Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span className="text-sm font-semibold" style={{ color: '#1e2d3d' }}>
            Bibliothèque
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>
            Bibliothèque juridique
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Parties en droit pré-rédigées — recherchez, consultez et copiez dans vos conclusions
          </p>
        </div>

        <BibliothequeClient parties={parties || []} />
      </main>
    </div>
  )
}
