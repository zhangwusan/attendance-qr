"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function ImportPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

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

  const handleImport = async (endpoint: string, file: File) => {
    setIsLoading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data)
        toast.success(data.message)
      } else {
        toast.error(data.error || "Import failed")
      }
    } catch (error) {
      toast.error("Import failed")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = (type: string) => {
    let csvContent = ""

    if (type === "teachers") {
      csvContent = "email,name,password,employee_id,department,phone\n"
      csvContent += "teacher1@example.com,John Doe,password123,EMP001,Computer Science,123-456-7890\n"
      csvContent += "teacher2@example.com,Jane Smith,password123,EMP002,Mathematics,123-456-7891"
    } else if (type === "students") {
      csvContent = "email,name,password,student_id,program,year_level,phone\n"
      csvContent += "student1@example.com,Alice Johnson,password123,STU001,Computer Science,2,123-456-7892\n"
      csvContent += "student2@example.com,Bob Wilson,password123,STU002,Engineering,3,123-456-7893"
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${type}_template.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Import Data</h1>
          <p className="text-gray-600">Bulk import teachers and students via CSV files</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="teachers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teachers">Import Teachers</TabsTrigger>
              <TabsTrigger value="students">Import Students</TabsTrigger>
            </TabsList>

            <TabsContent value="teachers">
              <Card>
                <CardHeader>
                  <CardTitle>Import Teachers</CardTitle>
                  <CardDescription>Upload a CSV file containing teacher information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => downloadTemplate("teachers")}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <span className="text-sm text-gray-600">Download the CSV template to see the required format</span>
                  </div>

                  <div>
                    <Label htmlFor="teachers-file">CSV File</Label>
                    <Input
                      id="teachers-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImport("/api/admin/import/teachers", file)
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Required columns:</strong> email, name
                      <br />
                      <strong>Optional columns:</strong> password (default: teacher123), employee_id, department, phone
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <CardTitle>Import Students</CardTitle>
                  <CardDescription>Upload a CSV file containing student information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => downloadTemplate("students")}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                    <span className="text-sm text-gray-600">Download the CSV template to see the required format</span>
                  </div>

                  <div>
                    <Label htmlFor="students-file">CSV File</Label>
                    <Input
                      id="students-file"
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImport("/api/admin/import/students", file)
                        }
                      }}
                      disabled={isLoading}
                    />
                  </div>

                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Required columns:</strong> email, name, student_id
                      <br />
                      <strong>Optional columns:</strong> password (default: student123), program, year_level, phone
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isLoading && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Processing import...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Import Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
                      <div className="text-sm text-green-800">Successful</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{results.errorCount}</div>
                      <div className="text-sm text-red-800">Errors</div>
                    </div>
                  </div>

                  {results.errors && results.errors.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Errors:</h4>
                      <div className="bg-red-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                        {results.errors.map((error: string, index: number) => (
                          <div key={index} className="text-sm text-red-800 mb-1">
                            {error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
