import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { requireAuth } from '@/lib/auth-guard'
import { checkRateLimit } from '@/lib/rate-limit'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(request: NextRequest) {
  const { user, error: authError } = await requireAuth()
  if (authError) return authError

  if (!checkRateLimit(`extract-text:${user!.id}`, { limit: 30, windowSec: 3600 })) {
    return NextResponse.json(
      { error: 'Trop de requêtes. Réessayez dans une heure.' },
      { status: 429 }
    )
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 413 })
  }

  // Plain text: read directly
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    const text = await file.text()
    return NextResponse.json({ text: text.slice(0, 50_000) })
  }

  // DOCX: not supported natively
  if (file.name.endsWith('.docx')) {
    return NextResponse.json({
      error: 'Format .docx non supporté. Veuillez convertir en PDF ou TXT.',
    }, { status: 415 })
  }

  // PDF: send to Claude via document API (base64)
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64,
                },
              },
              {
                type: 'text',
                text: 'Extrais intégralement le texte de ce document juridique. Conserve la structure et les paragraphes. Ne résume pas, retranscris tout le contenu textuel.',
              },
            ],
          },
        ],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('No text response')

      return NextResponse.json({ text: content.text })
    } catch (e) {
      console.error('Error extracting PDF text:', e)
      return NextResponse.json(
        { error: 'Erreur lors de l\'extraction du texte PDF' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ error: 'Format de fichier non supporté' }, { status: 415 })
}
