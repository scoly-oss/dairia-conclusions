'use client'

import { useState } from 'react'
import { WizardState } from '@/types'
import Link from 'next/link'

interface Props {
  state: WizardState
  updateState: (u: Partial<WizardState>) => void
  onNext: () => void
  onBack: () => void
  conclusionId: string
}

export default function Step6Generation({ state, updateState, onBack, conclusionId }: Props) {
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [documentText, setDocumentText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [exportingWord, setExportingWord] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)

  const societeSlug = state.conclusion?.societe_info?.nom?.replace(/\s+/g, '_') || 'societe'
  const salarieSlug = state.conclusion?.salarie_info?.nom?.replace(/\s+/g, '_') || 'salarie'
  const filename = `Conclusions_${societeSlug}_c_${salarieSlug}`

  const generate = async () => {
    setLoading(true)
    setError(null)
    setDocumentText('')
    setGenerated(false)

    try {
      const response = await fetch('/api/generate-conclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conclusion: state.conclusion,
          chefs: state.chefs,
          pieces: state.pieces,
          conclusionId,
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Erreur de génération')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setDocumentText(fullText)
      }

      updateState({ documentGenere: fullText })
      setGenerated(true)
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadTxt = () => {
    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = globalThis.document.createElement('a')
    a.href = url
    a.download = `${filename}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadWord = async () => {
    setExportingWord(true)
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')

      const lines = documentText.split('\n')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const children: any[] = []

      for (const line of lines) {
        const trimmed = line.trim()

        // Detect major section headers (all-caps lines or specific patterns)
        if (
          /^(EN-TÊTE|SOMMAIRE|EXPOSÉ DES FAITS|DISCUSSION|PAR CES MOTIFS|BORDEREAU DE PIÈCES|SIGNATURE)/.test(trimmed) ||
          /^(I\.|II\.|III\.|IV\.|V\.)/.test(trimmed)
        ) {
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 300, after: 120 },
              children: [new TextRun({ text: trimmed, bold: true, size: 24, color: '1e2d3d' })],
            })
          )
        } else if (/^(A\.|B\.|C\.|EN DROIT|EN FAIT|CHEF [0-9])/.test(trimmed)) {
          children.push(
            new Paragraph({
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({
                  text: trimmed,
                  bold: true,
                  size: 22,
                  underline: { type: 'single' as const },
                }),
              ],
            })
          )
        } else if (trimmed === '') {
          children.push(new Paragraph({ text: '', spacing: { before: 60, after: 60 } }))
        } else if (trimmed.startsWith('POUR :') || trimmed.startsWith('CONTRE :')) {
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 120, after: 60 },
              children: [new TextRun({ text: trimmed, bold: true, size: 22 })],
            })
          )
        } else if (/^(JUGER|DEBOUTER|CONDAMNER|ORDONNER|DIRE)/.test(trimmed)) {
          children.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              indent: { left: 360 },
              children: [new TextRun({ text: trimmed, bold: true, size: 20 })],
            })
          )
        } else {
          children.push(
            new Paragraph({
              spacing: { before: 40, after: 40 },
              alignment: AlignmentType.JUSTIFIED,
              children: [new TextRun({ text: line, size: 20 })],
            })
          )
        }
      }

      const doc = new Document({
        creator: 'DAIRIA Avocats',
        title: `Conclusions - ${societeSlug} c/ ${salarieSlug}`,
        description: `Conclusions prud'homales générées par DAIRIA`,
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 },
              },
            },
            children,
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = globalThis.document.createElement('a')
      a.href = url
      a.download = `${filename}.docx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Word export error:', e)
      setError('Erreur lors de l\'export Word')
    } finally {
      setExportingWord(false)
    }
  }

  const downloadPdf = async () => {
    setExportingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')

      const doc = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' })

      const marginLeft = 25
      const marginRight = 25
      const marginTop = 25
      const marginBottom = 25
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const maxWidth = pageWidth - marginLeft - marginRight

      let y = marginTop
      const lines = documentText.split('\n')

      const addPage = () => {
        doc.addPage()
        y = marginTop
      }

      const checkPageBreak = (lineHeight: number) => {
        if (y + lineHeight > pageHeight - marginBottom) {
          addPage()
        }
      }

      for (const line of lines) {
        const trimmed = line.trim()

        if (trimmed === '') {
          y += 4
          continue
        }

        // Section headers
        if (
          /^(EN-TÊTE|SOMMAIRE|EXPOSÉ DES FAITS|DISCUSSION|PAR CES MOTIFS|BORDEREAU DE PIÈCES)/.test(trimmed) ||
          /^(I\.|II\.|III\.|IV\.|V\.)/.test(trimmed)
        ) {
          checkPageBreak(12)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(13)
          doc.setTextColor(30, 45, 61) // #1e2d3d
          const wrapped = doc.splitTextToSize(trimmed, maxWidth)
          doc.text(wrapped, marginLeft, y)
          y += wrapped.length * 7 + 4
        } else if (/^(A\.|B\.|C\.|EN DROIT|EN FAIT|CHEF [0-9])/.test(trimmed)) {
          checkPageBreak(10)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(30, 45, 61)
          const wrapped = doc.splitTextToSize(trimmed, maxWidth)
          doc.text(wrapped, marginLeft, y)
          y += wrapped.length * 6 + 3
        } else if (trimmed.startsWith('POUR :') || trimmed.startsWith('CONTRE :')) {
          checkPageBreak(8)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(11)
          doc.setTextColor(30, 45, 61)
          doc.text(trimmed, pageWidth / 2, y, { align: 'center' })
          y += 7
        } else if (/^(JUGER|DEBOUTER|CONDAMNER|ORDONNER|DIRE)/.test(trimmed)) {
          checkPageBreak(8)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.setTextColor(30, 45, 61)
          const wrapped = doc.splitTextToSize(trimmed, maxWidth - 10)
          doc.text(wrapped, marginLeft + 10, y)
          y += wrapped.length * 5.5 + 2
        } else {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)
          doc.setTextColor(60, 60, 60)
          const wrapped = doc.splitTextToSize(line, maxWidth)
          for (const wrappedLine of wrapped) {
            checkPageBreak(5.5)
            doc.text(wrappedLine, marginLeft, y)
            y += 5.5
          }
          y += 1
        }
      }

      // Footer on each page
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `DAIRIA Avocats — Sofiane COLY — s.coly@dairia-avocats.com — Page ${i}/${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        )
      }

      doc.save(`${filename}.pdf`)
    } catch (e) {
      console.error('PDF export error:', e)
      setError('Erreur lors de l\'export PDF')
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e2d3d' }}>Génération des conclusions</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>L'IA assemble les conclusions complètes prêtes à être déposées</p>
      </div>

      {!generated ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          {/* Summary */}
          <div className="mb-6 text-left max-w-sm mx-auto">
            <h3 className="font-semibold mb-3 text-sm text-center" style={{ color: '#1e2d3d' }}>Récapitulatif</h3>
            <div className="space-y-2">
              <SummaryRow label="Affaire" value={`${state.conclusion?.societe_info?.nom} c/ ${state.conclusion?.salarie_info?.nom} ${state.conclusion?.salarie_info?.prenom}`} />
              <SummaryRow label="Juridiction" value={state.conclusion?.juridiction || '-'} />
              <SummaryRow label="N° RG" value={state.conclusion?.n_rg || '-'} />
              <SummaryRow label="Chefs de demande" value={`${state.chefs.length} identifiés`} />
              <SummaryRow label="À contester" value={`${state.chefs.filter(c => c.strategie === 'contester').length}`} />
              <SummaryRow label="À concéder partiellement" value={`${state.chefs.filter(c => c.strategie === 'conceder_partiellement').length}`} />
              <SummaryRow label="Pièces" value={`${state.pieces.length} pièces`} />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Streaming preview while loading */}
          {loading && documentText && (
            <div className="mb-6 text-left rounded-xl border border-orange-100 bg-orange-50 overflow-hidden">
              <div className="px-4 py-2 border-b border-orange-100 flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-orange-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs font-medium" style={{ color: '#e8842c' }}>Rédaction en cours...</span>
              </div>
              <div
                className="px-4 py-3 text-xs font-mono overflow-y-auto"
                style={{ maxHeight: '300px', color: '#1e2d3d', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}
              >
                {documentText}
                <span className="inline-block w-2 h-4 ml-0.5 bg-orange-400 animate-pulse" />
              </div>
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading}
            className="px-8 py-4 rounded-xl font-bold text-white text-base disabled:opacity-50"
            style={{ backgroundColor: '#e8842c' }}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Rédaction en cours...
              </span>
            ) : '⚡ Générer les conclusions complètes'}
          </button>

          {!loading && (
            <p className="text-xs mt-3" style={{ color: '#6b7280' }}>
              Streaming en temps réel · Export Word & PDF disponibles après génération
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Actions */}
          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2"
              style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}
            >
              {copied ? '✓ Copié !' : '📋 Copier'}
            </button>
            <button
              onClick={downloadTxt}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: '#6b7280' }}
            >
              💾 .txt
            </button>
            <button
              onClick={downloadWord}
              disabled={exportingWord}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: '#1e2d3d' }}
            >
              {exportingWord ? '...' : '📄 Word (.docx)'}
            </button>
            <button
              onClick={downloadPdf}
              disabled={exportingPdf}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
              style={{ backgroundColor: '#e8842c' }}
            >
              {exportingPdf ? '...' : '📑 PDF (.pdf)'}
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: '#6b7280' }}
            >
              ← Tableau de bord
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Document preview */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-sm" style={{ color: '#1e2d3d' }}>Prévisualisation des conclusions</h3>
              <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                ✓ Généré
              </span>
            </div>
            <textarea
              value={documentText}
              onChange={e => setDocumentText(e.target.value)}
              className="w-full px-6 py-4 text-sm font-mono focus:outline-none resize-none"
              rows={40}
              style={{ color: '#1e2d3d', lineHeight: '1.8' }}
            />
          </div>
        </div>
      )}

      {!generated && !loading && (
        <div className="flex justify-start">
          <button onClick={onBack} className="px-6 py-3 rounded-lg font-semibold text-sm border-2" style={{ color: '#1e2d3d', borderColor: '#1e2d3d' }}>
            ← Retour
          </button>
        </div>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: '#6b7280' }}>{label}</span>
      <span className="font-medium" style={{ color: '#1e2d3d' }}>{value}</span>
    </div>
  )
}
