"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

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

      // sign up and include username in user metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })

      if (signUpError) {
        setError((signUpError as any)?.message || String(signUpError))
        setLoading(false)
        return
      }

      router.push('/signup/confirm')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
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
            <Button className="w-full" type="submit" disabled={loading}>
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
