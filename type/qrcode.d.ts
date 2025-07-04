<<<<<<< HEAD
declare module "qrcode" {
  export interface QRCodeOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
    type?: "image/png" | "image/jpeg" | "image/webp"
    quality?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
    width?: number
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>

  export function toString(
    text: string,
    options?: QRCodeOptions & { type?: "terminal" | "utf8" | "svg" },
  ): Promise<string>

  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>

  export function toFile(path: string, text: string, options?: QRCodeOptions): Promise<void>
}
=======
declare module "qrcode" {
  export interface QRCodeOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
    type?: "image/png" | "image/jpeg" | "image/webp"
    quality?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
    width?: number
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>

  export function toString(
    text: string,
    options?: QRCodeOptions & { type?: "terminal" | "utf8" | "svg" },
  ): Promise<string>

  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>

  export function toFile(path: string, text: string, options?: QRCodeOptions): Promise<void>
}
>>>>>>> e27b8ad (fixed code)
