import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ConclusionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conclusion } = await supabase
    .from('conclusions')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!conclusion) notFound()

  const { data: chefs } = await supabase
    .from('conclusions_chefs')
    .select('*')
    .eq('conclusion_id', params.id)
    .order('ordre')

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    brouillon: { label: 'Brouillon', color: '#6b7280', bg: '#f3f4f6' },
    en_cours: { label: 'En cours', color: '#e8842c', bg: '#fef3ec' },
    finalise: { label: 'Finalisé', color: '#16a34a', bg: '#f0fdf4' },
  }

  const status = statusLabels[conclusion.statut] || statusLabels.brouillon

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: '#6b7280' }}>
            ← Tableau de bord
          </Link>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span className="text-sm font-medium" style={{ color: '#1e2d3d' }}>
            {conclusion.societe_info?.nom} c/ {conclusion.salarie_info?.nom}
          </span>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full ml-auto"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h1 className="text-lg font-bold mb-4" style={{ color: '#1e2d3d' }}>
            {conclusion.societe_info?.nom} c/ {conclusion.salarie_info?.civilite} {conclusion.salarie_info?.nom} {conclusion.salarie_info?.prenom}
          </h1>
          <div className="grid grid-cols-3 gap-4">
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
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h2 className="font-semibold text-sm" style={{ color: '#1e2d3d' }}>Chefs de demande</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {chefs.map(chef => (
                <div key={chef.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm" style={{ color: '#1e2d3d' }}>{chef.chef_demande}</p>
                    <span
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: chef.strategie === 'contester' ? '#eff6ff' : chef.strategie === 'conceder_partiellement' ? '#fef3ec' : '#f3f4f6',
                        color: chef.strategie === 'contester' ? '#1d4ed8' : chef.strategie === 'conceder_partiellement' ? '#e8842c' : '#6b7280',
                      }}
                    >
                      {chef.strategie === 'contester' ? 'Contesté' : chef.strategie === 'conceder_partiellement' ? 'Concédé partiellement' : 'Sans réponse'}
                    </span>
                  </div>
                  {chef.montant_demande && (
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
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
      <p className="text-xs mb-0.5" style={{ color: '#6b7280' }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: '#1e2d3d' }}>{value}</p>
    </div>
  )
}
