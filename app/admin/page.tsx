"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  UserPlus,
  Download,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  UserCheck,
  GraduationCap,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface User {
  id: number
  email: string
  name: string
  role: "teacher" | "student"
  student_id?: string
  employee_id?: string
  department?: string
  program?: string
  year_level?: number
  phone?: string
  created_at: string
  last_login?: string
}

interface ImportProgress {
  total: number
  processed: number
  success: number
  errors: number
  isRunning: boolean
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | "teacher" | "student">("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "student" as "teacher" | "student",
    student_id: "",
    employee_id: "",
    department: "",
    program: "",
    year_level: 1,
    phone: "",
  })

  useEffect(() => {
    checkAuth()
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "teacher") {
          router.push("/login")
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchUsers()
        setIsCreateDialogOpen(false)
        resetForm()
        toast.success("User created successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create user")
      }
    } catch (error) {
      toast.error("Error creating user")
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchUsers()
        setIsEditDialogOpen(false)
        setSelectedUser(null)
        resetForm()
        toast.success("User updated successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to update user")
      }
    } catch (error) {
      toast.error("Error updating user")
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchUsers()
        toast.success("User deleted successfully!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete user")
      }
    } catch (error) {
      toast.error("Error deleting user")
    }
  }

  const handleResetPassword = async (userId: number) => {
    if (!confirm("Reset password to default? User will need to change it on next login.")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Password reset to: ${data.defaultPassword}`)
      } else {
        toast.error("Error resetting password")
      }
    } catch (error) {
      toast.error("Error resetting password")
    }
  }

  const handleBulkImport = async (file: File, userType: "teachers" | "students") => {
    const formData = new FormData()
    formData.append("file", file)

    setImportProgress({
      total: 0,
      processed: 0,
      success: 0,
      errors: 0,
      isRunning: true,
    })

    try {
      const response = await fetch(`/api/admin/import/${userType}`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      setImportProgress({
        total: result.imported + (result.errors?.length || 0),
        processed: result.imported + (result.errors?.length || 0),
        success: result.imported,
        errors: result.errors?.length || 0,
        isRunning: false,
      })

      if (result.success) {
        await fetchUsers()
        toast.success(`Import completed! ${result.imported} users imported successfully.`)
      } else {
        toast.error("Import completed with errors. Check the results.")
      }
    } catch (error) {
      setImportProgress(null)
      toast.error("Import failed")
    }
  }

  const exportUsers = () => {
    const csvContent = [
      [
        "Email",
        "Name",
        "Role",
        "Student ID",
        "Employee ID",
        "Department",
        "Program",
        "Year Level",
        "Phone",
        "Created At",
      ].join(","),
      ...filteredUsers.map((user) =>
        [
          user.email,
          user.name,
          user.role,
          user.student_id || "",
          user.employee_id || "",
          user.department || "",
          user.program || "",
          user.year_level || "",
          user.phone || "",
          new Date(user.created_at).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "student",
      student_id: "",
      employee_id: "",
      department: "",
      program: "",
      year_level: 1,
      phone: "",
    })
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
      student_id: user.student_id || "",
      employee_id: user.employee_id || "",
      department: user.department || "",
      program: user.program || "",
      year_level: user.year_level || 1,
      phone: user.phone || "",
    })
    setIsEditDialogOpen(true)
  }

  const downloadTemplate = (type: "teachers" | "students") => {
    let csvContent = ""
    let filename = ""

    if (type === "teachers") {
      csvContent =
        "email,name,password,employee_id,department,phone\n" +
        "teacher@ams.edu,Dr. Teacher Name,teacher123,EMP001,Computer Science,+855-12-345-001\n" +
        "teacher2@ams.edu,Prof. Another Teacher,,EMP002,Mathematics,+855-12-345-002"
      filename = "teachers_template.csv"
    } else {
      csvContent =
        "email,name,student_id,password,program,year_level,phone\n" +
        "e20211001@ams.edu,STUDENT NAME,e20211001,student123,Computer Science,3,+855-12-111-001\n" +
        "e20211002@ams.edu,ANOTHER STUDENT,e20211002,,Engineering,2,+855-12-111-002"
      filename = "students_template.csv"
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/teacher">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-6 w-6" />
                    Admin Panel - User Management
                  </CardTitle>
                  <CardDescription>Manage teachers and students accounts</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Teachers</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "teacher").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "student").length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Filtered</p>
                  <p className="text-2xl font-bold">{filteredUsers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="import">Bulk Import</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-4">
            {/* Controls */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={roleFilter}
                      onValueChange={(value: "all" | "teacher" | "student") => setRoleFilter(value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="teacher">Teachers</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={exportUsers} variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                          <DialogDescription>Add a new teacher or student account</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="role">Role *</Label>
                              <Select
                                value={formData.role}
                                onValueChange={(value: "teacher" | "student") =>
                                  setFormData({ ...formData, role: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="teacher">Teacher</SelectItem>
                                  <SelectItem value="student">Student</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div className="relative">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="Leave empty for default password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-6 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                          {formData.role === "student" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="student_id">Student ID *</Label>
                                <Input
                                  id="student_id"
                                  value={formData.student_id}
                                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="year_level">Year Level</Label>
                                <Select
                                  value={formData.year_level.toString()}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, year_level: Number.parseInt(value) })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">Year 1</SelectItem>
                                    <SelectItem value="2">Year 2</SelectItem>
                                    <SelectItem value="3">Year 3</SelectItem>
                                    <SelectItem value="4">Year 4</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                          {formData.role === "teacher" && (
                            <div>
                              <Label htmlFor="employee_id">Employee ID</Label>
                              <Input
                                id="employee_id"
                                value={formData.employee_id}
                                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="department">
                                {formData.role === "student" ? "Program" : "Department"}
                              </Label>
                              <Input
                                id="department"
                                value={formData.role === "student" ? formData.program : formData.department}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [formData.role === "student" ? "program" : "department"]: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Create User</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>ID</TableHead>
                        <TableHead>Program/Dept</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "teacher" ? "default" : "secondary"}>{user.role}</Badge>
                          </TableCell>
                          <TableCell>{user.student_id || user.employee_id || "-"}</TableCell>
                          <TableCell>{user.program || user.department || "-"}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user.id)}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teachers Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Import Teachers
                  </CardTitle>
                  <CardDescription>Upload CSV file with teacher accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="teacher-file">Select CSV File</Label>
                    <Input
                      id="teacher-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleBulkImport(file, "teachers")
                      }}
                    />
                  </div>
                  <Button variant="outline" onClick={() => downloadTemplate("teachers")} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Required columns:</strong> email, name
                      <br />
                      <strong>Optional:</strong> password, employee_id, department, phone
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Students Import */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Import Students
                  </CardTitle>
                  <CardDescription>Upload CSV file with student accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="student-file">Select CSV File</Label>
                    <Input
                      id="student-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleBulkImport(file, "students")
                      }}
                    />
                  </div>
                  <Button variant="outline" onClick={() => downloadTemplate("students")} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Required columns:</strong> email, name, student_id
                      <br />
                      <strong>Optional:</strong> password, program, year_level, phone
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* Import Progress */}
            {importProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {importProgress.isRunning ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    ) : importProgress.errors > 0 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    Import Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={(importProgress.processed / importProgress.total) * 100} />
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{importProgress.total}</p>
                      <p className="text-sm text-gray-600">Total</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{importProgress.processed}</p>
                      <p className="text-sm text-gray-600">Processed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">{importProgress.success}</p>
                      <p className="text-sm text-gray-600">Success</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">{importProgress.errors}</p>
                      <p className="text-sm text-gray-600">Errors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "teacher" | "student") => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="relative">
                <Label htmlFor="edit-password">New Password</Label>
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-6 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.role === "student" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-student_id">Student ID *</Label>
                    <Input
                      id="edit-student_id"
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-year_level">Year Level</Label>
                    <Select
                      value={formData.year_level.toString()}
                      onValueChange={(value) => setFormData({ ...formData, year_level: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Year 1</SelectItem>
                        <SelectItem value="2">Year 2</SelectItem>
                        <SelectItem value="3">Year 3</SelectItem>
                        <SelectItem value="4">Year 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {formData.role === "teacher" && (
                <div>
                  <Label htmlFor="edit-employee_id">Employee ID</Label>
                  <Input
                    id="edit-employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-department">{formData.role === "student" ? "Program" : "Department"}</Label>
                  <Input
                    id="edit-department"
                    value={formData.role === "student" ? formData.program : formData.department}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [formData.role === "student" ? "program" : "department"]: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
