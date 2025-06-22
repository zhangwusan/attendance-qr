"use client"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, AlertCircle } from "lucide-react"

interface QRScannerProps {
  onScan: (qrCode: string, location?: { latitude: number; longitude: number; accuracy: number }) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string>("")
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
        startScanning()
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions and try again.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    setIsScanning(false)
  }

  const startScanning = () => {
    const scanInterval = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext("2d")

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const qrCode = detectQRCode(imageData)

          if (qrCode) {
            clearInterval(scanInterval)
            stopCamera()
            getLocationAndScan(qrCode)
          }
        }
      }
    }, 500)

    return () => clearInterval(scanInterval)
  }

  const detectQRCode = (imageData: ImageData): string | null => {
    // Simple QR code detection - in a real app, you'd use a proper QR code library
    // For demo purposes, we'll simulate detection
    return null
  }

  const getLocationAndScan = (qrCode: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onScan(qrCode, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          })
        },
        () => {
          onScan(qrCode)
        },
      )
    } else {
      onScan(qrCode)
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full h-64 object-cover rounded-lg" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
          <Camera className="h-8 w-8 text-white" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-black bg-opacity-50 text-white text-sm p-2 rounded text-center">
          Point your camera at the QR code
        </div>
      </div>
    </div>
  )
}
