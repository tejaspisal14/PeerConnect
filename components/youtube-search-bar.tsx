import { useEffect } from "react"
"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface YouTubeVideo {
  id: string
  title: string
  url: string
  thumbnail: string
}

export default function YouTubeSearchBar() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])
    try {
      // Use YouTube Data API v3 (replace YOUR_API_KEY with your actual key)
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
      if (!apiKey) {
        setError("YouTube API key not configured.")
        setLoading(false)
        return
      }
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
          query
        )}&maxResults=8&key=${apiKey}`
      )
      const data = await res.json()
      if (data.items) {
        setResults(
          data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            thumbnail: item.snippet.thumbnails.medium.url,
          }))
        )
      } else {
        setError("No results found.")
      }
    } catch (err) {
      setError("Failed to fetch YouTube results.")
    }
    setLoading(false)
  }

  if (!isClient) return null
  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search YouTube for resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {results.length > 0 && (
        <div className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {results.map((video) => (
              <div key={video.id} className="rounded-lg border bg-white shadow hover:scale-[1.02] transition-transform flex flex-col h-full">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img src={video.thumbnail} alt={video.title} className="rounded-t-lg w-full h-40 object-cover" />
                  <div className="p-3">
                    <div className="font-medium text-gray-900 text-base mb-1 line-clamp-2">{video.title}</div>
                    <div className="text-xs text-blue-600">Watch on YouTube</div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
