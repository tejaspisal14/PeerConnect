import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import ThemeToggle from "@/components/ui/theme-toggle"
import PeerConnectLogo from "@/components/peerconnect-logo"

export default function HomePage() {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-700">
      <ThemeToggle />
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PeerConnectLogo />
            <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">PeerConnect</div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md hover:scale-105 transition-transform">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-extrabold mb-6 text-balance bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent dark:from-blue-300 dark:via-purple-300 dark:to-pink-300 transition-colors duration-700">AI-Powered Peer Learning Platform</h1>
          <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8 text-pretty">
            Connect with peers worldwide for real-time knowledge exchange.<br />
            Learn new skills, teach what you know, and grow together with our intelligent matching system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md hover:scale-105 transition-transform">
              <Link href="/auth/signup">Start Learning</Link>
            </Button>
            
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-20">
          

          <Card className="text-center bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
            <CardHeader>
              <div className="text-4xl mb-4">💬</div>
              <CardTitle className="font-bold text-blue-500 dark:text-purple-400">Real-Time Chat</CardTitle>
              <CardDescription>
                Seamless communication with integrated chat, file sharing, and session scheduling for effective learning.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
            <CardHeader>
              <div className="text-4xl mb-4">🏆</div>
              <CardTitle className="font-bold text-blue-500 dark:text-purple-400">Gamified Learning</CardTitle>
              <CardDescription>
                Earn points, unlock achievements, and track your progress as you learn and teach in our community.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-8 mt-20 text-center">
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">10K+</div>
            <div className="text-gray-700 dark:text-gray-300">Active Learners</div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">500+</div>
            <div className="text-gray-700 dark:text-gray-300">Skills Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">50K+</div>
            <div className="text-gray-700 dark:text-gray-300">Sessions Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">95%</div>
            <div className="text-gray-700 dark:text-gray-300">Success Rate</div>
          </div>
        </div>
      </main>
    </div>
  )
}
