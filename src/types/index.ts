export interface Conclusion {
  id: string
  affaire_id?: string
  version: number
  juridiction: string
  n_rg: string
  audience: string
  societe_info: SocieteInfo
  salarie_info: SalarieInfo
  avocat_adverse: AvocatAdverse
  numero_conclusions: number
  statut: 'brouillon' | 'en_cours' | 'finalise'
  notes_redaction?: string
  created_at: string
  updated_at?: string
  user_id: string
}

export interface SocieteInfo {
  nom: string
  forme: string
  rcs: string
  siren: string
  siege: string
}

export interface SalarieInfo {
  civilite: string
  nom: string
  prenom: string
}

export interface AvocatAdverse {
  nom: string
  barreau: string
}

export interface ConclusionChef {
  id: string
  conclusion_id: string
  chef_demande: string
  montant_demande?: number
  strategie: 'contester' | 'conceder_partiellement' | 'ne_pas_repondre'
  force_argument?: 'fort' | 'moyen' | 'faible'
  montant_propose?: number
  section_droit?: string
  section_fait?: string
  ordre: number
  arguments_adverses?: string
}

export interface PartieDroit {
  id: string
  theme: string
  sous_theme?: string
  titre: string
  contenu: string
  articles_loi: string[]
  jurisprudences: string[]
  created_at: string
}

export interface ConclusionPiece {
  id: string
  conclusion_id: string
  numero: number
  titre: string
  type: 'dossier' | 'adverse' | 'conclusions_adverses'
  fichier_url?: string
}

export interface WizardState {
  step: number
  conclusion: Partial<Conclusion>
  chefs: Partial<ConclusionChef>[]
  pieces: Partial<ConclusionPiece>[]
  conclusionsAdversesText?: string
  documentGenere?: string
}
