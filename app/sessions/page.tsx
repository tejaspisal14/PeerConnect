import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ThemeToggle from "@/components/ui/theme-toggle"

export default async function SessionsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all user sessions
  const { data: sessionsRaw } = await supabase
    .from("peer_sessions")
    .select(`*, skills (name, category), mentor:mentor_id (display_name), learner:learner_id (display_name)`) 
    .or(`mentor_id.eq.${data.user.id},learner_id.eq.${data.user.id}`)
    .order("created_at", { ascending: false })

  const sessions = Array.isArray(sessionsRaw) ? sessionsRaw : [];
  const pendingSessions = sessions.filter((s) => s.status === "pending") || [];
  const activeSessions = sessions.filter((s) => s.status === "active") || [];
  const completedSessions = sessions.filter((s) => s.status === "completed") || [];

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-700">
      <ThemeToggle />
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 dark:text-gray-300">My Sessions</span>
            </div>
            <Button asChild>
              <Link href="/find-peers">Find New Peers</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">My Learning Sessions</h2>
          <p className="text-gray-700 dark:text-gray-300">Manage your ongoing and completed peer learning sessions.</p>
        </div>

        <div className="space-y-8">
          {/* Pending Sessions */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-4">Pending Sessions ({pendingSessions.length})</h3>
            {pendingSessions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingSessions.map((session) => (
                  <Card key={session.id} className="border-orange-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.skills?.name}</CardTitle>
                        <Badge variant="outline" className="border-orange-300 text-orange-700">Pending</Badge>
                      </div>
                      <CardDescription>
                        {session.mentor_id === data.user.id ? (
                          <>Teaching {session.learner?.display_name}</>
                        ) : (
                          <>Learning from {session.mentor?.display_name}</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">Duration: {session.duration_minutes} minutes</div>
                        <Button asChild className="w-full">
                          <Link href={`/sessions/${session.id}`}>Join Session</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No pending sessions</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Active Sessions */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-4">Active Sessions ({activeSessions.length})</h3>
            {activeSessions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeSessions.map((session) => (
                  <Card key={session.id} className="border-green-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.skills?.name}</CardTitle>
                        <Badge className="bg-green-600">Active</Badge>
                      </div>
                      <CardDescription>
                        {session.mentor_id === data.user.id ? (
                          <>Teaching {session.learner?.display_name}</>
                        ) : (
                          <>Learning from {session.mentor?.display_name}</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">Duration: {session.duration_minutes} minutes</div>
                        <Button asChild className="w-full">
                          <Link href={`/sessions/${session.id}`}>Join Session</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No active sessions</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Completed Sessions */}
          <section>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-300 mb-4">
              Completed Sessions ({completedSessions.length})
            </h3>
            {completedSessions.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedSessions.slice(0, 6).map((session) => (
                  <Card key={session.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{session.skills?.name}</CardTitle>
                        <Badge variant="secondary">Completed</Badge>
                      </div>
                      <CardDescription>
                        {session.mentor_id === data.user.id ? (
                          <>Taught {session.learner?.display_name}</>
                        ) : (
                          <>Learned from {session.mentor?.display_name}</>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          Completed {new Date(session.updated_at).toLocaleDateString()}
                        </div>
                        <Button variant="outline" asChild className="w-full bg-transparent">
                          <Link href={`/sessions/${session.id}`}>View Summary</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No completed sessions yet</p>
                  <Button asChild>
                    <Link href="/find-peers">Start Your First Session</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
