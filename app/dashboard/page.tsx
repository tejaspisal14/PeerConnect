import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile and stats
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  const { data: userPoints } = await supabase.from("user_points").select("*").eq("user_id", data.user.id).single()

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Dashboard</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.display_name || "Learner"}!</h2>
          <p className="text-gray-600">Ready to learn something new or share your knowledge?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{userPoints?.level || 1}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{userPoints?.points || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sessions Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{userPoints?.total_sessions_taught || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Sessions Learned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{userPoints?.total_sessions_learned || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Skills Section */}
          <div className="space-y-6">
            <Card>
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
                    <Link href="/skills" className="text-blue-600 hover:underline">
                      Add some skills
                    </Link>{" "}
                    to start mentoring others.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
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
                    <Link href="/skills" className="text-blue-600 hover:underline">
                      Add some skills
                    </Link>{" "}
                    to find mentors.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <Card>
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
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  <Link href="/find-peers" className="text-blue-600 hover:underline">
                    Find a peer
                  </Link>{" "}
                  to get started!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
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
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Button asChild className="h-auto p-6 flex-col space-y-2">
              <Link href="/find-peers">
                <div className="text-2xl">🔍</div>
                <div>Find Learning Partners</div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="/skills">
                <div className="text-2xl">⚡</div>
                <div>Manage Skills</div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="">
                <div className="text-2xl">📚</div>
                <div>Browse Resources</div>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-6 flex-col space-y-2 bg-transparent">
              <Link href="">
                <div className="text-2xl">🏆</div>
                <div>View Achievements</div>
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
