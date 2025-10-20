import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

export default function SignupConfirmPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="mt-4">Signup Successful</CardTitle>
          <CardDescription className="mb-4">Thanks for creating an account — please check your email to confirm your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Link href="/" className="w-full">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
