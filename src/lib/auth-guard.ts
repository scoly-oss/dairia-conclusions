import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Verifies the request is authenticated and returns the user.
 * Returns a 401 NextResponse if not authenticated.
 */
export async function requireAuth(): Promise<
  { user: { id: string; email?: string }; error: null } |
  { user: null; error: NextResponse }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      ),
    }
  }

  return { user: { id: user.id, email: user.email }, error: null }
}
