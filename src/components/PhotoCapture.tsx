"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PhotoCaptureProps {
    size: number;            // square size in pixels
    onCapture: (file: File) => void;
    onCancel: () => void;
}

export default function PhotoCapture({ size, onCapture, onCancel }: PhotoCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Helper to start stream for given constraints
    const startStream = async (deviceId?: string) => {
        if (stream) {
            stream.getTracks().forEach((t) => t.stop());
        }
        try {
            const constraints: MediaStreamConstraints = deviceId
                ? { video: { deviceId: { exact: deviceId } } }
                : { video: { facingMode: { ideal: 'environment' } } };
            const s = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(s);
            if (videoRef.current) videoRef.current.srcObject = s;
        } catch (err) {
            console.error('Error accessing camera', err);
        }
    };

    // Enumerate video input devices on mount
    useEffect(() => {
        const loadDevices = async () => {
            const all = await navigator.mediaDevices.enumerateDevices();
            const cams = all.filter((d) => d.kind === 'videoinput');
            setDevices(cams);
            // Default to environment camera if labeled
            // Otherwise first
            const env = cams.find((d) => /back|rear|environment/i.test(d.label));
            const defaultIndex = env ? cams.indexOf(env) : 0;
            setCurrentIndex(defaultIndex);
            startStream(env?.deviceId);
        };
        loadDevices();

        return () => {
            stream?.getTracks().forEach((t) => t.stop());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Function to switch camera
    const switchCamera = () => {
        if (devices.length < 2) return;
        const next = (currentIndex + 1) % devices.length;
        setCurrentIndex(next);
        startStream(devices[next].deviceId);
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        canvas.width = size;
        canvas.height = size;

        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const side = Math.min(vw, vh);
        const sx = (vw - side) / 2;
        const sy = (vh - side) / 2;

        ctx.drawImage(video, sx, sy, side, side, 0, 0, size, size);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], 'capture.png', { type: 'image/png' });
            onCapture(file);
        }, 'image/png');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg flex flex-col items-center">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="object-cover rounded-lg"
                    style={{ width: size, height: size }}
                />
                <canvas ref={canvasRef} className="hidden" />

                <div className="mt-4 flex space-x-4 w-full">
                    <button
                        onClick={switchCamera}
                        className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                    >
                        <i className="bi bi-repeat text-3xl"></i>
                    </button>
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    >
                        <i className="bi bi-x-lg text-3xl"></i>
                    </button>
                    <button
                        onClick={handleCapture}
                        className="flex-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <i className="bi bi-record-circle text-3xl"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}
