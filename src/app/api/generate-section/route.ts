import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { chef, section, dossierInfo, pieces } = await request.json()

  const piecesDossier = (pieces || []).filter((p: { type: string }) => p.type === 'dossier')
    .map((p: { numero: number; titre: string }, i: number) => `Pièce n°${i + 1} : ${p.titre}`)
    .join('\n')

  const isEnDroit = section === 'droit'

  const prompt = isEnDroit
    ? `Tu es un avocat spécialisé en droit du travail, défense employeur au Conseil de Prud'hommes.

Rédige la section "EN DROIT" pour le chef de demande : "${chef.chef_demande}"
Affaire : ${dossierInfo?.societe_info?.nom} c/ ${dossierInfo?.salarie_info?.nom} ${dossierInfo?.salarie_info?.prenom}

La section EN DROIT doit :
1. Citer les articles du Code du travail (L. XXXX-XX) avec leur contenu
2. Citer la jurisprudence de la Cour de cassation (Cass. soc., date, numéro)
3. Exposer les principes juridiques favorables à l'employeur
4. Être structurée avec des sous-titres si nécessaire
5. Utiliser un langage juridique précis
6. Être rédigée en défense employeur

Commence directement par "EN DROIT," (sans titre)
Longueur : 300-500 mots`
    : `Tu es un avocat spécialisé en droit du travail, défense employeur au Conseil de Prud'hommes.

Rédige la section "EN FAIT" pour le chef de demande : "${chef.chef_demande}"
Affaire : ${dossierInfo?.societe_info?.nom} c/ ${dossierInfo?.salarie_info?.nom} ${dossierInfo?.salarie_info?.prenom}

Pièces disponibles :
${piecesDossier || '(aucune pièce renseignée)'}

Arguments adverses à réfuter : ${chef.arguments_adverses || 'non précisés'}

La section EN FAIT doit :
1. Présenter les faits de manière favorable à l'employeur
2. Réfuter les arguments adverses
3. Citer les pièces (Pièce n°X) pour étayer chaque argument
4. Utiliser le passé composé pour les faits
5. Avoir un ton professionnel et assertif
6. Utiliser la narration positive

Commence directement par "EN FAIT," (sans titre)
Longueur : 300-500 mots`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('No text')

    return NextResponse.json({ content: content.text })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ content: `${isEnDroit ? 'EN DROIT' : 'EN FAIT'},\n\n[Section à rédiger manuellement]` })
  }
}
