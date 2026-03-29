'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#f8f8f6' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
              style={{ backgroundColor: '#1e2d3d' }}
            >
              <span className="text-white font-bold text-xl">D</span>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold leading-tight" style={{ color: '#1e2d3d' }}>DAIRIA</div>
              <div className="text-sm font-medium" style={{ color: '#e8842c' }}>Conclusions</div>
            </div>
          </div>
          <p className="text-base" style={{ color: '#6b7280' }}>
            Générateur de conclusions prud&apos;homales
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 sm:p-10" style={{ borderRadius: '14px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#1e2d3d' }}>Connexion</h1>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>Accédez à votre espace DAIRIA Avocats</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="form-label">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="avocat@dairia-avocats.com"
              />
            </div>

            <div>
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ padding: '0.875rem 1.75rem' }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion en cours…
                </>
              ) : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm font-medium" style={{ color: '#6b7280' }}>DAIRIA Avocats</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Barreau de Lyon</p>
        </div>
      </div>
    </div>
  )
}
