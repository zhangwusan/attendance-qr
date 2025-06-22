"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, QrCode, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { QRScanner } from "@/components/qr-scanner"

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null)
  const [manualCode, setManualCode] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== "student") {
          router.push("/login")
          return
        }
        setUser(data.user)
      } else {
        router.push("/login")
      }
    } catch (error) {
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const scanQRCode = async (qrCode: string, location?: { latitude: number; longitude: number; accuracy: number }) => {
    try {
      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          latitude: location?.latitude,
          longitude: location?.longitude,
          accuracy: location?.accuracy,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setManualCode("")
      } else {
        toast.error(data.error || "Failed to record attendance")
      }
    } catch (error) {
      toast.error("Failed to record attendance")
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      scanQRCode(manualCode.trim())
    }
  }

  if (isLoading) {
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{user?.student_id}</Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Student ID</p>
                  <p className="text-gray-600">{user?.student_id}</p>
                </div>
                <div>
                  <p className="font-medium">Program</p>
                  <p className="text-gray-600">{user?.program || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium">Year Level</p>
                  <p className="text-gray-600">{user?.year_level || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scan QR Code
              </CardTitle>
              <CardDescription>Scan the QR code displayed by your teacher to mark your attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button onClick={() => setIsScanning(!isScanning)} size="lg" className="w-full">
                  {isScanning ? "Stop Camera" : "Start Camera Scanner"}
                </Button>
              </div>

              {isScanning && (
                <div className="border rounded-lg overflow-hidden">
                  <QRScanner onScan={scanQRCode} />
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or enter manually</span>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="qrCode">QR Code</Label>
                  <Input
                    id="qrCode"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter QR code manually"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!manualCode.trim()}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Attendance
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How to Mark Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Wait for your teacher to generate a QR code for the class</li>
                <li>Click "Start Camera Scanner" to activate your device camera</li>
                <li>Point your camera at the QR code displayed by your teacher</li>
                <li>Your attendance will be automatically recorded when the code is scanned</li>
                <li>Alternatively, you can manually enter the QR code if provided</li>
              </ol>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> QR codes expire after a set time period. Make sure to scan within the time
                  limit set by your teacher.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
