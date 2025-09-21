import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PeerConnect</h1>
          <p className="text-gray-600">AI-Powered Peer Learning Platform</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Check your email</CardTitle>
            <CardDescription className="text-center">We've sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl mb-4">📧</div>
            <p className="text-gray-600">
              Please check your email and click the verification link to activate your account.
            </p>
            <p className="text-sm text-gray-500">
              Didn't receive the email? Check your spam folder or try signing up again.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
