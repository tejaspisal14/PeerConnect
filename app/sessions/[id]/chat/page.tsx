import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ChatInterface from "@/components/chat-interface"

interface ChatPageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: ChatPageProps) {
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
      skills (name, category),
      mentor:mentor_id (display_name, avatar_url),
      learner:learner_id (display_name, avatar_url)
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

  // Get initial chat messages
  const { data: messages } = await supabase
    .from("chat_messages")
    .select(`
      *,
      sender:sender_id (display_name, avatar_url)
    `)
    .eq("session_id", id)
    .order("created_at", { ascending: true })

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">PeerConnect</h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">Chat: {session.skills?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {session.mentor_id === data.user.id ? session.learner?.display_name : session.mentor?.display_name}
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface sessionId={id} currentUserId={data.user.id} initialMessages={messages || []} session={session} />
      </div>
    </div>
  )
}
