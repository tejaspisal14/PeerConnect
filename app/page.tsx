import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">PeerConnect</div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 text-balance">AI-Powered Peer Learning Platform</h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty">
            Connect with peers worldwide for real-time knowledge exchange. Learn new skills, teach what you know, and
            grow together with our intelligent matching system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/signup">Start Learning</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">Become a Mentor</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">🤖</div>
              <CardTitle>AI-Powered Matching</CardTitle>
              <CardDescription>
                Our intelligent system connects you with the perfect learning partners based on skills, goals, and
                availability.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">💬</div>
              <CardTitle>Real-Time Chat</CardTitle>
              <CardDescription>
                Seamless communication with integrated chat, file sharing, and session scheduling for effective
                learning.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="text-4xl mb-4">🏆</div>
              <CardTitle>Gamified Learning</CardTitle>
              <CardDescription>
                Earn points, unlock achievements, and track your progress as you learn and teach in our community.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mt-20 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600">10K+</div>
            <div className="text-gray-600">Active Learners</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">500+</div>
            <div className="text-gray-600">Skills Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">50K+</div>
            <div className="text-gray-600">Sessions Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-600">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </main>
    </div>
  )
}
