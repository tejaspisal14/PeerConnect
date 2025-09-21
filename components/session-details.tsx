"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SessionDetailsProps {
  session: any
  messages: any[]
  currentUserId: string
}

export default function SessionDetails({ session, messages, currentUserId }: SessionDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isUserMentor = session.mentor_id === currentUserId
  const otherUser = isUserMentor ? session.learner : session.mentor
  const userRole = isUserMentor ? "mentor" : "learner"

  const updateSessionStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("peer_sessions")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "border-orange-300 text-orange-700"
      case "active":
        return "bg-green-600 text-white"
      case "completed":
        return "bg-gray-600 text-white"
      case "cancelled":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{session.skills?.name}</CardTitle>
              <CardDescription className="text-lg">
                {session.skills?.category} • {session.duration_minutes} minutes
              </CardDescription>
            </div>
            <Badge variant="outline" className={getStatusColor(session.status)}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mentor Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">Mentor</h4>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{session.mentor?.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{session.mentor?.display_name}</div>
                  {session.mentor?.timezone && <div className="text-sm text-gray-500">{session.mentor.timezone}</div>}
                </div>
              </div>
              {session.mentor?.bio && <p className="text-sm text-gray-600">{session.mentor.bio}</p>}
            </div>

            {/* Learner Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">Learner</h4>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{session.learner?.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{session.learner?.display_name}</div>
                  {session.learner?.timezone && <div className="text-sm text-gray-500">{session.learner.timezone}</div>}
                </div>
              </div>
              {session.learner?.bio && <p className="text-sm text-gray-600">{session.learner.bio}</p>}
            </div>
          </div>

          {/* AI Match Score */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">AI Match Score</h4>
                <p className="text-sm text-blue-700">
                  Our AI determined this is a {Math.round((session.ai_match_score || 0) * 100)}% compatibility match
                </p>
              </div>
              <div className="text-2xl font-bold text-blue-600">{Math.round((session.ai_match_score || 0) * 100)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Session Actions</CardTitle>
          <CardDescription>Manage your learning session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {session.status === "pending" && (
              <>
                <Button
                  onClick={() => updateSessionStatus("active")}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? "Starting..." : "Start Session"}
                </Button>
                <Button variant="outline" onClick={() => updateSessionStatus("cancelled")} disabled={isLoading}>
                  Cancel Session
                </Button>
              </>
            )}

            {session.status === "active" && (
              <>
                <Button onClick={() => updateSessionStatus("completed")} disabled={isLoading}>
                  {isLoading ? "Completing..." : "Complete Session"}
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/sessions/${session.id}/chat`}>Open Chat</Link>
                </Button>
              </>
            )}

            {session.status === "completed" && (
              <div className="text-center py-4">
                <p className="text-green-600 font-medium">Session completed successfully!</p>
                <p className="text-sm text-gray-500 mt-1">Points have been awarded to both participants.</p>
                <Button asChild variant="outline" className="mt-2 bg-transparent">
                  <Link href={`/sessions/${session.id}/chat`}>View Chat History</Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Messages Preview */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Messages</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href={`/sessions/${session.id}/chat`}>View All Messages</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.slice(-3).map((message) => (
                <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {message.sender?.display_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{message.sender?.display_name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Details */}
      {session.skills?.description && (
        <Card>
          <CardHeader>
            <CardTitle>About {session.skills.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{session.skills.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
