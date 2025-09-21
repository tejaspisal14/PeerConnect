"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Target, Users, BookOpen, Award } from "lucide-react"

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points_required: number
  achievement_type: string
  criteria: any
}

interface UserAchievement {
  id: string
  earned_at: string
  achievements: Achievement
}

interface UserStats {
  points: number
  level: number
  sessionsLearned: number
  sessionsTaught: number
  totalSkills: number
  skillCategories: number
  resourcesAdded: number
}

interface AchievementsDisplayProps {
  userAchievements: UserAchievement[]
  allAchievements: Achievement[]
  userStats: UserStats
}

export default function AchievementsDisplay({
  userAchievements,
  allAchievements,
  userStats,
}: AchievementsDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Get earned achievement IDs
  const earnedAchievementIds = new Set(userAchievements.map((ua) => ua.achievements.id))

  // Calculate progress for each achievement
  const getAchievementProgress = (achievement: Achievement) => {
    const criteria = achievement.criteria

    switch (achievement.achievement_type) {
      case "session":
        if (criteria.sessions_learned) {
          return Math.min(100, (userStats.sessionsLearned / criteria.sessions_learned) * 100)
        }
        if (criteria.sessions_taught) {
          return Math.min(100, (userStats.sessionsTaught / criteria.sessions_taught) * 100)
        }
        break
      case "skill":
        if (criteria.total_skills) {
          return Math.min(100, (userStats.totalSkills / criteria.total_skills) * 100)
        }
        if (criteria.skill_categories) {
          return Math.min(100, (userStats.skillCategories / criteria.skill_categories) * 100)
        }
        break
      case "contribution":
        if (criteria.resources_added) {
          return Math.min(100, (userStats.resourcesAdded / criteria.resources_added) * 100)
        }
        break
      default:
        return 0
    }
    return 0
  }

  // Group achievements by category
  const achievementsByCategory = allAchievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.achievement_type]) {
        acc[achievement.achievement_type] = []
      }
      acc[achievement.achievement_type].push(achievement)
      return acc
    },
    {} as Record<string, Achievement[]>,
  )

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "session":
        return <BookOpen className="w-5 h-5" />
      case "skill":
        return <Target className="w-5 h-5" />
      case "social":
        return <Users className="w-5 h-5" />
      case "contribution":
        return <Star className="w-5 h-5" />
      case "engagement":
        return <Trophy className="w-5 h-5" />
      case "special":
        return <Award className="w-5 h-5" />
      default:
        return <Trophy className="w-5 h-5" />
    }
  }

  // Get category name
  const getCategoryName = (category: string) => {
    switch (category) {
      case "session":
        return "Learning & Teaching"
      case "skill":
        return "Skill Development"
      case "social":
        return "Social Connection"
      case "contribution":
        return "Community Contribution"
      case "engagement":
        return "Engagement"
      case "special":
        return "Special Achievements"
      default:
        return category
    }
  }

  const AchievementCard = ({ achievement, isEarned }: { achievement: Achievement; isEarned: boolean }) => {
    const progress = getAchievementProgress(achievement)
    const isCompleted = progress >= 100 || isEarned

    return (
      <Card className={`transition-all ${isCompleted ? "border-yellow-300 bg-yellow-50" : "hover:shadow-md"}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`text-2xl p-2 rounded-full ${
                  isCompleted ? "bg-yellow-200" : "bg-gray-100"
                } transition-colors`}
              >
                {achievement.icon}
              </div>
              <div>
                <CardTitle className={`text-lg ${isCompleted ? "text-yellow-800" : ""}`}>{achievement.name}</CardTitle>
                <CardDescription className={isCompleted ? "text-yellow-700" : ""}>
                  {achievement.description}
                </CardDescription>
              </div>
            </div>
            {isEarned && (
              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                <Trophy className="w-3 h-3 mr-1" />
                Earned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className={`font-medium ${isCompleted ? "text-yellow-700" : "text-gray-900"}`}>
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{achievement.points_required} points</span>
              {isEarned && (
                <span className="text-yellow-600">
                  Earned{" "}
                  {new Date(
                    userAchievements.find((ua) => ua.achievements.id === achievement.id)?.earned_at || "",
                  ).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const earnedCount = userAchievements.length
  const totalCount = allAchievements.length
  const totalPointsEarned = userAchievements.reduce((sum, ua) => sum + ua.achievements.points_required, 0)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Achievements Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {earnedCount}/{totalCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round((earnedCount / totalCount) * 100)}% complete</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Achievement Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPointsEarned}</div>
            <div className="text-xs text-gray-500 mt-1">From achievements</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Current Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.level}</div>
            <div className="text-xs text-gray-500 mt-1">{userStats.points} total points</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Sessions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {userStats.sessionsLearned + userStats.sessionsTaught}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {userStats.sessionsTaught} taught, {userStats.sessionsLearned} learned
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.keys(achievementsByCategory).map((category) => (
            <TabsTrigger key={category} value={category} className="flex items-center space-x-1">
              {getCategoryIcon(category)}
              <span className="hidden sm:inline">{getCategoryName(category).split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAchievements.map((achievement) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isEarned={earnedAchievementIds.has(achievement.id)}
              />
            ))}
          </div>
        </TabsContent>

        {Object.entries(achievementsByCategory).map(([category, achievements]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(category)}
                  <span>{getCategoryName(category)}</span>
                </CardTitle>
                <CardDescription>
                  {achievements.filter((a) => earnedAchievementIds.has(a.id)).length} of {achievements.length}{" "}
                  achievements earned
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={earnedAchievementIds.has(achievement.id)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
