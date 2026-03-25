import Link from 'next/link'

interface Step { id: number; label: string; short: string }

export default function WizardHeader({ steps, currentStep, onStepClick }: {
  steps: Step[]
  currentStep: number
  onStepClick: (step: number) => void
}) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1e2d3d' }}>
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-sm" style={{ color: '#1e2d3d' }}>Conclusions</span>
        </Link>

        <div className="flex-1 flex items-center gap-1">
          {steps.map((step, i) => {
            const isDone = step.id < currentStep
            const isCurrent = step.id === currentStep
            const isClickable = step.id < currentStep

            return (
              <div key={step.id} className="flex items-center gap-1">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{
                    backgroundColor: isCurrent ? '#1e2d3d' : isDone ? '#f0fdf4' : '#f3f4f6',
                    color: isCurrent ? 'white' : isDone ? '#16a34a' : '#9ca3af',
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold"
                    style={{
                      backgroundColor: isCurrent ? '#e8842c' : isDone ? '#16a34a' : '#d1d5db',
                      color: 'white',
                    }}
                  >
                    {isDone ? '✓' : step.short}
                  </span>
                  <span className="hidden sm:block">{step.label}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className="w-4 h-px" style={{ backgroundColor: isDone ? '#16a34a' : '#e5e7eb' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </header>
  )
}
