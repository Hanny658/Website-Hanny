// components/MarkGoneButton.tsx
'use client'

import React, { useState } from 'react'

interface MarkGoneButtonProps {
    cheapieId: number
    onMarkedGone: () => void
    currentStock: string
}

export default function MarkGoneButton({ cheapieId, onMarkedGone, currentStock }: MarkGoneButtonProps) {
    const [loading, setLoading] = useState(false)

    // Only render if stock is not already 'gone'
    if (currentStock === 'gone') {
        return null
    }

    const handleMarkGone = async () => {
        // Double-check
        const ok = confirm('Are you sure the shelf is empty?')
        if (!ok) return

        setLoading(true)
        try {
            const res = await fetch(`/api/cheapie/${cheapieId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: 'gone' }),
            })
            if (!res.ok) throw new Error('Failed to update')
            onMarkedGone()
        } catch (err) {
            console.error(err)
            alert('Error marking gone. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleMarkGone}
            disabled={loading}
            className="absolute right-4 mx-4 my-2 text-red-600/60 hover:text-red-800/60 disabled:opacity-50"
            title="Mark out of stock"
        >
            <i className="bi bi-cart-x-fill text-2xl"></i>
        </button>
    )
}
