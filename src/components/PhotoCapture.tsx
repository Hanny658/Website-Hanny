// components/PhotoCapture.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'

interface PhotoCaptureProps {
    size: number            // square size in pixels
    onCapture: (file: File) => void
    onCancel: () => void
}

export default function PhotoCapture({ size, onCapture, onCancel }: PhotoCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)

    // Start webcam on mount
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
            setStream(s)
            if (videoRef.current) {
                videoRef.current.srcObject = s
            }
        })
        return () => {
            stream?.getTracks().forEach((t) => t.stop())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!
        canvas.width = size
        canvas.height = size

        const vw = video.videoWidth
        const vh = video.videoHeight
        const side = Math.min(vw, vh)

        // Center crop: calculate offset
        const sx = (vw - side) / 2
        const sy = (vh - side) / 2

        // Draw the centered square region from video onto square canvas
        ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size)

        // Convert to blob → File and pass to callback
        canvas.toBlob((blob) => {
            if (!blob) return
            const file = new File([blob], 'capture.png', { type: 'image/png' })
            onCapture(file)
        }, 'image/png')
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="object-cover"
                    style={{ width: size, height: size, borderRadius: 8 }}
                />
                {/* hidden canvas for cropping */}
                <canvas ref={canvasRef} className="hidden" />
                <div className="mt-4 flex space-x-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                    >
                        <i className="bi bi-x-lg"></i><br/>Cancel
                    </button>
                    <button
                        onClick={handleCapture}
                        className="flex-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <i className="bi bi-hand-thumbs-up"></i><br/>Look Good
                    </button>
                </div>
            </div>
        </div>
    )
}
