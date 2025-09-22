import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import LeaderboardDisplay from "@/components/leaderboard-display"
import PeerConnectLogo from "@/components/peerconnect-logo"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get top users by points
  const { data: topUsers } = await supabase
    .from("user_points")
    .select(`
      *,
      profiles (display_name, bio, location)
    `)
    .order("points", { ascending: false })
    .limit(50)

  // Get user's rank
  const { data: userRank } = await supabase.rpc("get_user_rank", { user_id: data.user.id })

  // Get recent achievements
  const { data: recentAchievements } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievements (name, icon, points_required),
      profiles (display_name)
    `)
    .order("earned_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <PeerConnectLogo />
                <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Leaderboard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Community Leaderboard</h2>
          <p className="text-gray-600">See how you rank among the most active learners and mentors in PeerConnect.</p>
        </div>

        <LeaderboardDisplay
          topUsers={topUsers || []}
          currentUserId={data.user.id}
          userRank={userRank || 0}
          recentAchievements={recentAchievements || []}
        />
      </main>
    </div>
  )
}
