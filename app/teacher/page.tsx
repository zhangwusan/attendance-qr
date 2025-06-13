"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { AttendanceList } from "@/components/attendance-list"
import { Badge } from "@/components/ui/badge"
import { LogOut, QrCode, Clock, MapPin } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface Course {
  id: number
  name: string
  code: string
  room: string
}

interface Session {
  id: number
  qr_code: string
  qr_expires_at: string
  course?: Course
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "teacher") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    fetchCourses(parsedUser.id)
  }, [router])

  const fetchCourses = async (teacherId: number) => {
    try {
      const response = await fetch(`/api/courses?teacherId=${teacherId}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  const generateQRCode = async () => {
    if (!selectedCourse || !user) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: Number.parseInt(selectedCourse),
          teacherId: user.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const course = courses.find((c) => c.id === Number.parseInt(selectedCourse))
        setCurrentSession({
          ...data.session,
          course,
        })
      }
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getTimeRemaining = () => {
    if (!currentSession) return ""

    const now = new Date()
    const expires = new Date(currentSession.qr_expires_at)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Teacher Dashboard</CardTitle>
              <CardDescription>Welcome back, {user.name}</CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* QR Code Generation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Generate QR Code
              </CardTitle>
              <CardDescription>Select a class and generate a QR code for attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{course.name}</span>
                          <Badge variant="outline">{course.code}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourse && (
                <div className="p-3 bg-muted rounded-lg">
                  {(() => {
                    const course = courses.find((c) => c.id === Number.parseInt(selectedCourse))
                    return course ? (
                      <div className="space-y-1">
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {course.room}
                        </p>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <Button onClick={generateQRCode} disabled={!selectedCourse || isLoading} className="w-full">
                {isLoading ? "Generating..." : "Generate QR Code"}
              </Button>

              {currentSession && (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Session Active</span>
                  </div>
                  <Badge variant="outline" className="text-green-700">
                    {getTimeRemaining()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Display */}
          {currentSession && (
            <div className="space-y-4">
              <QRCodeDisplay
                value={currentSession.qr_code}
                title={`${currentSession.course?.name} - ${currentSession.course?.room}`}
              />
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">QR Code: {currentSession.qr_code}</p>
                    <p className="text-xs text-muted-foreground">Expires in: {getTimeRemaining()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Attendance List */}
        {currentSession && <AttendanceList sessionId={currentSession.id} />}
      </div>
    </div>
  )
}
