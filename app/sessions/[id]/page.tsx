import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SessionDetails from "@/components/session-details"
import ThemeToggle from "@/components/ui/theme-toggle"

interface SessionPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get session details
  const { data: session } = await supabase
    .from("peer_sessions")
    .select(`
      *,
      skills (name, category, description),
      mentor:mentor_id (display_name, bio, timezone),
      learner:learner_id (display_name, bio, timezone)
    `)
    .eq("id", id)
    .single()

  if (!session) {
    redirect("/sessions")
  }

  // Check if user is part of this session
  if (session.mentor_id !== data.user.id && session.learner_id !== data.user.id) {
    redirect("/sessions")
  }

  // Get chat messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select(`
      *,
      sender:sender_id (display_name)
    `)
    .eq("session_id", id)
    .order("created_at", { ascending: true })

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
              <span className="text-gray-700 dark:text-gray-300">Session: {session.skills?.name}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <SessionDetails session={session} messages={messages || []} currentUserId={data.user.id} />
      </main>
    </div>
  )
}
