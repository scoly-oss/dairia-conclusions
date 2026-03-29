import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '@/lib/auth-guard'
import { checkRateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Strict size limit on text — large uploads could be expensive & slow
const MAX_TEXT_CHARS = 50_000 // ~50K chars ≈ ~25 pages
const MAX_BODY_SIZE = 60_000 // 60 KB

export async function POST(request: NextRequest) {
  // Auth check
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  // Rate limiting: 20 analyses per hour per user
  if (!checkRateLimit(`analyse-conclusions:${user!.id}`, { limit: 20, windowSec: 3600 })) {
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

  const { text, dossierInfo } = await request.json()

  if (typeof text !== 'string') {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  // Truncate oversized text rather than reject (graceful degradation)
  const safeText = text.slice(0, MAX_TEXT_CHARS)

  const prompt = `Tu es un avocat spécialisé en droit du travail. Analyse les conclusions adverses suivantes et extrais tous les chefs de demande.

Dossier : ${dossierInfo?.societe_info?.nom || 'Société'} c/ ${dossierInfo?.salarie_info?.nom || 'Salarié'} ${dossierInfo?.salarie_info?.prenom || ''}

Conclusions adverses :
${safeText}

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
