'use client'

import { useState } from 'react'
import { WizardState, ConclusionChef, ConclusionPiece } from '@/types'
import Step1Infos from '@/components/wizard/Step1Infos'
import Step2Pieces from '@/components/wizard/Step2Pieces'
import Step3Analyse from '@/components/wizard/Step3Analyse'
import Step4Strategie from '@/components/wizard/Step4Strategie'
import Step5Redaction from '@/components/wizard/Step5Redaction'
import Step6Generation from '@/components/wizard/Step6Generation'
import WizardHeader from '@/components/wizard/WizardHeader'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { id: 1, label: 'Informations', short: '1' },
  { id: 2, label: 'Pièces', short: '2' },
  { id: 3, label: 'Analyse', short: '3' },
  { id: 4, label: 'Stratégie', short: '4' },
  { id: 5, label: 'Rédaction', short: '5' },
  { id: 6, label: 'Génération', short: '6' },
]

const initialState: WizardState = {
  step: 1,
  conclusion: {
    juridiction: '',
    n_rg: '',
    audience: '',
    numero_conclusions: 1,
    statut: 'brouillon',
    societe_info: { nom: '', forme: 'SAS', rcs: '', siren: '', siege: '' },
    salarie_info: { civilite: 'M.', nom: '', prenom: '' },
    avocat_adverse: { nom: '', barreau: '' },
  },
  chefs: [],
  pieces: [],
}

// Demo dossier : licenciement abusif fictif
const DEMO_CHEFS: Partial<ConclusionChef>[] = [
  {
    id: 'demo-1',
    conclusion_id: '',
    chef_demande: 'Licenciement sans cause réelle et sérieuse',
    montant_demande: 45000,
    strategie: 'contester',
    force_argument: 'fort',
    ordre: 1,
    arguments_adverses: 'Le salarié soutient que les motifs de licenciement pour insuffisance professionnelle sont fictifs et constituent un prétexte pour dissimuler une discrimination.',
  },
  {
    id: 'demo-2',
    conclusion_id: '',
    chef_demande: 'Rappel de salaire — heures supplémentaires non rémunérées',
    montant_demande: 8500,
    strategie: 'contester',
    force_argument: 'moyen',
    ordre: 2,
    arguments_adverses: 'Le salarié prétend avoir accompli 3 heures supplémentaires par semaine non rémunérées sur une période de 3 ans.',
  },
  {
    id: 'demo-3',
    conclusion_id: '',
    chef_demande: 'Indemnité compensatrice de préavis',
    montant_demande: 5200,
    strategie: 'conceder_partiellement',
    montant_propose: 5200,
    ordre: 3,
  },
  {
    id: 'demo-4',
    conclusion_id: '',
    chef_demande: 'Dommages et intérêts pour préjudice moral',
    montant_demande: 15000,
    strategie: 'contester',
    force_argument: 'fort',
    ordre: 4,
    arguments_adverses: 'Le salarié invoque un syndrome anxio-dépressif réactionnel consécutif aux conditions de rupture du contrat.',
  },
  {
    id: 'demo-5',
    conclusion_id: '',
    chef_demande: 'Article 700 du Code de procédure civile',
    montant_demande: 3000,
    strategie: 'contester',
    force_argument: 'moyen',
    ordre: 5,
  },
]

const DEMO_PIECES: Partial<ConclusionPiece>[] = [
  { id: 'p-1', conclusion_id: '', numero: 1, titre: 'Contrat de travail du 15 mars 2018', type: 'dossier' },
  { id: 'p-2', conclusion_id: '', numero: 2, titre: 'Lettre de licenciement du 10 janvier 2024', type: 'dossier' },
  { id: 'p-3', conclusion_id: '', numero: 3, titre: 'Comptes-rendus d\'entretiens annuels 2021, 2022 et 2023', type: 'dossier' },
  { id: 'p-4', conclusion_id: '', numero: 4, titre: 'Emails de mise en garde et relances adressés au salarié (sept. à déc. 2023)', type: 'dossier' },
  { id: 'p-5', conclusion_id: '', numero: 5, titre: 'Plan d\'amélioration des performances signé le 5 juin 2023', type: 'dossier' },
  { id: 'p-6', conclusion_id: '', numero: 6, titre: 'Convocation à l\'entretien préalable du 20 décembre 2023', type: 'dossier' },
  { id: 'p-a1', conclusion_id: '', numero: 1, titre: 'Attestation Pôle Emploi', type: 'adverse' },
  { id: 'p-a2', conclusion_id: '', numero: 2, titre: 'Bulletins de salaire 2023', type: 'adverse' },
]

const DEMO_STATE: WizardState = {
  step: 6,
  conclusion: {
    juridiction: 'Conseil de Prud\'hommes de Lyon',
    n_rg: '24/01234',
    audience: '2026-04-15',
    numero_conclusions: 1,
    statut: 'en_cours',
    societe_info: {
      nom: 'LOGISTIQUE RHÔNE-ALPES',
      forme: 'SAS',
      rcs: 'Lyon',
      siren: '512 345 678',
      siege: '10 rue de la République, 69001 Lyon',
    },
    salarie_info: {
      civilite: 'M.',
      nom: 'MARTIN',
      prenom: 'Jean-Pierre',
    },
    avocat_adverse: {
      nom: 'Maître DUPONT',
      barreau: 'Lyon',
    },
  },
  chefs: DEMO_CHEFS,
  pieces: DEMO_PIECES,
}

export default function NewConclusionPage() {
  const [state, setState] = useState<WizardState>(initialState)
  const [savedId, setSavedId] = useState<string | null>(null)
  const supabase = createClient()

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const goToStep = (step: number) => {
    setState(prev => ({ ...prev, step }))
  }

  const saveAndNext = async () => {
    if (state.step === 1 && !savedId) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('conclusions')
        .insert({
          ...state.conclusion,
          user_id: user.id,
          version: 1,
          statut: 'en_cours',
        })
        .select()
        .single()

      if (!error && data) {
        setSavedId(data.id)
      }
    }

    goToStep(state.step + 1)
  }

  const loadDemo = () => {
    setState(DEMO_STATE)
    setSavedId(null)
  }

  const currentStepComponent = () => {
    const props = { state, updateState, onNext: saveAndNext, onBack: () => goToStep(state.step - 1), conclusionId: savedId }
    switch (state.step) {
      case 1: return <Step1Infos {...props} />
      case 2: return <Step2Pieces {...props} />
      case 3: return <Step3Analyse {...props} />
      case 4: return <Step4Strategie {...props} />
      case 5: return <Step5Redaction {...props} />
      case 6: return <Step6Generation {...props} conclusionId={savedId || ''} />
      default: return null
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f8f6' }}>
      <WizardHeader steps={STEPS} currentStep={state.step} onStepClick={goToStep} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Demo banner */}
        <div className="mb-6 p-3 rounded-lg border border-dashed flex items-center justify-between" style={{ borderColor: '#e8842c', backgroundColor: '#fff9f5' }}>
          <div>
            <span className="text-xs font-semibold" style={{ color: '#e8842c' }}>🧪 Mode test</span>
            <span className="text-xs ml-2" style={{ color: '#6b7280' }}>
              Testez la génération avec un dossier fictif de licenciement abusif (CPH Lyon)
            </span>
          </div>
          <button
            onClick={loadDemo}
            className="ml-4 px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
            style={{ backgroundColor: '#e8842c' }}
          >
            Charger le dossier fictif →
          </button>
        </div>

        {currentStepComponent()}
      </main>
    </div>
  )
}
