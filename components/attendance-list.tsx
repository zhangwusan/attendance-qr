"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AttendanceList() {
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<string>("")
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      loadSessions()
    }
  }, [selectedCourse])

  useEffect(() => {
    if (selectedSession) {
      loadAttendance()
    }
  }, [selectedSession])

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Failed to load courses")
    }
  }

  const loadSessions = async () => {
    // For demo purposes, we'll create mock sessions
    // In a real app, you'd have an API endpoint for this
    setSessions([
      {
        id: 1,
        session_date: "2024-01-15",
        session_time: "09:00:00",
        created_at: "2024-01-15T09:00:00Z",
      },
      {
        id: 2,
        session_date: "2024-01-17",
        session_time: "09:00:00",
        created_at: "2024-01-17T09:00:00Z",
      },
    ])
  }

  const loadAttendance = async () => {
    if (!selectedSession) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/sessions/${selectedSession}/attendance`)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Failed to load attendance")
    } finally {
      setIsLoading(false)
    }
  }

  const exportAttendance = () => {
    if (attendance.length === 0) return

    const csvContent = [
      ["Name", "Student ID", "Email", "Scanned At", "Location"],
      ...attendance.map((record) => [
        record.name,
        record.student_id,
        record.email,
        new Date(record.scanned_at).toLocaleString(),
        record.latitude && record.longitude ? `${record.latitude}, ${record.longitude}` : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance_${selectedSession}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Attendance Records
          </CardTitle>
          <CardDescription>View and export attendance records for your courses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Select Session</label>
              <Select value={selectedSession} onValueChange={setSelectedSession} disabled={!selectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      {new Date(session.session_date).toLocaleDateString()} - {session.session_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedSession && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  <Calendar className="h-3 w-3 mr-1" />
                  {attendance.length} students present
                </Badge>
              </div>
              <Button onClick={exportAttendance} disabled={attendance.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSession && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading attendance...</p>
              </div>
            ) : attendance.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Scanned At</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>{record.student_id}</TableCell>
                        <TableCell>{record.email}</TableCell>
                        <TableCell>{new Date(record.scanned_at).toLocaleString()}</TableCell>
                        <TableCell>
                          {record.latitude && record.longitude ? (
                            <span className="text-xs">
                              {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No attendance records found for this session</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
