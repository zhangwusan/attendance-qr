"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Users, StopCircle, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface QRCodeDisplayProps {
  session: any
  onSessionUpdate: (session: any) => void
}

export function QRCodeDisplay({ session, onSessionUpdate }: QRCodeDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [attendanceCount, setAttendanceCount] = useState<number>(0)

  useEffect(() => {
    if (session) {
      updateTimeLeft()
      loadAttendance()
      const interval = setInterval(() => {
        updateTimeLeft()
        loadAttendance()
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [session])

  const updateTimeLeft = () => {
    if (session?.expires_at) {
      const now = new Date().getTime()
      const expiry = new Date(session.expires_at).getTime()
      const diff = Math.max(0, expiry - now)
      setTimeLeft(Math.floor(diff / 1000))
    }
  }

  const loadAttendance = async () => {
    if (session?.id) {
      try {
        const response = await fetch(`/api/sessions/${session.id}/attendance`)
        if (response.ok) {
          const data = await response.json()
          setAttendanceCount(data.attendance.length)
        }
      } catch (error) {
        // Silent error - don't show toast for this
      }
    }
  }

  const handleSessionAction = async (action: string) => {
    try {
      const response = await fetch(`/api/sessions/${session.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)

        if (action === "expire") {
          onSessionUpdate(null)
        } else if (action === "reactivate") {
          // Reload the session data
          const sessionResponse = await fetch("/api/sessions/active")
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            onSessionUpdate(sessionData.session)
          }
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Action failed")
      }
    } catch (error) {
      toast.error("Action failed")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!session) return null

  const isExpired = timeLeft <= 0

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Active QR Session</CardTitle>
            <CardDescription>{session.course_name}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isExpired ? "destructive" : "default"}>{isExpired ? "Expired" : "Active"}</Badge>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {attendanceCount}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
              {session.qr_image ? (
                <img src={session.qr_image || "/placeholder.svg"} alt="QR Code" className="w-48 h-48 mx-auto" />
              ) : (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500">QR Code</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">Students scan this code to mark attendance</p>
          </div>

          {/* Session Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Time Left</p>
                  <p className={`text-lg font-mono ${isExpired ? "text-red-600" : "text-green-600"}`}>
                    {isExpired ? "EXPIRED" : formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">Room</p>
                  <p className="text-lg">{session.room}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-1">Session Details</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Course: {session.course_name}</p>
                <p>Time Slot: {session.time_slot}</p>
                <p>Duration: {session.qr_duration} minutes</p>
                <p>Attendance: {attendanceCount} students</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleSessionAction("expire")}
                disabled={isExpired}
              >
                <StopCircle className="h-4 w-4 mr-2" />
                End Session
              </Button>
              {isExpired && (
                <Button variant="outline" size="sm" onClick={() => handleSessionAction("reactivate")}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reactivate
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Text */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs font-mono text-center break-all">{session.qr_code}</p>
        </div>
      </CardContent>
    </Card>
  )
}
