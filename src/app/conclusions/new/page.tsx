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
import { useRouter } from 'next/navigation'

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

export default function NewConclusionPage() {
  const [state, setState] = useState<WizardState>(initialState)
  const [savedId, setSavedId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const goToStep = (step: number) => {
    setState(prev => ({ ...prev, step }))
  }

  const saveAndNext = async () => {
    // Save to Supabase on step 1
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
        {currentStepComponent()}
      </main>
    </div>
  )
}
