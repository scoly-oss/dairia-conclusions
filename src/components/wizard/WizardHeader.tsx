import Link from 'next/link'

interface Step { id: number; label: string; short: string }

export default function WizardHeader({ steps, currentStep, onStepClick }: {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <header className="bg-white sticky top-0 z-10" style={{ borderBottom: '1px solid #e5e7eb', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-auto py-3 sm:py-0 sm:h-16 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0" style={{ textDecoration: 'none' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1e2d3d' }}>
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-sm" style={{ color: '#1e2d3d' }}>Conclusions</span>
        </Link>

        {/* Steps */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {steps.map((step, i) => {
            const isDone = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isClickable = step.id < currentStep

            return (
              <div key={step.id} className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  style={{
                    backgroundColor: isCurrent ? '#1e2d3d' : isDone ? '#f0fdf4' : '#f3f4f6',
                    color: isCurrent ? 'white' : isDone ? '#16a34a' : '#9ca3af',
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold flex-shrink-0"
                    style={{
                      backgroundColor: isCurrent ? '#e8842c' : isDone ? '#16a34a' : '#d1d5db',
                      color: 'white',
                    }}
                  >
                    {isDone ? '✓' : step.short}
                  </span>
                  <span className="hidden xs:block sm:block">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: isDone ? '#16a34a' : '#e5e7eb' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </header>
  )
}
