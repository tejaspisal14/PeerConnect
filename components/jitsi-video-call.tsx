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

  // Load Jitsi Meet API script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.JitsiMeetExternalAPI) {
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = () => {
        console.log("[v0] Jitsi Meet API loaded")
        setIsJitsiLoaded(true)
      }
      script.onerror = () => {
        console.error("[v0] Failed to load Jitsi Meet API")
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

    const roomName = `peerconnect-session-${sessionId}`
    const domain = "meet.jit.si"

    const options = {
      roomName,
      width: "100%",
      height: 400,
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: currentUserName,
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableModeratorIndicator: true,
        startScreenSharing: false,
        enableEmailInStats: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          "microphone",
          "camera",
          "closedcaptions",
          "desktop",
          "fullscreen",
          "fodeviceselection",
          "hangup",
          "profile",
          "chat",
          "recording",
          "livestreaming",
          "etherpad",
          "sharedvideo",
          "settings",
          "raisehand",
          "videoquality",
          "filmstrip",
          "invite",
          "feedback",
          "stats",
          "shortcuts",
          "tileview",
          "videobackgroundblur",
          "download",
          "help",
          "mute-everyone",
        ],
        SETTINGS_SECTIONS: ["devices", "language", "moderator", "profile", "calendar"],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: "",
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_PAGE_CONTENT: false,
        DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
        APP_NAME: "PeerConnect Session",
        NATIVE_APP_NAME: "PeerConnect",
        DEFAULT_BACKGROUND: "#474747",
        DISABLE_VIDEO_BACKGROUND: false,
        INITIAL_TOOLBAR_TIMEOUT: 20000,
        TOOLBAR_TIMEOUT: 4000,
        TOOLBAR_ALWAYS_VISIBLE: false,
      },
    }

    try {
      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options)

      jitsiApi.addEventListener("ready", () => {
        console.log("[v0] Jitsi Meet is ready")
        setIsInCall(true)
      })

      jitsiApi.addEventListener("participantJoined", (participant: any) => {
        console.log("[v0] Participant joined:", participant.displayName)
      })

      jitsiApi.addEventListener("participantLeft", (participant: any) => {
        console.log("[v0] Participant left:", participant.displayName)
      })

      jitsiApi.addEventListener("videoConferenceJoined", () => {
        console.log("[v0] User joined the video conference")
        setIsInCall(true)
      })

      jitsiApi.addEventListener("videoConferenceLeft", () => {
        console.log("[v0] User left the video conference")
        setIsInCall(false)
        if (onCallEnd) {
          onCallEnd()
        }
      })

      jitsiApi.addEventListener("readyToClose", () => {
        console.log("[v0] Jitsi is ready to close")
        setIsInCall(false)
        if (onCallEnd) {
          onCallEnd()
        }
      })

      setApi(jitsiApi)
    } catch (error) {
      console.error("[v0] Error initializing Jitsi:", error)
    }
  }

  const toggleVideo = () => {
    if (api) {
      if (isVideoEnabled) {
        api.executeCommand("toggleVideo")
      } else {
        api.executeCommand("toggleVideo")
      }
      setIsVideoEnabled(!isVideoEnabled)
    }
  }

  const toggleAudio = () => {
    if (api) {
      if (isAudioEnabled) {
        api.executeCommand("toggleAudio")
      } else {
        api.executeCommand("toggleAudio")
      }
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
    <Card className="border-green-200">
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
        {!isInCall && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
            <div className="text-center text-white">
              <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Connecting to video call...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
