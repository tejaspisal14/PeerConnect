import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SkillsManager from "@/components/skills-manager"

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Skills Management</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Your Skills</h2>
          <p className="text-gray-600">
            Select skills you can teach and skills you want to learn. This helps us match you with the right peers.
          </p>
        </div>

        <SkillsManager allSkills={allSkills || []} userSkills={userSkills || []} userId={data.user.id} />
      </main>
    </div>
  )
}
