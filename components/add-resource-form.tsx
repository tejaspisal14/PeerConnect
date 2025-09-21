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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Skill {
  id: string
  name: string
  category: string
}

interface AddResourceFormProps {
  skills: Skill[]
  userId: string
}

export default function AddResourceForm({ skills, userId }: AddResourceFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [resourceType, setResourceType] = useState("article")
  const [skillId, setSkillId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("resources").insert({
        title,
        description: description || null,
        url: url || null,
        resource_type: resourceType,
        skill_id: skillId || null,
        created_by: userId,
        ai_generated: false,
      })

      if (error) throw error

      setMessage({ type: "success", text: "Resource added successfully!" })
      setTimeout(() => {
        router.push("/resources")
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

  // Group skills by category
  const skillsByCategory = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Details</CardTitle>
        <CardDescription>
          Share a valuable learning resource with the PeerConnect community. All submissions are reviewed to ensure
          quality.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete React Tutorial for Beginners"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what makes this resource valuable and what learners will gain from it..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/resource"
            />
            <p className="text-sm text-gray-500">Link to the resource (optional for books or offline materials)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type *</Label>
              <Select value={resourceType} onValueChange={setResourceType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="tool">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill">Related Skill</Label>
              <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific skill</SelectItem>
                  {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-medium text-gray-500">{category}</div>
                      {categorySkills.map((skill) => (
                        <SelectItem key={skill.id} value={skill.id}>
                          {skill.name}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
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
              {isLoading ? "Adding Resource..." : "Add Resource"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/resources")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
