import crypto from "crypto"

export function generateQRCode(sessionId: number, teacherId: number): string {
  const timestamp = Date.now()
  const data = `${sessionId}-${teacherId}-${timestamp}`
  const hash = crypto.createHash("sha256").update(data).digest("hex")
  return `QR_${hash.substring(0, 16)}_${timestamp}`
}

export function validateQRCode(qrCode: string): boolean {
  // Basic validation - check format
  return qrCode.startsWith("QR_") && qrCode.length > 20
}

export function isQRExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt)
}
