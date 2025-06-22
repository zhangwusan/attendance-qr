import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode, Users, Clock, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <QrCode className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">QR Attendance System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern, efficient attendance tracking using QR codes. Perfect for schools, universities, and organizations.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <QrCode className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>QR Code Scanning</CardTitle>
              <CardDescription>Quick and contactless attendance marking using QR codes</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage teachers and students with role-based access control</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Real-time Tracking</CardTitle>
              <CardDescription>Monitor attendance in real-time with detailed analytics</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Login Options */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Get Started</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Teacher Portal
                </CardTitle>
                <CardDescription>Create courses, generate QR codes, and monitor attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login?role=teacher">
                  <Button className="w-full">Login as Teacher</Button>
                </Link>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">Demo Account:</p>
                  <p>Email: teacher@ams.edu</p>
                  <p>Password: password</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Portal
                </CardTitle>
                <CardDescription>Scan QR codes to mark your attendance quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login?role=student">
                  <Button className="w-full" variant="outline">
                    Login as Student
                  </Button>
                </Link>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="font-medium">Demo Account:</p>
                  <p>Email: student@ams.edu</p>
                  <p>Password: password</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500">
          <p>© 2024 QR Attendance System. Built with Next.js and Neon.</p>
        </div>
      </div>
    </div>
  )
}
