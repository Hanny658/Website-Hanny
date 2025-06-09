// components/AdminActions.tsx
'use client'

import React, { useState } from 'react'

export default function AdminActions() {
    const [loadingUnlinked, setLoadingUnlinked] = useState(false)
    const [loadingGone, setLoadingGone] = useState(false)

    /**
     * Remove files in public/uploads not referenced by any model
     */
    const handleRemoveUnlinked = async () => {
        if (!confirm('Are you sure you want to remove all unlinked upload files?')) return
        setLoadingUnlinked(true)
        try {
            const res = await fetch('/api/admin/cleanup/unlinked-files', { method: 'DELETE' })
            if (!res.ok) throw new Error('Cleanup failed')
            const data = await res.json()
            alert(`Removed ${data.removed} unlinked files.`)
        } catch (err) {
            console.error(err)
            alert('Error removing unlinked files.')
        } finally {
            setLoadingUnlinked(false)
        }
    }

    /**
     * Remove all Cheapie entries with stock === 'gone'
     */
    const handleRemoveGone = async () => {
        if (!confirm('Are you sure you want to remove all out-of-stock (gone) cheapies?')) return
        setLoadingGone(true)
        try {
            const res = await fetch('/api/admin/cleanup/gone-cheapies', { method: 'DELETE' })
            if (!res.ok) throw new Error('Deletion failed')
            const data = await res.json()
            alert(`Deleted ${data.deleted} cheapie entries.`)
        } catch (err) {
            console.error(err)
            alert('Error deleting gone cheapies.')
        } finally {
            setLoadingGone(false)
        }
    }

    return (
        <div className="flex flex-row space-x-2 w-full">
            <button
                className="flex-1 bg-yellow-600 text-white py-2 px-1 rounded-lg hover:bg-yellow-500 transition"
                onClick={handleRemoveUnlinked}
                disabled={loadingUnlinked}
            >
                {loadingUnlinked ? 'Removing...' : 'Remove all unlinked upload files'}
            </button>
            <button
                className="flex-1 bg-orange-700 text-white py-2 px-1 rounded-lg hover:bg-orange-600 transition"
                onClick={handleRemoveGone}
                disabled={loadingGone}
            >
                {loadingGone ? 'Deleting...' : 'Remove all cheapies out of stock'}
            </button>
        </div>
    )
}
