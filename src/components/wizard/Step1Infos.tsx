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
    <div className="space-y-5">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Informations du dossier</h2>
        <p className="text-base" style={{ color: '#6b7280' }}>Renseignez les informations de base pour identifier l&apos;affaire</p>
      </div>

      {/* Juridiction */}
      <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="card-title">Audience</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Juridiction *</label>
            <select
              value={c.juridiction || ''}
              onChange={e => updateConclusion('juridiction', e.target.value)}
              className="form-input"
            >
              <option value="">Sélectionner…</option>
              {JURIDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">N° RG *</label>
            <input
              type="text"
              value={c.n_rg || ''}
              onChange={e => updateConclusion('n_rg', e.target.value)}
              className="form-input"
              placeholder="24/01234"
            />
          </div>
          <div>
            <label className="form-label">Date d&apos;audience *</label>
            <input
              type="date"
              value={c.audience || ''}
              onChange={e => updateConclusion('audience', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">N° des conclusions</label>
            <select
              value={c.numero_conclusions || 1}
              onChange={e => updateConclusion('numero_conclusions', Number(e.target.value))}
              className="form-input"
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>Conclusions n°{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Société défenderesse */}
      <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="card-title">Société défenderesse (votre client)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Raison sociale *</label>
            <input
              type="text"
              value={c.societe_info?.nom || ''}
              onChange={e => updateSociete('nom', e.target.value)}
              className="form-input"
              placeholder="Société Martin"
            />
          </div>
          <div>
            <label className="form-label">Forme sociale</label>
            <select
              value={c.societe_info?.forme || 'SAS'}
              onChange={e => updateSociete('forme', e.target.value)}
              className="form-input"
            >
              {FORMES_SOCIALES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">SIREN</label>
            <input
              type="text"
              value={c.societe_info?.siren || ''}
              onChange={e => updateSociete('siren', e.target.value)}
              className="form-input"
              placeholder="123 456 789"
            />
          </div>
          <div>
            <label className="form-label">RCS</label>
            <input
              type="text"
              value={c.societe_info?.rcs || ''}
              onChange={e => updateSociete('rcs', e.target.value)}
              className="form-input"
              placeholder="Lyon B 123 456 789"
            />
          </div>
          <div>
            <label className="form-label">Siège social</label>
            <input
              type="text"
              value={c.societe_info?.siege || ''}
              onChange={e => updateSociete('siege', e.target.value)}
              className="form-input"
              placeholder="123 rue de la Paix, 69001 Lyon"
            />
          </div>
        </div>
      </div>

      {/* Salarié demandeur */}
      <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="card-title">Salarié demandeur (partie adverse)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Civilité</label>
            <select
              value={c.salarie_info?.civilite || 'M.'}
              onChange={e => updateSalarie('civilite', e.target.value)}
              className="form-input"
            >
              <option value="M.">M.</option>
              <option value="Mme">Mme</option>
            </select>
          </div>
          <div>
            <label className="form-label">Nom *</label>
            <input
              type="text"
              value={c.salarie_info?.nom || ''}
              onChange={e => updateSalarie('nom', e.target.value)}
              className="form-input"
              placeholder="DUPONT"
            />
          </div>
          <div>
            <label className="form-label">Prénom *</label>
            <input
              type="text"
              value={c.salarie_info?.prenom || ''}
              onChange={e => updateSalarie('prenom', e.target.value)}
              className="form-input"
              placeholder="Jean"
            />
          </div>
        </div>
      </div>

      {/* Avocat adverse */}
      <div className="bg-white p-6" style={{ borderRadius: '14px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <h3 className="card-title">Avocat adverse</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nom de l&apos;avocat</label>
            <input
              type="text"
              value={c.avocat_adverse?.nom || ''}
              onChange={e => updateAvocat('nom', e.target.value)}
              className="form-input"
              placeholder="Maître DURAND"
            />
          </div>
          <div>
            <label className="form-label">Barreau</label>
            <input
              type="text"
              value={c.avocat_adverse?.barreau || ''}
              onChange={e => updateAvocat('barreau', e.target.value)}
              className="form-input"
              placeholder="Lyon"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="btn-primary"
        >
          Étape suivante →
        </button>
      </div>
    </div>
  )
}
