"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw } from "lucide-react"

interface AttendanceRecord {
  id: number
  student_id: number
  name: string
  student_id: string
  email: string
  scanned_at: string
}

interface AttendanceListProps {
  sessionId: number
  totalStudents?: number
}

export function AttendanceList({ sessionId, totalStudents = 35 }: AttendanceListProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAttendance = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sessions/${sessionId}/attendance`)
      if (response.ok) {
        const data = await response.json()
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendance()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchAttendance, 5000)
    return () => clearInterval(interval)
  }, [sessionId])

  const downloadCSV = () => {
    const headers = ["Name", "Student ID", "Email", "Scan Time"]
    const csvContent = [
      headers.join(","),
      ...attendance.map((record) =>
        [record.name, record.student_id, record.email, new Date(record.scanned_at).toLocaleString()].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Live Attendance</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {attendance.length}/{totalStudents} students present
            </Badge>
            <Badge variant={attendance.length > totalStudents * 0.8 ? "default" : "destructive"}>
              {Math.round((attendance.length / totalStudents) * 100)}% attendance
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAttendance} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCSV} disabled={attendance.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {attendance.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No students have scanned yet</p>
          ) : (
            attendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{record.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {record.student_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{new Date(record.scanned_at).toLocaleTimeString()}</p>
                  <Badge variant="outline" className="text-xs">
                    Present
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
