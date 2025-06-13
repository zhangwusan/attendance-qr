"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Type } from "lucide-react"

interface QRScannerProps {
  onScan: (qrCode: string) => void
  isLoading?: boolean
}

export function QRScanner({ onScan, isLoading = false }: QRScannerProps) {
  const [manualCode, setManualCode] = useState("")
  const [useCamera, setUseCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
      setUseCamera(true)
    } catch (error) {
      console.error("Camera access denied:", error)
      alert("Camera access is required to scan QR codes. Please use manual entry.")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setUseCamera(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Scan Attendance QR Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!useCamera ? (
          <>
            <Button onClick={startCamera} className="w-full" variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Use Camera
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <Label htmlFor="qr-code">QR Code</Label>
                <Input
                  id="qr-code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR code manually"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={!manualCode.trim() || isLoading}>
                <Type className="mr-2 h-4 w-4" />
                {isLoading ? "Recording..." : "Submit"}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-3">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg border" />
            <Button onClick={stopCamera} variant="outline" className="w-full">
              Stop Camera
            </Button>
            <p className="text-sm text-muted-foreground text-center">Position the QR code within the camera view</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
