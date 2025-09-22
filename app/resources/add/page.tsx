import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AddResourceForm from "@/components/add-resource-form"

export default async function AddResourcePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all skills for the form
  const { data: skills } = await supabase
    .from("skills")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Add Resource</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Share a Learning Resource</h2>
          <p className="text-gray-600">
            Help the community by sharing valuable learning materials, tutorials, or tools.
          </p>
        </div>

        <AddResourceForm skills={skills || []} userId={data.user.id} />
      </main>
    </div>
  )
}
