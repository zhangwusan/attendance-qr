"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { AttendanceList } from "@/components/attendance-list"
import { CourseManager } from "@/components/course-manager"
import { Settings, LogOut, Users, BookOpen, QrCode, BarChart3 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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
  description?: string
  created_at: string
}

interface Session {
  id: number
  course_id: number
  course_name: string
  qr_code: string
  expires_at: string
  created_at: string
  qr_image?: string
  room?: string
  time_slot?: string
  qr_duration?: number
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [activeSessions, setActiveSessions] = useState<Session[]>([])
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadCourses()
    loadActiveSessions()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "teacher") {
          router.push("/login")
        } else {
          setUser(data.user)
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      toast.error("Failed to load courses")
    }
  }

  const loadActiveSessions = async () => {
    try {
      const response = await fetch("/api/sessions/active")
      if (response.ok) {
        const data = await response.json()
        setActiveSessions(data.sessions)
        // Set the first active session as current session for QR display
        if (data.sessions.length > 0) {
          setCurrentSession(data.sessions[0])
        } else {
          setCurrentSession(null)
        }
      }
    } catch (error) {
      toast.error("Failed to load active sessions")
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  const handleSessionUpdate = (session: Session | null) => {
    setCurrentSession(session)
    loadActiveSessions() // Refresh the sessions list
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSessions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students Today</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Course Management */}
            <Card>
              <CardHeader>
                <CardTitle>Course Management</CardTitle>
                <CardDescription>Create and manage your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <CourseManager courses={courses} onCoursesUpdate={setCourses} />
              </CardContent>
            </Card>

            {/* QR Code Generation */}
            <Card>
              <CardHeader>
                <CardTitle>QR Code Session</CardTitle>
                <CardDescription>Active QR code for attendance</CardDescription>
              </CardHeader>
              <CardContent>
                {currentSession ? (
                  <QRCodeDisplay session={currentSession} onSessionUpdate={handleSessionUpdate} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No active QR session</p>
                    <p className="text-sm text-gray-400">Create a new session to generate QR codes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Currently running attendance sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No active sessions</p>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                          currentSession?.id === session.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setCurrentSession(session)}
                      >
                        <div>
                          <p className="font-medium">{session.course_name}</p>
                          <p className="text-sm text-gray-500">
                            Expires: {new Date(session.expires_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={currentSession?.id === session.id ? "default" : "secondary"}>
                          {currentSession?.id === session.id ? "Selected" : "Active"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>Latest attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <AttendanceList />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
