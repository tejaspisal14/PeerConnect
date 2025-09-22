"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react"

interface JitsiVideoCallProps {
  sessionId: string
  currentUserId: string
  currentUserName: string
  otherUserName: string
  isActive: boolean
  onCallEnd?: () => void
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: any
  }
}

export default function JitsiVideoCall({
  sessionId,
  currentUserId,
  currentUserName,
  otherUserName,
  isActive,
  onCallEnd,
}: JitsiVideoCallProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<any>(null)
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isInCall, setIsInCall] = useState(false)

  const roomName = `peerconnect-${sessionId}`
  const inviteLink = `https://meet.jit.si/${roomName}`

  // Load Jitsi Meet API script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.JitsiMeetExternalAPI) {
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = () => {
        console.log("[v1] Jitsi Meet API loaded")
        setIsJitsiLoaded(true)
      }
      script.onerror = () => {
        console.error("[v1] Failed to load Jitsi Meet API")
      }
      document.head.appendChild(script)

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script)
        }
      }
    } else if (window.JitsiMeetExternalAPI) {
      setIsJitsiLoaded(true)
    }
  }, [])

  // Initialize Jitsi when component becomes active
  useEffect(() => {
    if (isActive && isJitsiLoaded && jitsiContainerRef.current && !api) {
      initializeJitsi()
    }

    return () => {
      if (api) {
        api.dispose()
        setApi(null)
        setIsInCall(false)
      }
    }
  }, [isActive, isJitsiLoaded])

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) return

    const domain = "meet.jit.si"

    const options = {
      roomName,
      width: "100%",
      height: 400,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: currentUserName || "Guest",
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "chat",
          "settings",
          "raisehand",
          "videoquality",
          "tileview",
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
      },
    }

    try {
      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options)

      jitsiApi.addEventListener("videoConferenceJoined", () => {
        console.log("[v1] User joined the video conference")
        setIsInCall(true)
      })

      jitsiApi.addEventListener("videoConferenceLeft", () => {
        console.log("[v1] User left the video conference")
        setIsInCall(false)
        if (onCallEnd) onCallEnd()
      })

      jitsiApi.addEventListener("readyToClose", () => {
        console.log("[v1] Jitsi is ready to close")
        setIsInCall(false)
        if (onCallEnd) onCallEnd()
      })

      setApi(jitsiApi)
    } catch (error) {
      console.error("[v1] Error initializing Jitsi:", error)
    }
  }

  const toggleVideo = () => {
    if (api) {
      api.executeCommand("toggleVideo")
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const toggleAudio = () => {
    if (api) {
      api.executeCommand("toggleAudio")
      setIsAudioEnabled(!isAudioEnabled)
    }
  }

  const endCall = () => {
    if (api) {
      api.executeCommand("hangup")
    }
  }

  if (!isActive) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>Video Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
            Video calling will be available when the session becomes active
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!isJitsiLoaded) {
    return (
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5" />
            <span>Video Call</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">Loading video call...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-green-600" />
            <span>Video Call with {otherUserName}</span>
          </CardTitle>
          {isInCall && (
            <div className="flex items-center space-x-2">
              <Button size="sm" variant={isVideoEnabled ? "default" : "destructive"} onClick={toggleVideo}>
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant={isAudioEnabled ? "default" : "destructive"} onClick={toggleAudio}>
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="destructive" onClick={endCall}>
                <PhoneOff className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={jitsiContainerRef}
          className="w-full rounded-lg overflow-hidden bg-gray-900"
          style={{ minHeight: "400px" }}
        />

        {/* Fallback overlay if stuck */}
        {!isInCall && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 rounded-lg space-y-4">
            <Video className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-white text-lg">Connecting to video call...</p>

            {/* 🔗 Invite link fallback */}
            <a
              href={inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Join via Invite Link
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
