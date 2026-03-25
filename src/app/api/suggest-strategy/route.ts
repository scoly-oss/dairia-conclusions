import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { chef, dossierInfo } = await request.json()

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
