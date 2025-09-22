import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import ThemeToggle from "@/components/ui/theme-toggle"
import PeerConnectLogo from "@/components/peerconnect-logo"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and stats
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: userPoints } = await supabase.from("user_points").select("*").eq("user_id", data.user.id).single()
  const { data: userRank } = await supabase.rpc("get_user_rank", { user_id: data.user.id })

  const { data: userSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (name, category)
    `)
    .eq("user_id", data.user.id)

  const { data: recentSessions } = await supabase
    .from("peer_sessions")
    .select(`
      *,
      skills (name),
      mentor:mentor_id (display_name),
      learner:learner_id (display_name)
    `)
    .or(`mentor_id.eq.${data.user.id},learner_id.eq.${data.user.id}`)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent achievements
  const { data: recentAchievements } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievements (name, icon, points_required)
    `)
    .eq("user_id", data.user.id)
    .order("earned_at", { ascending: false })
    .limit(3)

  const teachingSkills = userSkills?.filter((skill) => skill.skill_type === "teaching") || []
  const learningSkills = userSkills?.filter((skill) => skill.skill_type === "learning") || []


  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-700">
      <ThemeToggle />
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PeerConnectLogo />
<h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 dark:text-gray-300">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/profile">Edit Profile</Link>
              </Button>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Welcome back, {profile?.display_name || "Learner"}!</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300">Ready to learn something new or share your knowledge?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <span className="text-blue-500">↗</span>
                <span>Your Ranking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-blue-600">{userRank && userRank > 0 ? `#${userRank}` : "N/A"}</div>
                <div className="text-sm text-gray-500 mt-1">Overall Rank</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600">{userPoints?.points || 0}</div>
                <div className="text-sm text-gray-500 mt-1">Total Points</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Sessions Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{userPoints?.total_sessions_taught || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Sessions Learned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{userPoints?.total_sessions_learned || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Skills Section */}
          <div className="space-y-6">
            <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Skills I Can Teach
                  <Button size="sm" asChild>
                    <Link href="/skills">Manage Skills</Link>
                  </Button>
                </CardTitle>
                <CardDescription>Share your expertise with others</CardDescription>
              </CardHeader>
              <CardContent>
                {teachingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {teachingSkills.map((userSkill) => (
                      <Badge key={userSkill.id} variant="secondary" className="bg-green-100 text-green-800">
                        {userSkill.skills?.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No teaching skills added yet.{" "}
                    <Link href="/skills" className="text-blue-600 dark:text-purple-400 hover:underline">
                      Add some skills
                    </Link>{" "}
                    to start mentoring others.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
              <CardHeader>
                <CardTitle>Skills I Want to Learn</CardTitle>
                <CardDescription>Areas where you're seeking mentorship</CardDescription>
              </CardHeader>
              <CardContent>
                {learningSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {learningSkills.map((userSkill) => (
                      <Badge key={userSkill.id} variant="secondary" className="bg-blue-100 text-blue-800">
                        {userSkill.skills?.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No learning goals set yet.{" "}
                    <Link href="/skills" className="text-blue-600 dark:text-purple-400 hover:underline">
                      Add some skills
                    </Link>{" "}
                    to find mentors.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Sessions
                <Button size="sm" variant="outline" asChild>
                  <Link href="/sessions">View All</Link>
                </Button>
              </CardTitle>
              <CardDescription>Your latest learning and teaching activities</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions && recentSessions.length > 0 ? (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{session.skills?.name}</div>
                        <div className="text-xs text-gray-500">
                          {session.mentor_id === data.user.id ? "Teaching" : "Learning"} • {session.status}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            session.status === "completed"
                              ? "default"
                              : session.status === "active"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {session.status}
                        </Badge>
                        {session.status === "active" && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/sessions/${session.id}/chat`}>Chat</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No sessions yet.{" "}
                  <Link href="/find-peers" className="text-blue-600 dark:text-purple-400 hover:underline">
                    Find a peer
                  </Link>{" "}
                  to get started!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Recent Achievements
                <Button size="sm" variant="outline" asChild>
                  <Link href="/achievements">View All</Link>
                </Button>
              </CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAchievements && recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                      <div className="text-lg">{achievement.achievements.icon}</div>
                      <div>
                        <div className="font-medium text-sm">{achievement.achievements.name}</div>
                        <div className="text-xs text-gray-500">
                          {achievement.achievements.points_required} points •{" "}
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No achievements yet. Start learning or teaching to earn your first achievement!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-300 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <Button asChild className="h-auto p-6 flex-col space-y-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-md hover:scale-105 transition-transform">
              <Link href="/find-peers">
                <div className="text-2xl">🔍</div>
                <div>Find Learning Partners</div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent border-2 border-blue-400 dark:border-purple-400">
              <Link href="/skills">
                <div className="text-2xl">⚡</div>
                <div>Manage Skills</div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent border-2 border-blue-400 dark:border-purple-400">
              <Link href="/resources">
                <div className="text-2xl">📚</div>
                <div>Browse Resources</div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent border-2 border-blue-400 dark:border-purple-400">
              <Link href="/achievements">
                <div className="text-2xl">🏆</div>
                <div>View Achievements</div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent border-2 border-blue-400 dark:border-purple-400">
              <Link href="/leaderboard">
                <div className="text-2xl">📊</div>
                <div>Leaderboard</div>
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
