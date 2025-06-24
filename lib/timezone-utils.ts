export function getCurrentLocalTime(timezone = "Asia/Phnom_Penh"): string {
  try {
    const now = new Date()
    return now.toLocaleString("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  } catch (error) {
    // Fallback to local time if timezone is invalid
    return new Date().toLocaleString()
  }
}

export function formatLocalTime(timestamp: string, timezone = "Asia/Phnom_Penh"): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch (error) {
    // Fallback to ISO string if formatting fails
    return new Date(timestamp).toLocaleString()
  }
}

export function getTimezoneOffset(timezone = "Asia/Phnom_Penh"): number {
  try {
    const now = new Date()
    const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
    const local = new Date(utc.toLocaleString("en-US", { timeZone: timezone }))
    return (local.getTime() - utc.getTime()) / (1000 * 60 * 60)
  } catch (error) {
    return 0
  }
}

export function convertToTimezone(timestamp: string, fromTimezone: string, toTimezone: string): string {
  try {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      timeZone: toTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch (error) {
    return timestamp
  }
}
