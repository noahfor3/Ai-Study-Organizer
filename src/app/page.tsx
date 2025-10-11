"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Brain } from 'lucide-react'
import supabase from '@/lib/supabaseBrowser'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!supabase) {
        setError('Authentication is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
        setLoading(false)
        return
      }

      // If the identifier looks like an email use it directly; otherwise treat it as username
      let emailToUse = identifier

      if (!identifier.includes('@')) {
        // try resolving username -> email from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single()

        if (profileError || !profileData) {
          setError('No account found for that username. Try signing in with your email.')
          setLoading(false)
          return
        }

        // @ts-ignore
        emailToUse = profileData.email
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      // successful login
      router.push('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-foreground">
        <Brain className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">SmartPath</span>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your study dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or Username</Label>
              <Input id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="email or username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Sign Up
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
