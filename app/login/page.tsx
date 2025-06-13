"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GraduationCap, Users } from "lucide-react"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (email: string, password: string, role: "teacher" | "student") => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user.role === role) {
        localStorage.setItem("user", JSON.stringify(data.user))
        router.push(role === "teacher" ? "/teacher" : "/student")
      } else {
        setError("Invalid credentials or wrong role")
      }
    } catch (error) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const LoginForm = ({ role }: { role: "teacher" | "student" }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const onSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleLogin(email, password, role)
    }

    // Demo credentials
    const demoEmail = role === "teacher" ? "teacher1@institute.edu" : "student1@institute.edu"

    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${role}-email`}>Email</Label>
          <Input
            id={`${role}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={demoEmail}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <Input
            id={`${role}-password`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : `Sign in as ${role}`}
        </Button>
        <div className="text-sm text-muted-foreground">
          <p>Demo credentials:</p>
          <p>Email: {demoEmail}</p>
          <p>Password: demo123</p>
        </div>
      </form>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Attendance System</CardTitle>
          <CardDescription>Sign in to access the QR-based attendance system</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teacher" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teacher" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Teacher
              </TabsTrigger>
              <TabsTrigger value="student" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Student
              </TabsTrigger>
            </TabsList>
            <TabsContent value="teacher" className="mt-6">
              <LoginForm role="teacher" />
            </TabsContent>
            <TabsContent value="student" className="mt-6">
              <LoginForm role="student" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
