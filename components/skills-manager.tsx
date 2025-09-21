"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Skill {
  id: string
  name: string
  category: string
  description: string | null
}

interface UserSkill {
  id: string
  skill_id: string
  skill_type: "teaching" | "learning"
  proficiency_level: number
  skills: Skill
}

interface SkillsManagerProps {
  allSkills: Skill[]
  userSkills: UserSkill[]
  userId: string
}

export default function SkillsManager({ allSkills, userSkills, userId }: SkillsManagerProps) {
  const [selectedTeachingSkills, setSelectedTeachingSkills] = useState<Set<string>>(
    new Set(userSkills.filter((us) => us.skill_type === "teaching").map((us) => us.skill_id)),
  )
  const [selectedLearningSkills, setSelectedLearningSkills] = useState<Set<string>>(
    new Set(userSkills.filter((us) => us.skill_type === "learning").map((us) => us.skill_id)),
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Group skills by category
  const skillsByCategory = allSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  // Filter skills based on search term
  const filteredSkills = searchTerm
    ? allSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          skill.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : allSkills

  const toggleSkill = (skillId: string, type: "teaching" | "learning") => {
    if (type === "teaching") {
      const newSet = new Set(selectedTeachingSkills)
      if (newSet.has(skillId)) {
        newSet.delete(skillId)
      } else {
        newSet.add(skillId)
        // Remove from learning if adding to teaching
        selectedLearningSkills.delete(skillId)
        setSelectedLearningSkills(new Set(selectedLearningSkills))
      }
      setSelectedTeachingSkills(newSet)
    } else {
      const newSet = new Set(selectedLearningSkills)
      if (newSet.has(skillId)) {
        newSet.delete(skillId)
      } else {
        newSet.add(skillId)
        // Remove from teaching if adding to learning
        selectedTeachingSkills.delete(skillId)
        setSelectedTeachingSkills(new Set(selectedTeachingSkills))
      }
      setSelectedLearningSkills(newSet)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // Delete existing user skills
      await supabase.from("user_skills").delete().eq("user_id", userId)

      // Insert new teaching skills
      const teachingSkillsData = Array.from(selectedTeachingSkills).map((skillId) => ({
        user_id: userId,
        skill_id: skillId,
        skill_type: "teaching" as const,
        proficiency_level: 3, // Default proficiency
      }))

      // Insert new learning skills
      const learningSkillsData = Array.from(selectedLearningSkills).map((skillId) => ({
        user_id: userId,
        skill_id: skillId,
        skill_type: "learning" as const,
        proficiency_level: 1, // Default proficiency for learning
      }))

      const allSkillsData = [...teachingSkillsData, ...learningSkillsData]

      if (allSkillsData.length > 0) {
        const { error } = await supabase.from("user_skills").insert(allSkillsData)

        if (error) throw error
      }

      setMessage({ type: "success", text: "Skills updated successfully!" })
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
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Skills</CardTitle>
          <CardDescription>Find skills by name or category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="e.g., JavaScript, Design, Marketing..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills Selection */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Skills I Can Teach</CardTitle>
            <CardDescription>Select skills where you can mentor others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => {
                const categorySkills = searchTerm ? skills.filter((skill) => filteredSkills.includes(skill)) : skills

                if (categorySkills.length === 0) return null

                return (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant={selectedTeachingSkills.has(skill.id) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            selectedTeachingSkills.has(skill.id)
                              ? "bg-green-600 hover:bg-green-700"
                              : "hover:bg-green-50 hover:border-green-300"
                          }`}
                          onClick={() => toggleSkill(skill.id, "teaching")}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-700">Skills I Want to Learn</CardTitle>
            <CardDescription>Select skills where you're seeking mentorship</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => {
                const categorySkills = searchTerm ? skills.filter((skill) => filteredSkills.includes(skill)) : skills

                if (categorySkills.length === 0) return null

                return (
                  <div key={category}>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant={selectedLearningSkills.has(skill.id) ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            selectedLearningSkills.has(skill.id)
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "hover:bg-blue-50 hover:border-blue-300"
                          }`}
                          onClick={() => toggleSkill(skill.id, "learning")}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-green-700 mb-2">Teaching ({selectedTeachingSkills.size} skills)</h4>
              <div className="flex flex-wrap gap-1">
                {Array.from(selectedTeachingSkills).map((skillId) => {
                  const skill = allSkills.find((s) => s.id === skillId)
                  return skill ? (
                    <Badge key={skillId} variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {skill.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-700 mb-2">Learning ({selectedLearningSkills.size} skills)</h4>
              <div className="flex flex-wrap gap-1">
                {Array.from(selectedLearningSkills).map((skillId) => {
                  const skill = allSkills.find((s) => s.id === skillId)
                  return skill ? (
                    <Badge key={skillId} variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                      {skill.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Skills"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
