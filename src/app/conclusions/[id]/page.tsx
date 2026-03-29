import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ConclusionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conclusion } = await supabase
    .from('conclusions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!conclusion) notFound()

  const { data: chefs } = await supabase
    .from('conclusions_chefs')
    .select('*')
    .eq('conclusion_id', id)
    .order('ordre')

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    brouillon: { label: 'Brouillon', color: '#6b7280', bg: '#f3f4f6' },
    en_cours: { label: 'En cours', color: '#e8842c', bg: '#fef3ec' },
    finalise: { label: 'Finalisé', color: '#16a34a', bg: '#f0fdf4' },
  }

  const status = statusLabels[conclusion.statut] || statusLabels.brouillon

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      <header className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-semibold flex items-center gap-1.5" style={{ color: '#6b7280', textDecoration: 'none' }}>
            ← Tableau de bord
          </Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span className="text-sm font-semibold truncate" style={{ color: '#1e2d3d' }}>
            {conclusion.societe_info?.nom} c/ {conclusion.salarie_info?.nom}
          </span>
          <span
            className="badge ml-auto flex-shrink-0"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5">
        {/* Info card */}
        <div className="bg-white p-6 sm:p-8" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h1 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#1e2d3d' }}>
            {conclusion.societe_info?.nom} c/ {conclusion.salarie_info?.civilite} {conclusion.salarie_info?.nom} {conclusion.salarie_info?.prenom}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <InfoItem label="Juridiction" value={conclusion.juridiction} />
            <InfoItem label="N° RG" value={conclusion.n_rg} />
            <InfoItem label="Audience" value={conclusion.audience} />
            <InfoItem label="Conclusions n°" value={String(conclusion.numero_conclusions)} />
            <InfoItem label="Avocat adverse" value={conclusion.avocat_adverse?.nom || '-'} />
            <InfoItem label="Version" value={`v${conclusion.version}`} />
          </div>
        </div>

        {/* Chefs de demande */}
        {chefs && chefs.length > 0 && (
          <div className="bg-white overflow-hidden" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="px-6 sm:px-8 py-4 sm:py-5" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h2 className="font-bold text-base" style={{ color: '#1e2d3d' }}>Chefs de demande</h2>
            </div>
            <div className="divide-y" style={{ borderColor: '#f3f4f6' }}>
              {chefs.map(chef => (
                <div key={chef.id} className="px-6 sm:px-8 py-4 sm:py-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-sm sm:text-base" style={{ color: '#1e2d3d' }}>{chef.chef_demande}</p>
                    <span
                      className="badge flex-shrink-0"
                      style={{
                        backgroundColor: chef.strategie === 'contester' ? '#eff6ff' : chef.strategie === 'conceder_partiellement' ? '#fef3ec' : '#f3f4f6',
                        color: chef.strategie === 'contester' ? '#1d4ed8' : chef.strategie === 'conceder_partiellement' ? '#e8842c' : '#6b7280',
                      }}
                    >
                      {chef.strategie === 'contester' ? 'Contesté' : chef.strategie === 'conceder_partiellement' ? 'Concédé partiellement' : 'Sans réponse'}
                    </span>
                  </div>
                  {chef.montant_demande && (
                    <p className="text-sm mt-1.5 font-medium" style={{ color: '#6b7280' }}>
                      {chef.montant_demande.toLocaleString('fr-FR')} € demandés
                      {chef.montant_propose ? ` → ${chef.montant_propose.toLocaleString('fr-FR')} € proposés` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: '#9ca3af' }}>{label}</p>
      <p className="text-sm sm:text-base font-semibold" style={{ color: '#1e2d3d' }}>{value}</p>
    </div>
  )
}
