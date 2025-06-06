/* eslint-disable @typescript-eslint/no-explicit-any */
// app/datamgnt/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import DetailModal from 'src/components/detail-modal'
import { CMSConfig } from 'src/cmsConfig'

type ModelName = keyof typeof CMSConfig
type Entry = Record<string, any>

export default function CMSPage() {
  // Read all CMS config 
  const models = Object.keys(CMSConfig) as ModelName[]
  const [selectedModel, setSelectedModel] = useState<ModelName>(models[0])
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  // switching model: fetch list & reset form & clear selection
  useEffect(() => {
    async function fetchEntries() {
      const res = await fetch(`/api/${selectedModel.toLowerCase()}`)
      const data = (await res.json()) as Entry[]
      setEntries(data)
      setSelectedEntry(null)

      // initialising form
      const initial: Record<string, any> = {}
      CMSConfig[selectedModel].forEach((field) => {
        if (!field.isReadOnly) {
          initial[field.name] = ''
        }
      })
      setFormData(initial)
    }
    fetchEntries()
  }, [selectedModel])

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  // handle creation with POST /api/{model}
  const handleCreate = async () => {
    // check if all nessasary fields are filled, for non-optional fields only image（isFile）can be set empty
    const missing = CMSConfig[selectedModel].some(
      f =>
        !f.isReadOnly &&
        !f.isOptional &&
        (formData[f.name] === '' || formData[f.name] == null)
    )
    if (missing) {
      alert('Please fill up all nessesary fields.')
      return
    }

    const res = await fetch(`/api/${selectedModel.toLowerCase()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (res.ok) {
      const allRes = await fetch(`/api/${selectedModel.toLowerCase()}`)
      const allData = (await allRes.json()) as Entry[]
      setEntries(allData)
      // reset form
      const reset: Record<string, any> = {}
      CMSConfig[selectedModel].forEach((f) => (reset[f.name] = ''))
      setFormData(reset)
      alert('Creation successful.')
    } else {
      alert('Oh no, creation is failed...')
    }
  }

  // re-fetchings
  const refreshEntries = () => {
    fetch(`/api/${selectedModel.toLowerCase()}`)
      .then((res) => res.json())
      .then((data: Entry[]) => setEntries(data))
  }

  const updateEntryInList = (updated: Entry) => {
    setEntries((prev) =>
      prev.map((e) => {
        // make sure the mainkey is always the first one in cms config
        const pk = CMSConfig[selectedModel][0].name
        if (e[pk] === updated[pk]) {
          return updated
        }
        return e
      })
    )
    setSelectedEntry(updated)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <br /><br />
      {/* Model selection Tab */}
      <div className="flex gap-4 mb-8 border-b pb-3">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => setSelectedModel(model)}
            className={`px-4 py-2 rounded-lg font-medium transition ${selectedModel === model
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
          >
            {model}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Details of all the entries */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            {selectedModel} List
          </h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">There are still plenty of seats here! Add a new one now</p>
          ) : (
            <ul>
              {entries.map((e) => {
                const pkField = CMSConfig[selectedModel][0].name
                const displayId = e[pkField]
                const nameField = CMSConfig[selectedModel].find(f => f.name === 'name')?.name
                const displayName = nameField ? e[nameField] : null
                return (
                  <li
                    key={displayId}
                    onClick={() => setSelectedEntry(e)}
                    className="cursor-pointer mb-2 px-2 py-1 rounded hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span className="text-blue-700">
                      {pkField}: {displayId} {displayName ? `| Name: ${displayName}` : ''}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Add a new one - form */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">
            Add {selectedModel}
          </h2>
          <form
            onSubmit={(ev) => {
              ev.preventDefault()
              handleCreate()
            }}
          >
            {CMSConfig[selectedModel].map((field) => {
              if (field.isReadOnly) return null
              if (field.type === 'image-url' && field.isFile) {
                return (
                  <div key={field.name} className="mb-4">
                    <label className="block mb-1 font-medium">
                      {field.label ?? field.name} ({field.type})
                    </label>
                    <input
                      type="file"
                      className='bg-amber-200 text-amber-900'
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const form = new FormData()
                          form.append('file', file)
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: form,
                          })
                          if (res.ok) {
                            const data = (await res.json()) as {
                              url: string
                            }
                            handleInputChange(field.name, data.url)
                          } else {
                            const err = await res.json()
                            alert('Failed to upload img: ' + err.error)
                          }
                        }
                      }}
                    />
                  </div>
                )
              }

              return (
                <div key={field.name} className="mb-4">
                  <label className="block mb-1 font-medium">
                    {field.label ?? field.name} ({field.type})
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
                    onChange={(e) =>
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
              )
            })}
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
        <DetailModal
          model={selectedModel}
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDeleted={refreshEntries}
          onUpdated={updateEntryInList}
        />
      )}
    </div>
  )
}
