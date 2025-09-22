"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface Skill {
  id: string
  name: string
  category: string
}

interface UserSkill {
  id: string
  skill_id: string
  skill_type: "teaching" | "learning"
  skills: Skill
}

interface Peer {
  id: string
  display_name: string
  bio: string | null
  location: string | null
  timezone: string | null
  skills: Skill[]
  total_sessions: number
  avg_rating: number
}

interface PeerFinderProps {
  userId: string
  userLearningSkills: UserSkill[]
  userTeachingSkills: UserSkill[]
}

export default function PeerFinder({ userId, userLearningSkills, userTeachingSkills }: PeerFinderProps) {
  const [selectedSkill, setSelectedSkill] = useState<string>("")
  const [mentors, setMentors] = useState<Peer[]>([])
  const [learners, setLearners] = useState<Peer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("find-mentors")

  const router = useRouter()
  const supabase = createClient()

  const findMentors = async (skillId?: string) => {
    setIsLoading(true)
    try {
      const targetSkillId = skillId || (userLearningSkills.length > 0 ? userLearningSkills[0].skill_id : null)

      if (!targetSkillId) {
        setMentors([])
        return
      }

      const { data: potentialMentors } = await supabase
        .from("user_skills")
        .select(`
          user_id,
          skills (id, name, category),
          profiles!inner (
            id,
            display_name,
            bio,
            location,
            timezone
          )
        `)
        .eq("skill_type", "teaching")
        .eq("skill_id", targetSkillId)
        .neq("user_id", userId)

      if (potentialMentors) {
        const mentorsWithStats = await Promise.all(
          potentialMentors.map(async (mentor) => {
            const { data: sessionStats } = await supabase
              .from("peer_sessions")
              .select("status")
              .eq("mentor_id", mentor.user_id)

            const { data: reviews } = await supabase
              .from("session_reviews")
              .select("rating")
              .eq("reviewee_id", mentor.user_id)

            const totalSessions = sessionStats?.length || 0

            let avgRating = 1.0
            if (reviews && reviews.length > 0) {
              const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
              avgRating = totalRating / reviews.length
            }

            return {
              id: mentor.user_id,
              display_name: mentor.profiles.display_name,
              bio: mentor.profiles.bio,
              location: mentor.profiles.location,
              timezone: mentor.profiles.timezone,
              skills: [mentor.skills],
              total_sessions: totalSessions,
              avg_rating: avgRating,
            }
          }),
        )

        mentorsWithStats.sort((a, b) => b.avg_rating - a.avg_rating)
        setMentors(mentorsWithStats)
      }
    } catch (error) {
      console.error("Error finding mentors:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const findLearners = async (skillId?: string) => {
    setIsLoading(true)
    try {
      const targetSkillId = skillId || (userTeachingSkills.length > 0 ? userTeachingSkills[0].skill_id : null)

      if (!targetSkillId) {
        setLearners([])
        return
      }

      const { data: potentialLearners } = await supabase
        .from("user_skills")
        .select(`
          user_id,
          skills (id, name, category),
          profiles!inner (
            id,
            display_name,
            bio,
            location,
            timezone
          )
        `)
        .eq("skill_type", "learning")
        .eq("skill_id", targetSkillId)
        .neq("user_id", userId)

      if (potentialLearners) {
        const learnersWithStats = await Promise.all(
          potentialLearners.map(async (learner) => {
            const { data: sessionStats } = await supabase
              .from("peer_sessions")
              .select("status")
              .eq("learner_id", learner.user_id)

            const { data: reviews } = await supabase
              .from("session_reviews")
              .select("rating")
              .eq("reviewee_id", learner.user_id)

            const totalSessions = sessionStats?.length || 0

            let avgRating = 1.0
            if (reviews && reviews.length > 0) {
              const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
              avgRating = totalRating / reviews.length
            }

            return {
              id: learner.user_id,
              display_name: learner.profiles.display_name,
              bio: learner.profiles.bio,
              location: learner.profiles.location,
              timezone: learner.profiles.timezone,
              skills: [learner.skills],
              total_sessions: totalSessions,
              avg_rating: avgRating,
            }
          }),
        )

        learnersWithStats.sort((a, b) => b.avg_rating - a.avg_rating)
        setLearners(learnersWithStats)
      }
    } catch (error) {
      console.error("Error finding learners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const createSession = async (peerId: string, skillId: string, role: "mentor" | "learner") => {
    try {
      const sessionData = {
        mentor_id: role === "mentor" ? userId : peerId,
        learner_id: role === "learner" ? userId : peerId,
        skill_id: skillId,
        status: "pending",
      }

      const { data, error } = await supabase.from("peer_sessions").insert(sessionData).select().single()

      if (error) throw error

      router.push(`/sessions/${data.id}`)
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  useEffect(() => {
    if (activeTab === "find-mentors") {
      findMentors()
    } else {
      findLearners()
    }
  }, [activeTab])

  const PeerCard = ({ peer, role }: { peer: Peer; role: "mentor" | "learner" }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>{peer.display_name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{peer.display_name}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {peer.location && <span>{peer.location}</span>}
                {peer.timezone && <span>• {peer.timezone}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {peer.total_sessions} sessions • ⭐ {peer.avg_rating.toFixed(1)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {peer.bio && <p className="text-sm text-gray-600 line-clamp-2">{peer.bio}</p>}

          <div className="flex flex-wrap gap-1">
            {peer.skills.map((skill) => (
              <Badge key={skill.id} variant="secondary" className="text-xs">
                {skill.name}
              </Badge>
            ))}
          </div>

          <Button className="w-full" onClick={() => createSession(peer.id, peer.skills[0].id, role)}>
            {role === "mentor" ? "Request Session" : "Offer to Teach"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="find-mentors">Find Mentors</TabsTrigger>
          <TabsTrigger value="find-learners">Find Learners</TabsTrigger>
        </TabsList>

        <TabsContent value="find-mentors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Mentors</CardTitle>
              <CardDescription>Connect with experienced peers who can teach you new skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What do you want to learn?</label>
                  <Select
                    value={selectedSkill}
                    onValueChange={(value) => {
                      setSelectedSkill(value)
                      findMentors(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill you want to learn" />
                    </SelectTrigger>
                    <SelectContent>
                      {userLearningSkills.map((userSkill) => (
                        <SelectItem key={userSkill.id} value={userSkill.skill_id}>
                          {userSkill.skills.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userLearningSkills.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't added any learning goals yet.</p>
                    <Button onClick={() => router.push("/skills")}>Add Learning Goals</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Finding the best mentors for you...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <PeerCard key={mentor.id} peer={mentor} role="mentor" />
              ))}
            </div>
          )}

          {!isLoading && mentors.length === 0 && selectedSkill && (
            <div className="text-center py-8">
              <p className="text-gray-500">No mentors found for this skill. Try again later!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="find-learners" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Learners</CardTitle>
              <CardDescription>Share your knowledge by teaching others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">What can you teach?</label>
                  <Select
                    value={selectedSkill}
                    onValueChange={(value) => {
                      setSelectedSkill(value)
                      findLearners(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill you can teach" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTeachingSkills.map((userSkill) => (
                        <SelectItem key={userSkill.id} value={userSkill.skill_id}>
                          {userSkill.skills.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userTeachingSkills.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">You haven't added any teaching skills yet.</p>
                    <Button onClick={() => router.push("/skills")}>Add Teaching Skills</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Finding learners who need your expertise...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learners.map((learner) => (
                <PeerCard key={learner.id} peer={learner} role="learner" />
              ))}
            </div>
          )}

          {!isLoading && learners.length === 0 && selectedSkill && (
            <div className="text-center py-8">
              <p className="text-gray-500">No learners found for this skill. Try again later!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
