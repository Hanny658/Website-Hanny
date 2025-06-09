// components/AddCheapieModal.tsx
'use client'

import React, { useState } from 'react'
import PhotoCapture from './PhotoCapture'

interface AddCheapieModalProps {
    placeId: string
    onClose: () => void
    onCreated: () => void
}

const stockOptions = ['plenty', 'mid', 'low'] as const

function getStockText(level: string): string {
    switch(level){
        case "low":
            return "Low Stock";
        case "mid":
            return "Mid Stock";
        case "plenty":
            return "Plenty Stock";
    }
    return "Unknown";
}

const stockColorMap: Record<string, string> = {
    plenty: 'bg-green-200 text-green-800',
    mid: 'bg-yellow-200 text-yellow-800',
    low: 'bg-orange-200 text-orange-800',
}

type Stock = typeof stockOptions[number]

export default function AddCheapieModal({ placeId, onClose, onCreated }: AddCheapieModalProps) {
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState<number | ''>(1)
    const [price, setPrice] = useState<number | ''>('')
    const [exp, setExp] = useState<string>('')
    const [imageUrl, setImageUrl] = useState('')
    const [stock, setStock] = useState<Stock>('low')
    const [loading, setLoading] = useState(false)
    const [isCameraOpen, setCameraOpen] = useState(false)

    // upload image to /api/upload and capture URL
    const handleImageChange = async (file: File) => {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (res.ok) {
            const data = await res.json()
            setImageUrl(data.url)
        } else {
            const err = await res.json()
            alert('Upload failed: ' + err.error)
        }
    }

    // submit new Cheapie
    const handleSubmit = async () => {
        if (!name || quantity === '' || price === '') {
            alert('Name, quantity and price are required')
            return
        }
        setLoading(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const payload: any = {
                name,
                store: placeId,
                quantity: Number(quantity),
                price: Number(price),
                stock,
            }
            if (exp) payload.exp = new Date(exp)
            if (imageUrl) payload.image = imageUrl

            const res = await fetch('/api/cheapie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('create failed')
            onCreated()
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to add, please try again')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
            {/* className="bg-white w-1/3 p-6 rounded-lg shadow-lg max-h-[80vh] overflow-auto" */}
            <div className="
            w-full max-h-[60vh] p-4 mx-2 bg-white text-black rounded-lg overflow-auto
            sm:rounded-lg sm:w-1/3 sm:max-h-[80vh]
            transition-transform duration-300
            ">
                <h3 className="text-xl font-semibold mb-4">Add New Snack</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Name *</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block mb-1 font-medium">Quantity *</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                value={quantity}
                                min={0}
                                onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                        <div className="flex-2">
                            <label className="block mb-1 font-medium">Price *</label>
                            <input
                                type="number"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                                value={price}
                                min={0}
                                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Expiration Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300"
                            value={exp}
                            onChange={(e) => setExp(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Image</label>
                        <div className="flex items-center space-x-2 bg-amber-100">
                        <input
                            type="file"
                            accept="image/*"
                            className="flex-1"
                            onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageChange(file)
                            }}
                        />
                        <i
                            className="bi bi-camera-fill text-3xl mx-4 cursor-pointer text-gray-700"
                            onClick={() => setCameraOpen(true)}
                        ></i>
                        </div>
                        {imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt="preview"
                            className="mt-2 w-24 h-24 object-cover rounded"
                        />
                        )}
                        {isCameraOpen && (
                        <PhotoCapture
                            size={300}
                            onCancel={() => setCameraOpen(false)}
                            onCapture={(file) => {
                            setCameraOpen(false)
                            handleImageChange(file)
                            }}
                        />
                        )}
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Stock Level</label>
                        <div className="flex space-x-2">
                            {stockOptions.map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    className={`px-3 py-1 border rounded-lg ${stock === opt ? `${stockColorMap[opt]}` : 'bg-gray-100 text-gray-700'}`}
                                    onClick={() => setStock(opt)}
                                >
                                    {getStockText(opt)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        disabled={loading}
                    >
                        {loading ? 'Adding...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    )
}
