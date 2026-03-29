import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
  }

  // Plain text: read directly
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    const text = await file.text()
    return NextResponse.json({ text })
  }

  // DOCX: not natively supported
  if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    return NextResponse.json({
      error: 'Les fichiers Word (.docx) ne sont pas encore pris en charge. Convertissez en PDF ou collez le texte manuellement.',
    }, { status: 422 })
  }

  // PDF: use Claude document API
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: [{ role: 'user', content: [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }, { type: 'text', text: "Extrais et retranscris intégralement le texte de ce document juridique. Conserve la structure (titres, paragraphes, numérotations). Retourne uniquement le texte, sans commentaire." }] as any }],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('No text response')
      return NextResponse.json({ text: content.text })
    } catch (e) {
      console.error('PDF extraction error:', e)
      return NextResponse.json({ error: 'Impossible d\'extraire le texte du PDF' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Format de fichier non supporté (PDF, TXT acceptés)' }, { status: 415 })
}
