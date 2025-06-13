"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QRScanner } from "@/components/qr-scanner"
import { Badge } from "@/components/ui/badge"
import { LogOut, CheckCircle, XCircle, Clock } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
  student_id: string
}

interface ScanResult {
  success: boolean
  message: string
  scannedAt?: string
  error?: string
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "student") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  const handleScan = async (qrCode: string) => {
    if (!user) return

    setIsScanning(true)
    setScanResult(null)

    try {
      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          studentId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setScanResult({
          success: true,
          message: data.message,
          scannedAt: data.scannedAt,
        })
      } else {
        setScanResult({
          success: false,
          message: data.error || "Failed to record attendance",
          error: data.error,
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: "Network error. Please try again.",
        error: "Network error",
      })
    } finally {
      setIsScanning(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const resetScan = () => {
    setScanResult(null)
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student Portal</CardTitle>
              <CardDescription>
                Welcome, {user.name} (ID: {user.student_id})
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardHeader>
        </Card>

        {/* Scan Result */}
        {scanResult && (
          <Card className={scanResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {scanResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${scanResult.success ? "text-green-800" : "text-red-800"}`}>
                    {scanResult.success ? "Attendance Recorded!" : "Scan Failed"}
                  </p>
                  <p className={`text-sm ${scanResult.success ? "text-green-700" : "text-red-700"}`}>
                    {scanResult.message}
                  </p>
                  {scanResult.scannedAt && (
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-xs text-green-600">{new Date(scanResult.scannedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetScan} className="mt-3">
                Scan Another QR Code
              </Button>
            </CardContent>
          </Card>
        )}

        {/* QR Scanner */}
        {!scanResult && <QRScanner onScan={handleScan} isLoading={isScanning} />}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                1
              </Badge>
              <p className="text-sm">Wait for your teacher to display the QR code in class</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                2
              </Badge>
              <p className="text-sm">Use the camera to scan the QR code or enter it manually</p>
            </div>
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                3
              </Badge>
              <p className="text-sm">Your attendance will be recorded automatically</p>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> QR codes expire 10 minutes after generation. Make sure to scan within the time
                limit.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
