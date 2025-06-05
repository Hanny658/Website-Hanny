'use client'

import React, { useEffect, useState } from 'react'
import { Place, Cheapie } from 'src/generated/prisma'

const MODELS = ['Place', 'Cheapie'] as const
type ModelName = (typeof MODELS)[number]

// mirroring Prisma types
type PlaceEntry = Place
type CheapieEntry = Cheapie
type Entry = PlaceEntry | CheapieEntry

/**
 * Get the info of selected Model to display in modals
 */
function getFields(model: ModelName): { name: string; type: string }[] {
  switch (model) {
    case 'Place':
      return [
        { name: 'identifier', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'lng', type: 'float' },
        { name: 'lat', type: 'float' },
      ]
    case 'Cheapie':
      return [
        { name: 'name', type: 'string' },
        { name: 'store', type: 'string' },
        { name: 'quantity', type: 'int' },
        { name: 'price', type: 'float' },
        { name: 'exp', type: 'datetime' },
      ]
  }
}

export default function CMSPage() {
  const [selectedModel, setSelectedModel] = useState<ModelName>('Place')
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [formData, setFormData] = useState<Record<string, string | number>>({})

  // Get record and clear form when selecting different model
  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch(`/api/${selectedModel.toLowerCase()}`)
        if (!res.ok) throw new Error('fetch failed')
        const data = (await res.json()) as Entry[]
        setEntries(data)
        setSelectedEntry(null)

        // Initialise
        const initial: Record<string, string | number> = {}
        getFields(selectedModel).forEach(field => {
          initial[field.name] = ''
        })
        setFormData(initial)
      } catch (error) {
        console.error(error)
      }
    }
    fetchEntries()
  }, [selectedModel])

  // Form onchange
  const handleInputChange = (key: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Submit a new one
  const handleSubmit = async () => {
    const missing = Object.values(formData).some(v => v === '' || v === null)
    if (missing) {
      alert('Please fill all fields.')
      return
    }

    try {
      const res = await fetch(`/api/${selectedModel.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('create failed')

      // Fetch list again
      const listRes = await fetch(`/api/${selectedModel.toLowerCase()}`)
      if (!listRes.ok) throw new Error('fetch failed')
      const allData = (await listRes.json()) as Entry[]
      setEntries(allData)

      // reset form
      const reset: Record<string, string | number> = {}
      getFields(selectedModel).forEach(f => {
        reset[f.name] = ''
      })
      setFormData(reset)

      alert('Creation successful la!')
    } catch (error) {
      console.error(error)
      alert('Failed to create..555')
    }
  }

  // Delete a specific record
  const handleDelete = async (idOrIdentifier: string | number) => {
    if (!confirm('Are you sure to delete this record?')) return
    try {
      const endpoint =
        typeof idOrIdentifier === 'number'
          ? `/api/${selectedModel.toLowerCase()}/${idOrIdentifier}`
          : `/api/${selectedModel.toLowerCase()}/${encodeURIComponent(
              idOrIdentifier
            )}`
      const res = await fetch(endpoint, { method: 'DELETE' })
      if (res.status !== 204) throw new Error('delete failed')

      // Fetch list
      const listRes = await fetch(`/api/${selectedModel.toLowerCase()}`)
      if (!listRes.ok) throw new Error('fetch failed')
      const allData = (await listRes.json()) as Entry[]
      setEntries(allData)
      setSelectedEntry(null)
      alert('Delete finished. See you around.')
    } catch (error) {
      console.error(error)
      alert('Fail to delete... Aiya!')
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <br /><br />
      {/* The Model switching on top */}
      <div className="flex gap-4 mb-8 border-b pb-3">
        {MODELS.map(model => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedModel === model
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
            }`}
          >
            {model}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List all details of selected model */}
        <div className="bg-white rounded-lg shadow p-4 max-h-[75vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">
            {selectedModel} Entry List
          </h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">Currently no records in this model.</p>
          ) : (
            <ul>
              {entries.map(entry => {
                const displayId =
                  selectedModel === 'Place'
                    ? (entry as PlaceEntry).identifier
                    : (entry as CheapieEntry).id
                return (
                  <li
                    key={displayId}
                    onClick={() => setSelectedEntry(entry)}
                    className="cursor-pointer mb-2 px-2 py-1 rounded hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span className="text-blue-600">ID: {displayId}</span>
                    <span className="text-black">{entry.name}</span>
                    <button
                      onClick={ev => {
                        ev.stopPropagation()
                        handleDelete(displayId)
                      }}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Add a new record */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            Add a New {selectedModel}
          </h2>
          <form
            onSubmit={ev => {
              ev.preventDefault()
              handleSubmit()
            }}
          >
            {getFields(selectedModel).map(field => (
              <div key={field.name} className="mb-4">
                <label className="block mb-1 font-medium">
                  {field.name} ({field.type})
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
                  value={formData[field.name] ?? ''}
                  onChange={e =>
                    handleInputChange(
                      field.name,
                      field.type === 'int' || field.type === 'float'
                        ? e.target.value === ''
                          ? ''
                          : Number(e.target.value)
                        : e.target.value
                    )
                  }
                />
              </div>
            ))}
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 max-w-2xl rounded-lg shadow-lg p-6 relative">
            <h3 className="text-2xl font-semibold mb-4">
              {selectedModel} Detailed Info
            </h3>
            <div className="space-y-2 mb-6 max-h-60 overflow-auto">
              {Object.entries(selectedEntry).map(([key, val]) => {
                const typeInfo = getFields(selectedModel).find(
                  f => f.name === key
                )?.type
                return (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}</span>
                    <span>
                      {String(val)}{' '}
                      <span className="text-sm text-gray-500">
                        ({typeInfo ?? 'unknown'})
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const idOrIdentifier =
                    selectedModel === 'Place'
                      ? (selectedEntry as PlaceEntry).identifier
                      : (selectedEntry as CheapieEntry).id
                  handleDelete(idOrIdentifier)
                  setSelectedEntry(null)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
            <button
              onClick={() => setSelectedEntry(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
