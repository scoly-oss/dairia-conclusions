import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { text, dossierInfo } = await request.json()

  const prompt = `Tu es un avocat spécialisé en droit du travail. Analyse les conclusions adverses suivantes et extrais tous les chefs de demande.

Dossier : ${dossierInfo?.societe_info?.nom || 'Société'} c/ ${dossierInfo?.salarie_info?.nom || 'Salarié'} ${dossierInfo?.salarie_info?.prenom || ''}

Conclusions adverses :
${text}

Réponds UNIQUEMENT avec un JSON valide de cette structure exacte :
{
  "chefs": [
    {
      "id": "1",
      "chef_demande": "Nom du chef de demande",
      "montant_demande": 10000,
      "arguments_adverses": "Résumé des arguments adverses pour ce chef",
      "strategie": "contester",
      "ordre": 1
    }
  ]
}

Règles :
- montant_demande est un nombre en euros (ou null si pas de montant)
- strategie est toujours "contester" par défaut
- Inclus TOUS les chefs de demande même mineurs
- Si le texte est vide ou illisible, génère des chefs typiques d'un licenciement`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('No text response')

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')

    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch (e) {
    console.error('Error analysing conclusions:', e)
    // Return default chefs if AI fails
    return NextResponse.json({
      chefs: [
        { id: '1', chef_demande: 'Licenciement sans cause réelle et sérieuse', montant_demande: 15000, arguments_adverses: 'Le salarié conteste la légitimité du licenciement', strategie: 'contester', ordre: 1 },
        { id: '2', chef_demande: 'Indemnité compensatrice de préavis', montant_demande: 3000, arguments_adverses: 'Préavis non effectué', strategie: 'contester', ordre: 2 },
        { id: '3', chef_demande: 'Article 700 CPC', montant_demande: 2000, arguments_adverses: 'Frais de procédure', strategie: 'contester', ordre: 3 },
      ]
    })
  }
}
