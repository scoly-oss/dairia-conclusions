import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '@/lib/auth-guard'
import { checkRateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_BODY_SIZE = 10_000 // 10 KB

export async function POST(request: NextRequest) {
  // Auth check
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  // Rate limiting: 60 strategy suggestions per hour per user
  if (!checkRateLimit(`suggest-strategy:${user!.id}`, { limit: 60, windowSec: 3600 })) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une heure.' },
      { status: 429 }
    )
  }

  // Input size validation
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413 })
  }

  const { chef, dossierInfo } = await request.json()

  if (!chef) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Tu es un avocat spécialisé en droit du travail, défense employeur.

Affaire : ${dossierInfo?.societe_info?.nom || 'Société'} c/ ${dossierInfo?.salarie_info?.nom || 'Salarié'} ${dossierInfo?.salarie_info?.prenom || ''}
Chef de demande : ${chef.chef_demande}
Montant demandé : ${chef.montant_demande ? `${chef.montant_demande}€` : 'non précisé'}
Arguments adverses : ${chef.arguments_adverses || 'non précisés'}

Donne une recommandation stratégique. Réponds UNIQUEMENT en JSON :
{
  "strategie": "contester" | "conceder_partiellement" | "ne_pas_repondre",
  "force_argument": "fort" | "moyen" | "faible",
  "montant_propose": number | null,
  "explication": "courte explication"
}`
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('No text')

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (e) {
    console.error(e)
    return NextResponse.json({
      strategie: 'contester',
      force_argument: 'moyen',
      montant_propose: null,
      explication: 'Stratégie par défaut : contester',
    })
  }
}
