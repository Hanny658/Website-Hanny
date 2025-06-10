// components/PlaceDetailPanel.tsx
'use client'

import React, { useEffect, useState } from 'react'
import MarkGoneButton from './MarkGoneButton'
import { useSession } from "next-auth/react";

interface Cheapie {
    id: number
    name: string
    quantity: number
    price: number
    exp?: string
    image?: string
    stock: 'plenty' | 'mid' | 'low' | 'gone'
    createdAt: string
}

interface PlaceDetailPanelProps {
    placeName: string
    placeId: string
    onClose: () => void
    onAdd: () => void
}

/**
 * Utility: compute “time ago” string from createdAt to now.
 */
function timeAgo(dateString: string): string {
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const diff = now - then

    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds} sec ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr ago`

    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `${months} mo${months > 1 ? 's' : ''} ago`

    const years = Math.floor(months / 12)
    return `${years} yr${years > 1 ? 's' : ''} ago`
}

function getStockText(level: string): string {
    switch(level){
        case "gone":
            return "Gone Already";
        case "low":
            return "Low Stock";
        case "mid":
            return "Mid Stock";
        case "plenty":
            return "Plenty Stock";
    }
    return "Unknown";
}

const stockColorMap: Record<Cheapie['stock'], string> = {
    plenty: 'bg-green-200 text-green-800',
    mid: 'bg-yellow-200 text-yellow-800',
    low: 'bg-orange-200 text-orange-800',
    gone: 'bg-red-200 text-red-800',
}

export default function PlaceDetailPanel({
    placeName,
    placeId,
    onClose,
    onAdd,
}: PlaceDetailPanelProps) {
    const [cheapies, setCheapies] = useState<Cheapie[]>([])
    const { data: session } = useSession();

    // fetch cheapies for this place
    useEffect(() => {
        async function fetchCheapies() {
            try {
                const res = await fetch(`/api/cheapie?store=${encodeURIComponent(placeId)}`)
                const data = (await res.json()) as Cheapie[]
                setCheapies(data)
            } catch (err) {
                console.error('Failed to fetch cheapies:', err)
            }
        }
        fetchCheapies()
    }, [placeId])

    return (
        // className="fixed top-32 right-4 w-1/4 max-h-[70vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col z-30"
        <div  className="
        fixed z-30
        inset-x-0 bottom-0  
        w-full max-h-[60vh] overflow-y-auto
        bg-white rounded-t-lg shadow-xl

        transform translate-y-0
        transition-transform duration-300 ease-out

        sm:inset-auto sm:top-32 sm:right-4 sm:bottom-auto
        sm:translate-x-0 sm:w-1/4 sm:max-h-[60vh] sm:rounded-lg
        ">
            {/* Header with title and close button */}
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center px-4 py-2 border-b">
                <h2 className="text-xl text-black font-semibold">{placeName}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            {/* Cheapie list */}
            <div className="flex-1 overflow-auto px-3 py-2 space-y-3">
                {cheapies.map((c) => (
                    <div key={c.id} className="flex flex-col bg-blue-50 rounded-lg p-2">
                        <div className="flex">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={c.image || '/snack_placeholder.jpg'}
                                alt={c.name}
                                className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <div className="flex-1">
                                <div className="text-lg text-blue-900 font-medium">{c.name}</div>
                                <div className="text-gray-600">
                                    {c.quantity!==1 && `${c.quantity} for`} ${c.price.toFixed(2)}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    exp: {c.exp ? new Date(c.exp).toLocaleDateString() : 'unknown'}
                                </div>
                            </div>
                        </div>
                        {session &&
                            <MarkGoneButton
                                cheapieId={c.id}
                                currentStock={c.stock}
                                onMarkedGone={() => {
                                    // simply re-fetch the list for this place
                                    fetch(`/api/cheapie?store=${placeId}`)
                                    .then((r) => r.json())
                                    .then(setCheapies)
                                }}
                            />
                        }
                        {/* New row: time ago + stock badge */}
                        <div className="mt-2 flex justify-between items-center">
                            <span className="text-gray-500 text-xs">
                                added {timeAgo(c.createdAt)}
                            </span>
                            <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${stockColorMap[c.stock]}`}
                            >
                                {getStockText(c.stock)}
                            </span>
                        </div>
                    </div>
                ))}

                {/* “That's all we know...” prompt */}
                <div className="text-gray-500 text-sm text-center mt-2">
                    That&apos;s all we know for this place. If you saw another good one, chunk
                    it in from the button below!
                </div>
            </div>

            {/* Add button */}
            <div className="px-1 py-2 md:py-1 border-t">
                {session ?
                    <button
                        onClick={onAdd}
                        className="w-full bg-orange-500 text-white py-2 md:py-1 rounded-lg hover:bg-orange-600 transition"
                    >
                        Add +
                    </button>
                :
                    <button
                        className="w-full bg-orange-800 text-white py-2 md:py-1 rounded-lg hover:bg-orange-900 transition"
                    >
                        Please Log in to add~
                    </button>
                }
                <br className='md:hidden' />
            </div>
        </div>
    )
}
