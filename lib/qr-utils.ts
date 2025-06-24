import QRCode from "qrcode"

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
  } catch (error) {
    console.error("QR Code generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}

export function generateQRCodeData(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `QR_${random}_${timestamp}`
}
