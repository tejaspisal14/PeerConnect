"use client"

import type React from "react"
import JitsiVideoCall from "./jitsi-video-call"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Video } from "lucide-react"

interface Message {
  id: string
  message: string
  message_type: string
  created_at: string
  sender_id: string
  sender: {
    display_name: string
    avatar_url?: string
  }
}

interface ChatInterfaceProps {
  sessionId: string
  currentUserId: string
  initialMessages: Message[]
  session: any
}

export default function ChatInterface({ sessionId, currentUserId, initialMessages, session }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showVideoCall, setShowVideoCall] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const isUserMentor = session.mentor_id === currentUserId
  const otherUser = isUserMentor ? session.learner : session.mentor

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", payload.new.sender_id)
            .single()

          const newMessage = {
            ...payload.new,
            sender: senderData || { display_name: "Unknown User" },
          } as Message

          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("chat_messages").insert({
        session_id: sessionId,
        sender_id: currentUserId,
        message: newMessage.trim(),
        message_type: "text",
      })

      if (error) throw error

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendSystemMessage = async (message: string) => {
    try {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        sender_id: currentUserId,
        message,
        message_type: "system",
      })
    } catch (error) {
      console.error("Error sending system message:", error)
    }
  }

  const formatTime = (timestamp: string) => {
    if (!isMounted) {
      return new Date(timestamp).toISOString().slice(11, 16)
    }
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    if (!isMounted) {
      const date = new Date(dateString)
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }
    return new Date(dateString).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}
    messages.forEach((message) => {
      const date = new Date(message.created_at).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="h-full flex flex-col">
      <div className="bg-blue-50 border-b px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs">{otherUser?.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{otherUser?.display_name}</div>
              <div className="text-xs text-gray-500">
                {isUserMentor ? "Learning" : "Teaching"} {session.skills?.name}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {session.status}
            </Badge>
            <Button
              size="sm"
              variant={showVideoCall ? "default" : "outline"}
              className="h-8"
              onClick={() => setShowVideoCall(!showVideoCall)}
            >
              <Video className="w-4 h-4 mr-1" />
              {showVideoCall ? "Hide Video" : "Start Video"}
            </Button>
          </div>
        </div>
      </div>

      {showVideoCall && (
        <div className="border-b">
          <JitsiVideoCall
            sessionId={sessionId}
            currentUserId={currentUserId}
            currentUserName={isUserMentor ? session.mentor?.display_name : session.learner?.display_name}
            otherUserName={isUserMentor ? session.learner?.display_name : session.mentor?.display_name}
            isActive={session.status === "active"}
            onCallEnd={() => {
              console.log("[v0] Video call ended from chat interface")
              setShowVideoCall(false)
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {Object.entries(messageGroups).map(([date, dayMessages]) => (
          <div key={date}>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">{formatDate(date)}</div>
            </div>

            <div className="space-y-4">
              {dayMessages.map((message) => {
                const isOwnMessage = message.sender_id === currentUserId
                const isSystemMessage = message.message_type === "system"

                if (isSystemMessage) {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">{message.message}</div>
                    </div>
                  )
                }

                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {message.sender?.display_name?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage ? "bg-blue-600 text-white rounded-br-md" : "bg-white border rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                          {formatTime(message.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-2 max-w-xs">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{otherUser?.display_name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <Button type="button" size="sm" variant="outline" className="flex-shrink-0 bg-transparent">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" size="sm" disabled={isLoading || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <div className="bg-gray-50 border-t px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => sendSystemMessage("Session started")} className="text-xs">
            Mark Session Started
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendSystemMessage("Taking a 5-minute break")}
            className="text-xs"
          >
            Take Break
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendSystemMessage("Session completed successfully")}
            className="text-xs"
          >
            End Session
          </Button>
        </div>
      </div>
    </div>
  )
}
