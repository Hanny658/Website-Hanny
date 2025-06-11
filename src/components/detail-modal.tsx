/* eslint-disable @typescript-eslint/no-explicit-any */
// components/detail-modal.tsx
'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { CMSConfig } from 'src/cmsConfig'

type ModelName = keyof typeof CMSConfig
type Entry = Record<string, any>

interface DetailModalProps {
    model: ModelName
    entry: Entry
    onClose: () => void
    onDeleted: () => void
    onUpdated: (updatedEntry: Entry) => void
}

export default function DetailModal({
    model,
    entry,
    onClose,
    onDeleted,
    onUpdated,
}: DetailModalProps) {
    const fields = CMSConfig[model]
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Record<string, any>>({})

    // form initialisation
    useEffect(() => {
        const initial: Record<string, any> = {}
        fields.forEach((field) => {
            initial[field.name] = entry[field.name] ?? ''
        })
        setFormData(initial)
    }, [entry, fields])

    // handles delete
    const handleDelete = async () => {
        const pk = fields[0].name
        const idOrKey = entry[pk]
        if (!confirm('Are you sure to delete this entry?')) return

        const endpoint =
            typeof idOrKey === 'number'
                ? `/api/${model.toLowerCase()}/${idOrKey}`
                : `/api/${model.toLowerCase()}/${encodeURIComponent(idOrKey)}`

        const res = await fetch(endpoint, { method: 'DELETE' })
        if (res.status === 204) {
            onDeleted()
            onClose()
        } else {
            alert('删除失败')
        }
    }

    const handleInputChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    // image uploading
    const handleImageUpload = async (file: File) => {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/upload', {
            method: 'POST',
            body: form,
        })
        if (res.ok) {
            const data = (await res.json()) as { url: string }
            handleInputChange('image', data.url)
        } else {
            const err = await res.json()
            alert('图片上传失败: ' + err.error)
        }
    }

    // submit update
    const handleUpdate = async () => {
        // check nessesary fiels (escape img-url)
        const missing = fields.some(
        f =>
            !f.isReadOnly &&
            !f.isOptional &&
            f.type !== 'image-url' &&
            (formData[f.name] === '' || formData[f.name] == null)
        )
        if (missing) {
            alert('请填写所有必填字段')
            return
        }

        const pk = fields[0].name
        const idOrKey = entry[pk]
        const endpoint =
            typeof idOrKey === 'number'
                ? `/api/${model.toLowerCase()}/${idOrKey}`
                : `/api/${model.toLowerCase()}/${encodeURIComponent(idOrKey)}`

        // Update payload, which ignores key
        const payload: Record<string, any> = {}
        fields.forEach((field) => {
            if (field.name === pk) return
            payload[field.name] = formData[field.name]
        })

        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (res.ok) {
            const updated = (await res.json()) as Entry
            setIsEditing(false)
            onUpdated(updated)
        } else {
            alert('Failed to update...')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white text-black w-11/12 max-w-3xl rounded-lg shadow-lg p-6 relative">
                {/* Closing cross */}
                <button
                    onClick={() => {
                        setIsEditing(false)
                        onClose()
                    }}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ×
                </button>

                {!isEditing ? (
                    <>
                        <h3 className="text-2xl font-semibold mb-4">
                            {model} Detailed Info
                        </h3>
                        <div className="space-y-3 mb-6 max-h-60 overflow-auto">
                            {fields.map((field) => {
                                const key = field.name
                                const val = entry[key]
                                return (
                                    <div key={key} className="flex flex-col">
                                        <span className="font-medium">{field.label ?? key}:</span>
                                        {field.type === 'image-url' && val ? (
                                            <Image
                                                width={200}
                                                height={200}
                                                src={String(val)}
                                                alt="The image is playing hide and seek."
                                                className="mt-1 max-h-48 rounded"
                                            />
                                        ) : (
                                            <span className="ml-2">
                                                {String(val)}{' '}
                                                <span className="text-sm text-gray-500">
                                                    ({field.type})
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Update
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="text-2xl font-semibold mb-4">
                            Update {model}
                        </h3>
                        <div className="space-y-4 max-h-96 overflow-auto mb-6">
                            {fields.map((field) => {
                                const key = field.name
                                // mainkey is read-only
                                if (key === fields[0].name) {
                                    return (
                                        <div key={key} className="mb-2">
                                            <label className="block mb-1 font-medium">
                                                {field.label ?? key} (Read-Only)
                                            </label>
                                            <input
                                                type="text"
                                                readOnly
                                                value={formData[key]}
                                                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                            />
                                        </div>
                                    )
                                }
                                if (field.isReadOnly) { 
                                    // For read-onlys, display a non-editable input field
                                    return (
                                    <div key={field.name} className="mb-4">
                                        <label className="block mb-1 font-medium">
                                        {field.label ?? field.name} (read-only)
                                        </label>
                                        <input
                                        type={field.type === 'datetime' ? 'date' : 'text'}
                                        readOnly
                                        value={formData[field.name] ?? ''}
                                        className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>
                                    )
                                }
                                if (field.type === 'enum' && field.enumOptions) {
                                    // For Enums display input as selections instead of text area
                                    return (
                                    <div key={field.name} className="mb-4">
                                        <label className="block mb-1 font-medium">
                                        {field.label ?? field.name} ({field.type})
                                        </label>
                                        <select
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        value={formData[field.name] ?? field.enumOptions[0]}
                                        onChange={(e) =>
                                            handleInputChange(field.name, e.target.value)
                                        }
                                        >
                                        {field.enumOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                            {opt}
                                            </option>
                                        ))}
                                        </select>
                                    </div>
                                    )
                                }
                                // img upload
                                if (field.type === 'image-url' && field.isFile) {
                                    return (
                                        <div key={key} className="mb-4">
                                            <label className="block mb-1 font-medium">
                                                {field.label ?? key} (上传图片)
                                            </label>
                                            {formData[key] && (
                                                <div className="mb-2">
                                                    <Image
                                                        width={200}
                                                        height={200}
                                                        src={String(formData[key])}
                                                        alt="Seems like the picture is out for a trip..."
                                                        className="max-h-40 rounded"
                                                    />
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        handleImageUpload(file)
                                                    }
                                                }}
                                            />
                                        </div>
                                    )
                                }

                                // text fields
                                return (
                                    <div key={key} className="mb-4">
                                        <label className="block mb-1 font-medium">
                                            {field.label ?? key} ({field.type})
                                        </label>
                                        <input
                                            type={
                                                field.type === 'int' || field.type === 'float'
                                                    ? 'number'
                                                    : field.type === 'datetime'
                                                        ? 'date'
                                                        : 'text'
                                            }
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            value={formData[key] ?? ''}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    key,
                                                    field.type === 'int' || field.type === 'float'
                                                        ? e.target.value === ''
                                                            ? ''
                                                            : Number(e.target.value)
                                                        : e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
