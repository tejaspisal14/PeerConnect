import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PeerFinder from "@/components/peer-finder"

export default async function FindPeersPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's learning skills (what they want to learn)
  const { data: userLearningSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (*)
    `)
    .eq("user_id", data.user.id)
    .eq("skill_type", "learning")

  // Get user's teaching skills (what they can teach)
  const { data: userTeachingSkills } = await supabase
    .from("user_skills")
    .select(`
      *,
      skills (*)
    `)
    .eq("user_id", data.user.id)
    .eq("skill_type", "teaching")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Find Learning Partners</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Learning Partner</h2>
          <p className="text-gray-600">
            Our smart matching system connects you with peers based on skills, availability, and learning goals.
          </p>
        </div>

        <PeerFinder
          userId={data.user.id}
          userLearningSkills={userLearningSkills || []}
          userTeachingSkills={userTeachingSkills || []}
        />
      </main>
    </div>
  )
}
