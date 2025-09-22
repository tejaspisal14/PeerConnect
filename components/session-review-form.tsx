"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface SessionReviewFormProps {
  sessionId: string
  revieweeId: string
  revieweeName: string
  userRole: "mentor" | "learner"
  onReviewSubmitted?: () => void
}

export default function SessionReviewForm({
  sessionId,
  revieweeId,
  revieweeName,
  userRole,
  onReviewSubmitted,
}: SessionReviewFormProps) {
  const [rating, setRating] = useState<number>(1)
  const [reviewText, setReviewText] = useState("")
  const [helpfulRating, setHelpfulRating] = useState<boolean>(true)
  const [wouldRecommend, setWouldRecommend] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmitReview = async () => {
    if (rating < 1) return

    setIsSubmitting(true)
    try {
      console.log("[v0] Starting review submission", { sessionId, revieweeId, rating })

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("Not authenticated")

      console.log("[v0] User authenticated:", user.user.id)

      const { data: session, error: sessionError } = await supabase
        .from("peer_sessions")
        .select("id, status, mentor_id, learner_id")
        .eq("id", sessionId)
        .single()

      if (sessionError) {
        console.error("[v0] Session query error:", sessionError)
        throw new Error("Session not found")
      }

      console.log("[v0] Session data:", session)

      if (session.status !== "completed") {
        throw new Error("Session must be completed before submitting a review")
      }

      // Verify user is part of this session
      if (session.mentor_id !== user.user.id && session.learner_id !== user.user.id) {
        throw new Error("You are not authorized to review this session")
      }

      console.log("[v0] Inserting review into database")

      const { error } = await supabase.from("session_reviews").insert({
        session_id: sessionId,
        reviewer_id: user.user.id,
        reviewee_id: revieweeId,
        rating,
        review_text: reviewText.trim() || null,
        helpful_rating: helpfulRating,
        would_recommend: wouldRecommend,
      })

      if (error) {
        console.error("[v0] Review insertion error:", error)
        throw error
      }

      console.log("[v0] Review submitted successfully")
      setIsSubmitted(true)
      onReviewSubmitted?.()

      // Refresh the page to show updated session status
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("[v0] Error submitting review:", error)
      alert(`Error submitting review: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-green-200">
        <CardContent className="text-center py-8">
          <div className="text-green-600 text-lg font-medium mb-2">Review Submitted!</div>
          <p className="text-gray-600">Thank you for your feedback. This helps improve our matching algorithm.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Session</CardTitle>
        <CardDescription>
          How was your {userRole === "mentor" ? "teaching" : "learning"} session with {revieweeName}?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Stars */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Overall Rating (1-5)</Label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 rounded transition-colors ${
                  star <= rating ? "text-yellow-400 hover:text-yellow-500" : "text-gray-300 hover:text-gray-400"
                }`}
              >
                <Star className="w-6 h-6 fill-current" />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">{rating > 0 && `${rating}/5`}</span>
          </div>
        </div>

        {/* Written Review */}
        <div className="space-y-2">
          <Label htmlFor="review-text">Share Your Experience (Optional)</Label>
          <Textarea
            id="review-text"
            placeholder={`Tell us about your ${userRole === "mentor" ? "teaching" : "learning"} experience...`}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
          />
        </div>

        {/* Quick Feedback */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="helpful"
              checked={helpfulRating}
              onCheckedChange={(checked) => setHelpfulRating(checked as boolean)}
            />
            <Label htmlFor="helpful" className="text-sm">
              This session was helpful for my learning goals
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recommend"
              checked={wouldRecommend}
              onCheckedChange={(checked) => setWouldRecommend(checked as boolean)}
            />
            <Label htmlFor="recommend" className="text-sm">
              I would recommend {revieweeName} to other learners
            </Label>
          </div>
        </div>

        {/* Submit Button */}
        <Button onClick={handleSubmitReview} disabled={rating < 1 || isSubmitting} className="w-full">
          {isSubmitting ? "Submitting Review..." : "Submit Review"}
        </Button>

        {rating < 1 && <p className="text-sm text-red-600 text-center">Please select a rating before submitting</p>}
      </CardContent>
    </Card>
  )
}
