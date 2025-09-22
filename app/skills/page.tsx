import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SkillsManager from "@/components/skills-manager"
import ThemeToggle from "@/components/ui/theme-toggle"

export default async function SkillsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all available skills
  const { data: allSkills } = await supabase
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  // Get user's current skills
  const { data: userSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (*)
    `)
    .eq("user_id", data.user.id)

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-100 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-700">
      <ThemeToggle />
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">PeerConnect</h1>
            <span className="text-gray-400">|</span>
            <span className="text-gray-700 dark:text-gray-300">Skills Management</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Manage Your Skills</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Select skills you can teach and skills you want to learn. This helps us match you with the right peers.
          </p>
        </div>

        <SkillsManager allSkills={allSkills || []} userSkills={userSkills || []} userId={data.user.id} />
      </main>
    </div>
  )
}
