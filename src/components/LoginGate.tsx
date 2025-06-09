// components/LoginGate.tsx
'use client'

import React, { useEffect, useState } from 'react'

interface LoginGateProps {
    onSuccess: () => void
}

const prompts = [
    "What is Hanny's WiFi Password?",
    "What is Hanny's personal hotspot Password?",
    "What is Hanny's access token for Github?",
    "What brand is Hanny's favorite powerbank?",
]

export default function LoginGate({ onSuccess }: LoginGateProps) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [lockedUntil, setLockedUntil] = useState<number | null>(null)
    const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])

    // Check existing cookie on mount
    useEffect(() => {
        const matches = document.cookie.match(/(^|;)\s*cmsAuth=([^;]+)/)
        if (matches && matches[2] === 'true') {
            onSuccess()
        }
    }, [onSuccess])

    // Countdown lock
    useEffect(() => {
        if (!lockedUntil) return
        const id = setInterval(() => {
            if (Date.now() > lockedUntil) {
                setLockedUntil(null)
                setAttempts(0)
                setError('')
            }
        }, 1000)
        return () => clearInterval(id)
    }, [lockedUntil])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (lockedUntil && Date.now() < lockedUntil) return

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        })
        if (res.ok) {
            onSuccess()
        } else {
            const newAttempts = attempts + 1
            setAttempts(newAttempts)
            if (newAttempts >= 3) {
                setLockedUntil(Date.now() + 60_000)
                setError('Too many attempts. Try again in 60s.')
            } else {
                setError('Nah, you are not correct.')
            }
        }
        setPassword('')
    }

    const secondsLeft = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0

    return (
        <div className='h-full w-full'>
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-lg shadow-lg w-80"
                >
                    <h2 className="text-xl font-semibold mb-4">Admin Login</h2>
                    <p className="mb-2">{prompt}</p>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-blue-300"
                        disabled={!!lockedUntil}
                    />
                    {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                    {lockedUntil && (
                        <p className="text-gray-500 text-sm mb-2">
                            Try again in {secondsLeft}s
                        </p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={!!lockedUntil}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    )
}
