"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, BookOpen, Clock, MapPin, Calendar } from "lucide-react"
import { toast } from "sonner"
import { TIME_SLOTS, DAYS_OF_WEEK, QR_DURATIONS } from "@/lib/db"

interface CourseManagerProps {
  courses: any[]
  onCoursesUpdate: (courses: any[]) => void
}

export function CourseManager({ courses, onCoursesUpdate }: CourseManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    room: "",
    timeSlot: "",
    daysOfWeek: [] as string[],
    defaultQrDuration: 10,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      room: "",
      timeSlot: "",
      daysOfWeek: [],
      defaultQrDuration: 10,
    })
    setEditingCourse(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.daysOfWeek.length === 0) {
      toast.error("Please select at least one day of the week")
      return
    }

    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : "/api/courses"
      const method = editingCourse ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(editingCourse ? "Course updated successfully!" : "Course created successfully!")

        // Reload courses
        const coursesResponse = await fetch("/api/courses")
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json()
          onCoursesUpdate(coursesData.courses)
        }

        setShowCreateDialog(false)
        resetForm()
      } else {
        const error = await response.json()
        toast.error(error.error || "Operation failed")
      }
    } catch (error) {
      toast.error("Operation failed")
    }
  }

  const handleEdit = (course: any) => {
    setEditingCourse(course)
    setFormData({
      name: course.name,
      code: course.code,
      room: course.room,
      timeSlot: course.time_slot,
      daysOfWeek: course.days_of_week.split(","),
      defaultQrDuration: course.default_qr_duration,
    })
    setShowCreateDialog(true)
  }

  const handleDelete = async (courseId: number) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Course deleted successfully!")

        // Reload courses
        const coursesResponse = await fetch("/api/courses")
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json()
          onCoursesUpdate(coursesData.courses)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || "Delete failed")
      }
    } catch (error) {
      toast.error("Delete failed")
    }
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day) ? prev.daysOfWeek.filter((d) => d !== day) : [...prev.daysOfWeek, day],
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Management
              </CardTitle>
              <CardDescription>Create and manage your courses</CardDescription>
            </div>
            <Dialog
              open={showCreateDialog}
              onOpenChange={(open) => {
                setShowCreateDialog(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
                  <DialogDescription>
                    {editingCourse ? "Update course information" : "Add a new course to your schedule"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Course Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Software Engineering"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="code">Course Code</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="e.g., CS301"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="room">Room</Label>
                      <Input
                        id="room"
                        value={formData.room}
                        onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                        placeholder="e.g., Room 203"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeSlot">Time Slot</Label>
                      <Select
                        value={formData.timeSlot}
                        onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Days of Week</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={day}
                            checked={formData.daysOfWeek.includes(day)}
                            onCheckedChange={() => handleDayToggle(day)}
                          />
                          <Label htmlFor={day} className="text-sm">
                            {day.substring(0, 3)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="defaultQrDuration">Default QR Duration</Label>
                    <Select
                      value={formData.defaultQrDuration.toString()}
                      onValueChange={(value) => setFormData({ ...formData, defaultQrDuration: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {QR_DURATIONS.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value.toString()}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingCourse ? "Update Course" : "Create Course"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="grid gap-4">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{course.name}</h3>
                          <Badge variant="secondary">{course.code}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {course.room}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {course.time_slot}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {course.days_of_week}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Default QR Duration: {course.default_qr_duration} minutes
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(course.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses created yet</p>
              <p className="text-sm">Click "Add Course" to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
