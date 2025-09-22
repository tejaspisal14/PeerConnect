"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, BookOpen, Video, FileText, Wrench, Plus, Search, Sparkles } from "lucide-react"
import YouTubeSearchBar from "@/components/youtube-search-bar"
import dynamic from "next/dynamic"
const DynamicYouTubeSearchBar = dynamic(() => import("@/components/youtube-search-bar"), { ssr: false })
import Link from "next/link"

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

interface Resource {
  id: string
  title: string
  description: string | null
  url: string | null
  resource_type: string
  skill_id: string | null
  ai_generated: boolean
  created_at: string
  skills?: Skill
  created_by?: { display_name: string }
}

interface ResourceSearchProps {
  skills: Skill[]
  userSkills: UserSkill[]
  initialResources: Resource[]
  userId: string
}

export default function ResourceSearch({ skills, userSkills, initialResources, userId }: ResourceSearchProps) {
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSkill, setSelectedSkill] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const supabase = createClient()

  // Get resource type icon
  const getResourceIcon = (type: string) => {
    switch (type) {
      case "article":
        return <FileText className="w-4 h-4" />
      case "video":
        return <Video className="w-4 h-4" />
      case "course":
        return <BookOpen className="w-4 h-4" />
      case "book":
        return <BookOpen className="w-4 h-4" />
      case "tool":
        return <Wrench className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  // Get resource type color
  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case "article":
        return "bg-blue-100 text-blue-800"
      case "video":
        return "bg-red-100 text-red-800"
      case "course":
        return "bg-green-100 text-green-800"
      case "book":
        return "bg-purple-100 text-purple-800"
      case "tool":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Search resources
  const searchResources = async () => {
    setIsLoading(true)
    try {
      let query = supabase.from("resources").select(`
          *,
          skills (name, category),
          created_by (display_name)
        `)

      // Apply filters
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      if (selectedSkill !== "all") {
        query = query.eq("skill_id", selectedSkill)
      }

      if (selectedType !== "all") {
        query = query.eq("resource_type", selectedType)
      }

      const { data } = await query.order("created_at", { ascending: false }).limit(50)

      setResources(data || [])
    } catch (error) {
      console.error("Error searching resources:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get personalized recommendations
  const getRecommendations = async () => {
    setIsLoading(true)
    try {
      // Get resources for user's learning skills
      const learningSkillIds = userSkills.filter((us) => us.skill_type === "learning").map((us) => us.skill_id)

      if (learningSkillIds.length === 0) {
        setResources([])
        return
      }

      const { data } = await supabase
        .from("resources")
        .select(`
          *,
          skills (name, category),
          created_by (display_name)
        `)
        .in("skill_id", learningSkillIds)
        .order("created_at", { ascending: false })
        .limit(20)

      // Simple AI-like scoring based on user preferences
      const scoredResources = (data || []).map((resource) => ({
        ...resource,
        ai_score: Math.random() * 0.3 + 0.7, // Simulated AI relevance score
      }))

      // Sort by AI score
      scoredResources.sort((a, b) => b.ai_score - a.ai_score)

      setResources(scoredResources)
    } catch (error) {
      console.error("Error getting recommendations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get trending resources
  const getTrendingResources = async () => {
    setIsLoading(true)
    try {
      // For demo purposes, we'll simulate trending by recent creation and random popularity
      const { data } = await supabase
        .from("resources")
        .select(`
          *,
          skills (name, category),
          created_by (display_name)
        `)
        .order("created_at", { ascending: false })
        .limit(30)

      // Simulate trending algorithm
      const trendingResources = (data || [])
        .map((resource) => ({
          ...resource,
          trending_score: Math.random() * 100,
        }))
        .sort((a, b) => b.trending_score - a.trending_score)
        .slice(0, 15)

      setResources(trendingResources)
    } catch (error) {
      console.error("Error getting trending resources:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle tab change
  useEffect(() => {
    if (activeTab === "recommended") {
      getRecommendations()
    } else if (activeTab === "trending") {
      getTrendingResources()
    } else {
      setResources(initialResources)
    }
  }, [activeTab])

  // Handle search
  useEffect(() => {
    if (activeTab === "all") {
      searchResources()
    }
  }, [searchTerm, selectedSkill, selectedType])

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getResourceIcon(resource.resource_type)}
              <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
              {resource.ai_generated && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className={getResourceTypeColor(resource.resource_type)}>
                {resource.resource_type}
              </Badge>
              {resource.skills && (
                <Badge variant="outline" className="text-xs">
                  {resource.skills.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resource.description && <p className="text-sm text-gray-600 line-clamp-3">{resource.description}</p>}

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {resource.created_by ? `Added by ${resource.created_by.display_name}` : "Community resource"}
            </div>
            {resource.url && (
              <Button size="sm" variant="outline" asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">All Resources</TabsTrigger>
            <TabsTrigger value="recommended">
              <Sparkles className="w-4 h-4 mr-1" />
              For You
            </TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>
          <div className="w-full max-w-md ml-4">
            <DynamicYouTubeSearchBar />
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search Resources</CardTitle>
              <CardDescription>Find learning materials by keyword, skill, or type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {skills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                    <SelectItem value="book">Books</SelectItem>
                    <SelectItem value="tool">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommended" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>Resources curated specifically for your learning goals and interests</CardDescription>
            </CardHeader>
            <CardContent>
              {userSkills.filter((us) => us.skill_type === "learning").length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Add some learning goals to get personalized recommendations!</p>
                  <Button asChild>
                    <Link href="/skills">Add Learning Goals</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  Based on your learning goals:{" "}
                  {userSkills
                    .filter((us) => us.skill_type === "learning")
                    .map((us) => us.skills.name)
                    .join(", ")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trending Resources</CardTitle>
              <CardDescription>Popular resources in the PeerConnect community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                Discover what other learners are finding most valuable this week
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Searching for the best resources...</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}

      {!isLoading && resources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No resources found matching your criteria.</div>
          <Button asChild>
            <Link href="/resources/add">
              <Plus className="w-4 h-4 mr-1" />
              Add the First Resource
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
