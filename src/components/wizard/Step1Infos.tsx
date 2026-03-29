'use client'

import { WizardState } from '@/types'

const JURIDICTIONS = [
  'CPH Lyon', 'CPH Paris', 'CPH Marseille', 'CPH Bordeaux',
  'CPH Nantes', 'CPH Lille', 'CPH Strasbourg', 'CPH Toulouse',
  'CPH Nice', 'CPH Rennes', 'CPH Grenoble', 'CPH Montpellier',
]

const FORMES_SOCIALES = ['SAS', 'SASU', 'SARL', 'SA', 'SNC', 'EURL', 'SCI', 'Association']

interface Props {
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step1Infos({ state, updateState, onNext }: Props) {
  const c = state.conclusion

  const updateConclusion = (field: string, value: unknown) => {
    updateState({ conclusion: { ...state.conclusion, [field]: value } })
  }

  const updateSociete = (field: string, value: string) => {
    updateConclusion('societe_info', { ...c.societe_info, [field]: value })
  }

  const updateSalarie = (field: string, value: string) => {
    updateConclusion('salarie_info', { ...c.salarie_info, [field]: value })
  }

  const updateAvocat = (field: string, value: string) => {
    updateConclusion('avocat_adverse', { ...c.avocat_adverse, [field]: value })
  }

  const isValid = c.juridiction && c.n_rg && c.audience &&
    c.societe_info?.nom && c.salarie_info?.nom && c.salarie_info?.prenom

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Informations du dossier</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>Renseignez les informations de base pour identifier l'affaire</p>
      </div>

      {/* Juridiction */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: '#1e2d3d' }}>Audience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Juridiction *</label>
            <select
              value={c.juridiction || ''}
              onChange={e => updateConclusion('juridiction', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            >
              <option value="">Sélectionner...</option>
              {JURIDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>N° RG *</label>
            <input
              type="text"
              value={c.n_rg || ''}
              onChange={e => updateConclusion('n_rg', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="24/01234"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Date d'audience *</label>
            <input
              type="date"
              value={c.audience || ''}
              onChange={e => updateConclusion('audience', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>N° des conclusions</label>
            <select
              value={c.numero_conclusions || 1}
              onChange={e => updateConclusion('numero_conclusions', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Conclusions n°{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Société défenderesse */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: '#1e2d3d' }}>Société défenderesse (votre client)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Raison sociale *</label>
            <input
              type="text"
              value={c.societe_info?.nom || ''}
              onChange={e => updateSociete('nom', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="Société Martin"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Forme sociale</label>
            <select
              value={c.societe_info?.forme || 'SAS'}
              onChange={e => updateSociete('forme', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            >
              {FORMES_SOCIALES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>SIREN</label>
            <input
              type="text"
              value={c.societe_info?.siren || ''}
              onChange={e => updateSociete('siren', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="123 456 789"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>RCS</label>
            <input
              type="text"
              value={c.societe_info?.rcs || ''}
              onChange={e => updateSociete('rcs', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="Lyon B 123 456 789"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Siège social</label>
            <input
              type="text"
              value={c.societe_info?.siege || ''}
              onChange={e => updateSociete('siege', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="123 rue de la Paix, 69001 Lyon"
            />
          </div>
        </div>
      </div>

      {/* Salarié demandeur */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: '#1e2d3d' }}>Salarié demandeur (partie adverse)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Civilité</label>
            <select
              value={c.salarie_info?.civilite || 'M.'}
              onChange={e => updateSalarie('civilite', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
            >
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Nom *</label>
            <input
              type="text"
              value={c.salarie_info?.nom || ''}
              onChange={e => updateSalarie('nom', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="DUPONT"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Prénom *</label>
            <input
              type="text"
              value={c.salarie_info?.prenom || ''}
              onChange={e => updateSalarie('prenom', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="Jean"
            />
          </div>
        </div>
      </div>

      {/* Avocat adverse */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold mb-4 text-sm" style={{ color: '#1e2d3d' }}>Avocat adverse</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Nom de l'avocat</label>
            <input
              type="text"
              value={c.avocat_adverse?.nom || ''}
              onChange={e => updateAvocat('nom', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="Maître DURAND"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6b7280' }}>Barreau</label>
            <input
              type="text"
              value={c.avocat_adverse?.barreau || ''}
              onChange={e => updateAvocat('barreau', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none"
              placeholder="Lyon"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-3 rounded-lg font-semibold text-white text-sm disabled:opacity-40"
          style={{ backgroundColor: '#e8842c' }}
        >
          Étape suivante →
        </button>
      </div>
    </div>
  )
}
