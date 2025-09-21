"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react"

interface UserPoints {
  user_id: string
  points: number
  level: number
  total_sessions_taught: number
  total_sessions_learned: number
  profiles: {
    display_name: string
    bio: string | null
    location: string | null
  }
}

interface RecentAchievement {
  id: string
  earned_at: string
  user_id: string
  achievements: {
    name: string
    icon: string
    points_required: number
  }
  profiles: {
    display_name: string
  }
}

interface LeaderboardDisplayProps {
  topUsers: UserPoints[]
  currentUserId: string
  userRank: number
  recentAchievements: RecentAchievement[]
}

export default function LeaderboardDisplay({
  topUsers,
  currentUserId,
  userRank,
  recentAchievements,
}: LeaderboardDisplayProps) {
  const [selectedTab, setSelectedTab] = useState("points")

  // Get rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{rank}</span>
    }
  }

  // Get rank background color
  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200"
      default:
        return "bg-white hover:bg-gray-50"
    }
  }

  // Sort users by different criteria
  const sortedUsers = {
    points: [...topUsers].sort((a, b) => b.points - a.points),
    level: [...topUsers].sort((a, b) => b.level - a.level),
    teaching: [...topUsers].sort((a, b) => b.total_sessions_taught - a.total_sessions_taught),
    learning: [...topUsers].sort((a, b) => b.total_sessions_learned - a.total_sessions_learned),
  }

  const UserCard = ({ user, rank, metric }: { user: UserPoints; rank: number; metric: string }) => {
    const isCurrentUser = user.user_id === currentUserId
    const metricValue = {
      points: user.points,
      level: user.level,
      teaching: user.total_sessions_taught,
      learning: user.total_sessions_learned,
    }[metric]

    const metricLabel = {
      points: "points",
      level: "level",
      teaching: "sessions taught",
      learning: "sessions learned",
    }[metric]

    return (
      <Card
        className={`transition-all ${getRankBgColor(rank)} ${
          isCurrentUser ? "ring-2 ring-blue-500 ring-opacity-50" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8">{getRankIcon(rank)}</div>
              <Avatar>
                <AvatarFallback>{user.profiles.display_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 truncate">{user.profiles.display_name}</h3>
                  {isCurrentUser && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      You
                    </Badge>
                  )}
                </div>
                {user.profiles.location && <p className="text-sm text-gray-500 truncate">{user.profiles.location}</p>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{metricValue.toLocaleString()}</div>
              <div className="text-xs text-gray-500">{metricLabel}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User's Current Rank */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Your Ranking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">#{userRank || "N/A"}</div>
              <div className="text-sm text-gray-600">Overall Rank</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {topUsers.find((u) => u.user_id === currentUserId)?.points || 0}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leaderboards */}
        <div className="lg:col-span-2">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="level">Level</TabsTrigger>
              <TabsTrigger value="teaching">Teaching</TabsTrigger>
              <TabsTrigger value="learning">Learning</TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Point Earners</CardTitle>
                  <CardDescription>Users with the highest total points from all activities</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {sortedUsers.points.slice(0, 20).map((user, index) => (
                  <UserCard key={user.user_id} user={user} rank={index + 1} metric="points" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="level" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Highest Levels</CardTitle>
                  <CardDescription>Users who have reached the highest experience levels</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {sortedUsers.level.slice(0, 20).map((user, index) => (
                  <UserCard key={user.user_id} user={user} rank={index + 1} metric="level" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="teaching" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Mentors</CardTitle>
                  <CardDescription>Users who have taught the most sessions</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {sortedUsers.teaching.slice(0, 20).map((user, index) => (
                  <UserCard key={user.user_id} user={user} rank={index + 1} metric="teaching" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Top Learners</CardTitle>
                  <CardDescription>Users who have completed the most learning sessions</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {sortedUsers.learning.slice(0, 20).map((user, index) => (
                  <UserCard key={user.user_id} user={user} rank={index + 1} metric="learning" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Achievements */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Recent Achievements</span>
              </CardTitle>
              <CardDescription>Latest achievements earned by the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg">{achievement.achievements.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{achievement.achievements.name}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {achievement.profiles.display_name} • {achievement.achievements.points_required} pts
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
