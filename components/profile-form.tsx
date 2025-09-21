"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Profile {
  id: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  location: string | null
  timezone: string | null
}

interface ProfileFormProps {
  profile: Profile | null
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [location, setLocation] = useState(profile?.location || "")
  const [timezone, setTimezone] = useState(profile?.timezone || "")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: profile?.id,
        display_name: displayName,
        bio: bio || null,
        location: location || null,
        timezone: timezone || null,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      setMessage({ type: "success", text: "Profile updated successfully!" })
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          This information will be visible to other users when you connect for learning sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How you'd like to be known"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself, your interests, and what you're passionate about..."
              rows={4}
            />
            <p className="text-sm text-gray-500">A good bio helps others understand your background and interests.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g., UTC-5, EST, PST"
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
