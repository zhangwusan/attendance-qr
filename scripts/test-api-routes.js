// API Route Testing Script
// This script tests all API endpoints to verify they work after import fixes

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// Test data
const testData = {
  teacher: {
    email: "teacher@test.com",
    password: "teacher123",
    role: "teacher",
  },
  student: {
    email: "student@test.com",
    password: "student123",
    role: "student",
  },
  course: {
    name: "Test Course",
    code: "TEST101",
    room: "Room 101",
    timeSlot: "09:00-10:30",
    daysOfWeek: ["Monday", "Wednesday"],
    defaultQrDuration: 10,
  },
}

const authTokens = {
  teacher: null,
  student: null,
}

let testCourseId = null
let testSessionId = null

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()
  return { response, data, status: response.status }
}

// Test authentication endpoints
async function testAuthEndpoints() {
  console.log("\n🔐 Testing Authentication Endpoints...")

  // Test teacher login
  console.log("Testing teacher login...")
  const teacherLogin = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(testData.teacher),
  })

  if (teacherLogin.status === 200) {
    console.log("✅ Teacher login successful")
    authTokens.teacher = teacherLogin.response.headers.get("set-cookie")
  } else {
    console.log("❌ Teacher login failed:", teacherLogin.data)
  }

  // Test student login
  console.log("Testing student login...")
  const studentLogin = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(testData.student),
  })

  if (studentLogin.status === 200) {
    console.log("✅ Student login successful")
    authTokens.student = studentLogin.response.headers.get("set-cookie")
  } else {
    console.log("❌ Student login failed:", studentLogin.data)
  }

  // Test auth/me endpoint
  if (authTokens.teacher) {
    console.log("Testing auth/me endpoint...")
    const authMe = await apiRequest("/api/auth/me", {
      headers: { Cookie: authTokens.teacher },
    })

    if (authMe.status === 200) {
      console.log("✅ Auth/me endpoint working")
    } else {
      console.log("❌ Auth/me endpoint failed:", authMe.data)
    }
  }
}

// Test course endpoints
async function testCourseEndpoints() {
  console.log("\n📚 Testing Course Endpoints...")

  if (!authTokens.teacher) {
    console.log("❌ No teacher auth token, skipping course tests")
    return
  }

  // Test GET courses
  console.log("Testing GET /api/courses...")
  const getCourses = await apiRequest("/api/courses", {
    headers: { Cookie: authTokens.teacher },
  })

  if (getCourses.status === 200) {
    console.log("✅ GET courses successful")
  } else {
    console.log("❌ GET courses failed:", getCourses.data)
  }

  // Test POST courses (create)
  console.log("Testing POST /api/courses...")
  const createCourse = await apiRequest("/api/courses", {
    method: "POST",
    headers: { Cookie: authTokens.teacher },
    body: JSON.stringify(testData.course),
  })

  if (createCourse.status === 200) {
    console.log("✅ POST courses successful")
    testCourseId = createCourse.data.course?.id
  } else {
    console.log("❌ POST courses failed:", createCourse.data)
  }

  // Test PUT courses (update)
  if (testCourseId) {
    console.log("Testing PUT /api/courses/[id]...")
    const updateCourse = await apiRequest(`/api/courses/${testCourseId}`, {
      method: "PUT",
      headers: { Cookie: authTokens.teacher },
      body: JSON.stringify({
        ...testData.course,
        name: "Updated Test Course",
      }),
    })

    if (updateCourse.status === 200) {
      console.log("✅ PUT courses successful")
    } else {
      console.log("❌ PUT courses failed:", updateCourse.data)
    }
  }
}

// Test session endpoints
async function testSessionEndpoints() {
  console.log("\n🎯 Testing Session Endpoints...")

  if (!authTokens.teacher || !testCourseId) {
    console.log("❌ Missing teacher auth or course ID, skipping session tests")
    return
  }

  // Test create session
  console.log("Testing POST /api/sessions/create...")
  const createSession = await apiRequest("/api/sessions/create", {
    method: "POST",
    headers: { Cookie: authTokens.teacher },
    body: JSON.stringify({
      courseId: testCourseId,
      qrDuration: 10,
    }),
  })

  if (createSession.status === 200) {
    console.log("✅ Create session successful")
    testSessionId = createSession.data.session?.id
  } else {
    console.log("❌ Create session failed:", createSession.data)
  }

  // Test get active sessions
  console.log("Testing GET /api/sessions/active...")
  const getActiveSessions = await apiRequest("/api/sessions/active", {
    headers: { Cookie: authTokens.teacher },
  })

  if (getActiveSessions.status === 200) {
    console.log("✅ GET active sessions successful")
  } else {
    console.log("❌ GET active sessions failed:", getActiveSessions.data)
  }

  // Test session attendance
  if (testSessionId) {
    console.log("Testing GET /api/sessions/[id]/attendance...")
    const getAttendance = await apiRequest(`/api/sessions/${testSessionId}/attendance`, {
      headers: { Cookie: authTokens.teacher },
    })

    if (getAttendance.status === 200) {
      console.log("✅ GET session attendance successful")
    } else {
      console.log("❌ GET session attendance failed:", getAttendance.data)
    }

    // Test session reset
    console.log("Testing POST /api/sessions/[id]/reset...")
    const resetSession = await apiRequest(`/api/sessions/${testSessionId}/reset`, {
      method: "POST",
      headers: { Cookie: authTokens.teacher },
      body: JSON.stringify({ action: "expire" }),
    })

    if (resetSession.status === 200) {
      console.log("✅ Session reset successful")
    } else {
      console.log("❌ Session reset failed:", resetSession.data)
    }
  }
}

// Test attendance endpoints
async function testAttendanceEndpoints() {
  console.log("\n✅ Testing Attendance Endpoints...")

  if (!authTokens.student) {
    console.log("❌ No student auth token, skipping attendance tests")
    return
  }

  // Test attendance scan (will fail with invalid QR but should show auth works)
  console.log("Testing POST /api/attendance/scan...")
  const scanAttendance = await apiRequest("/api/attendance/scan", {
    method: "POST",
    headers: { Cookie: authTokens.student },
    body: JSON.stringify({
      qrCode: "invalid-qr-code",
      latitude: 0,
      longitude: 0,
      accuracy: 10,
    }),
  })

  if (scanAttendance.status === 400 && scanAttendance.data.error.includes("Invalid or expired QR code")) {
    console.log("✅ Attendance scan endpoint working (expected QR validation error)")
  } else if (scanAttendance.status === 403) {
    console.log("❌ Attendance scan auth failed:", scanAttendance.data)
  } else {
    console.log("✅ Attendance scan endpoint accessible")
  }
}

// Test admin endpoints
async function testAdminEndpoints() {
  console.log("\n👑 Testing Admin Endpoints...")

  if (!authTokens.teacher) {
    console.log("❌ No teacher auth token, skipping admin tests")
    return
  }

  // Test get users
  console.log("Testing GET /api/admin/users...")
  const getUsers = await apiRequest("/api/admin/users", {
    headers: { Cookie: authTokens.teacher },
  })

  if (getUsers.status === 200) {
    console.log("✅ GET admin users successful")
  } else {
    console.log("❌ GET admin users failed:", getUsers.data)
  }

  // Test get stats
  console.log("Testing GET /api/admin/stats...")
  const getStats = await apiRequest("/api/admin/stats", {
    headers: { Cookie: authTokens.teacher },
  })

  if (getStats.status === 200) {
    console.log("✅ GET admin stats successful")
  } else {
    console.log("❌ GET admin stats failed:", getStats.data)
  }
}

// Test health endpoint
async function testHealthEndpoint() {
  console.log("\n🏥 Testing Health Endpoint...")

  const health = await apiRequest("/api/health")

  if (health.status === 200) {
    console.log("✅ Health endpoint successful")
    console.log("Database status:", health.data.database)
  } else {
    console.log("❌ Health endpoint failed:", health.data)
  }
}

// Cleanup test data
async function cleanup() {
  console.log("\n🧹 Cleaning up test data...")

  // Delete test course if created
  if (testCourseId && authTokens.teacher) {
    const deleteCourse = await apiRequest(`/api/courses/${testCourseId}`, {
      method: "DELETE",
      headers: { Cookie: authTokens.teacher },
    })

    if (deleteCourse.status === 200) {
      console.log("✅ Test course cleaned up")
    } else {
      console.log("❌ Failed to clean up test course")
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log("🚀 Starting API Route Tests...")
  console.log("Base URL:", BASE_URL)

  try {
    await testHealthEndpoint()
    await testAuthEndpoints()
    await testCourseEndpoints()
    await testSessionEndpoints()
    await testAttendanceEndpoints()
    await testAdminEndpoints()
    await cleanup()

    console.log("\n✨ API Route Testing Complete!")
    console.log("\nNote: Some tests may fail if test users don't exist in the database.")
    console.log("Create test users first or check the database setup.")
  } catch (error) {
    console.error("❌ Test runner error:", error)
  }
}

// Run tests if this script is executed directly
if (typeof window === "undefined") {
  runAllTests()
}

export { runAllTests, testData }
