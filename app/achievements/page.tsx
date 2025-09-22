import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AchievementsDisplay from "@/components/achievements-display"
import ThemeToggle from "@/components/ui/theme-toggle"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select(`
      *,
      achievements (*)
    `)
    .eq("user_id", data.user.id)

  // Get all available achievements
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*")
    .order("points_required", { ascending: true })

  // Get user stats for progress calculation
  const { data: userPoints } = await supabase.from("user_points").select("*").eq("user_id", data.user.id).single()

  const { data: sessionStats } = await supabase
    .from("peer_sessions")
    .select("status, mentor_id, learner_id")
    .or(`mentor_id.eq.${data.user.id},learner_id.eq.${data.user.id}`)
    .eq("status", "completed")

  const { data: skillStats } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (category)
    `)
    .eq("user_id", data.user.id)

  const { data: resourceStats } = await supabase.from("resources").select("id").eq("created_by", data.user.id)

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
              <span className="text-gray-700 dark:text-gray-300">Achievements</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Your Achievements</h2>
          <p className="text-gray-700 dark:text-gray-300">Track your progress and unlock rewards as you learn and teach on PeerConnect.</p>
        </div>
        <AchievementsDisplay
          userAchievements={userAchievements || []}
          allAchievements={allAchievements || []}
          userStats={{
            points: userPoints?.points || 0,
            level: userPoints?.level || 1,
            sessionsLearned: sessionStats?.filter((s) => s.learner_id === data.user.id).length || 0,
            sessionsTaught: sessionStats?.filter((s) => s.mentor_id === data.user.id).length || 0,
            totalSkills: skillStats?.length || 0,
            skillCategories: new Set(skillStats?.map((s) => s.skills?.category).filter(Boolean)).size || 0,
            resourcesAdded: resourceStats?.length || 0,
          }}
        />
      </main>
    </div>
  )
}
