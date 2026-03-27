import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const { conclusion, chefs, pieces, conclusionId } = await request.json()

  const supabase = await createClient()

  // Fetch parties_droit from library for relevant themes
  const { data: partiesDroit } = await supabase
    .from('parties_droit')
    .select('theme, titre, contenu')
    .limit(20)

  const piecesDossier = (pieces || [])
    .filter((p: { type: string }) => p.type === 'dossier')
    .map((p: { titre: string }, i: number) => `Pièce n°${i + 1} : ${p.titre}`)
    .join('\n')

  const piecesAdverses = (pieces || [])
    .filter((p: { type: string }) => p.type === 'adverse')
    .map((p: { titre: string }, i: number) => `Pièce adverse n°${i + 1} : ${p.titre}`)
    .join('\n')

  const chefsContestes = (chefs || []).filter((c: { strategie: string }) => c.strategie === 'contester')
  const chefsConcedes = (chefs || []).filter((c: { strategie: string }) => c.strategie === 'conceder_partiellement')

  const prompt = `Tu es un avocat senior au Barreau de Lyon, spécialisé en défense employeur au Conseil de Prud'hommes (CPH).
Rédige des conclusions COMPLÈTES et PROFESSIONNELLES selon la méthodologie DAIRIA.

## INFORMATIONS DU DOSSIER
- Juridiction : ${conclusion.juridiction}
- N° RG : ${conclusion.n_rg}
- Audience du : ${conclusion.audience}
- Numéro de conclusions : ${conclusion.numero_conclusions || 1}
- Société défenderesse : ${conclusion.societe_info?.forme} ${conclusion.societe_info?.nom}, immatriculée au RCS de ${conclusion.societe_info?.rcs || 'Lyon'}, SIREN ${conclusion.societe_info?.siren || ''}, dont le siège social est sis ${conclusion.societe_info?.siege || ''}
- Salarié demandeur : ${conclusion.salarie_info?.civilite} ${conclusion.salarie_info?.nom} ${conclusion.salarie_info?.prenom}
- Avocat adverse : ${conclusion.avocat_adverse?.nom || 'Maître X'}, Barreau de ${conclusion.avocat_adverse?.barreau || 'Lyon'}

## CHEFS DE DEMANDE ET STRATÉGIE
${chefsContestes.map((c: { chef_demande: string; montant_demande?: number; section_droit?: string; section_fait?: string; force_argument?: string }, i: number) => `
CHEF ${i + 1} - CONTESTER : ${c.chef_demande}
Montant demandé : ${c.montant_demande ? `${c.montant_demande.toLocaleString('fr-FR')} €` : 'non précisé'}
Force de notre argument : ${c.force_argument || 'moyen'}
Section EN DROIT rédigée : ${c.section_droit || '(à générer)'}
Section EN FAIT rédigée : ${c.section_fait || '(à générer)'}
`).join('')}

${chefsConcedes.map((c: { chef_demande: string; montant_demande?: number; montant_propose?: number }, i: number) => `
CHEF CONCÉDÉ PARTIELLEMENT : ${c.chef_demande}
Montant demandé : ${c.montant_demande ? `${c.montant_demande.toLocaleString('fr-FR')} €` : 'non précisé'}
Montant proposé : ${c.montant_propose ? `${c.montant_propose.toLocaleString('fr-FR')} €` : 'à préciser'}
`).join('')}

## PIÈCES
${piecesDossier || '(aucune pièce)'}
${piecesAdverses ? `\nPièces adverses :\n${piecesAdverses}` : ''}

## BIBLIOTHÈQUE DAIRIA (extraits)
${partiesDroit?.slice(0, 5).map(p => `[${p.theme}] ${p.titre}: ${p.contenu.slice(0, 200)}...`).join('\n') || ''}

## INSTRUCTIONS DE RÉDACTION
Rédige les conclusions COMPLÈTES selon cette structure OBLIGATOIRE :

1. EN-TÊTE complet (juridiction, parties, avocats, POUR/CONTRE)
2. SOMMAIRE avec les grandes parties
3. EXPOSÉ DES FAITS (chronologie favorable à l'employeur, passé composé)
4. DISCUSSION (pour chaque chef contesté : sous-titre, EN DROIT, EN FAIT)
   - Si section_droit est fournie, l'utilise et enrichis-la
   - Si section_fait est fournie, l'utilise et enrichis-la
   - Sinon, génère-les complètement
5. PAR CES MOTIFS (dispositif : JUGER, DEBOUTER, CONDAMNER, ORDONNER)
6. SIGNATURE : Dairia avocats / Sofiane COLY / Avocat Associé / s.coly@dairia-avocats.com
7. BORDEREAU DE PIÈCES numérotées

RÈGLES DE RÉDACTION DAIRIA :
- Langage juridique précis et professionnel
- Passé composé pour les faits
- Chaque fait étayé par une pièce
- Chaque argument en droit cite un article de loi ou une jurisprudence Cass. soc.
- Ton assertif mais mesuré, jamais agressif
- Construire autour des points forts de l'employeur
- Ne pas contester chaque point adverse (sélectionner les combats)

Rédige les conclusions complètes maintenant :`

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }

        if (conclusionId) {
          await supabase
            .from('conclusions')
            .update({ statut: 'finalise' })
            .eq('id', conclusionId)
        }

        controller.close()
      } catch (e) {
        console.error('Streaming error:', e)
        controller.error(e)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
