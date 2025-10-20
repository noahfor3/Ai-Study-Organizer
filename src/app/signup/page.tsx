"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain } from 'lucide-react'
import supabase from '@/lib/supabaseBrowser'

export default function SignupPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const usernameCheckRef = useRef<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    // require that username availability was confirmed before submitting
    if (usernameAvailable !== true) {
      setError('Please choose an available username before signing up')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        setError('Supabase client is not initialized.')
        setLoading(false)
        return
      }

      // Normalize username to lowercase and include in user metadata
      const normalized = username.trim().toLowerCase()
      // sign up and include username in user metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: normalized } }
      })

      if (signUpError) {
        setError((signUpError as any)?.message || String(signUpError))
        setLoading(false)
        return
      }

        // If signUp returned a user id (some Supabase setups do), create the profile now.
        // Otherwise the user likely must confirm their email first and the auth user record
        // won't exist yet — skip creating the profile and redirect to confirmation.
        const userId = data?.user?.id
        if (userId) {
          try {
            const res = await fetch('/api/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: userId, email, username: normalized })
            })

            if (!res.ok) {
              const payload = await res.json().catch(() => ({}))
              setError(payload?.error || 'Failed to create profile')
              setLoading(false)
              return
            }
          } catch (err: any) {
            setError(err?.message || 'Failed to create profile')
            setLoading(false)
            return
          }
        }

        // proceed to the confirmation page regardless
        router.push('/signup/confirm')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  // debounce username availability checks
  useEffect(() => {
    setUsernameAvailable(null)
    if (usernameCheckRef.current) {
      window.clearTimeout(usernameCheckRef.current)
    }

    if (!username || username.trim().length < 3) {
      setCheckingUsername(false)
      return
    }

    setCheckingUsername(true)
    // debounce 400ms
    usernameCheckRef.current = window.setTimeout(async () => {
      try {
        const res = await fetch('/api/username-available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        })
        if (res.ok) {
          const payload = await res.json()
          setUsernameAvailable(Boolean(payload?.available))
        } else {
          setUsernameAvailable(null)
        }
      } catch (e) {
        setUsernameAvailable(null)
      } finally {
        setCheckingUsername(false)
      }
    }, 400)

    return () => {
      if (usernameCheckRef.current) {
        window.clearTimeout(usernameCheckRef.current)
      }
    }
  }, [username])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-foreground">
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">SmartPath</span>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <Card className="w-full shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription>Join SmartPath to optimize your learning journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" type="text" placeholder="choose_a_username" value={username} onChange={(e) => setUsername(e.target.value)} />
              <div className="text-sm mt-1">
                {checkingUsername && <span className="text-muted-foreground">Checking availability…</span>}
                {!checkingUsername && usernameAvailable === true && <span className="text-success">Username is available</span>}
                {!checkingUsername && usernameAvailable === false && <span className="text-destructive">Username is already taken</span>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Minimum 6 Characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="Minimum 6 Characters" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
          </CardContent>
            <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full"
              type="submit"
              disabled={loading || checkingUsername || usernameAvailable === false}
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/" className="font-medium text-primary hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </form>
    </main>
  )
}
