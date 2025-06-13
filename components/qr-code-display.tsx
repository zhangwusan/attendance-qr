"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QRCodeDisplayProps {
  value: string
  title?: string
  size?: number
}

export function QRCodeDisplay({ value, title = "Scan QR Code", size = 256 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [value, size])

  return (
    <Card className="w-fit mx-auto">
      <CardHeader className="text-center">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <canvas ref={canvasRef} className="border rounded-lg" />
      </CardContent>
    </Card>
  )
}
