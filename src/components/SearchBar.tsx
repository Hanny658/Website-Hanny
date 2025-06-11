// components/SearchBar.tsx
'use client'

import React, { useEffect, useRef, useState } from 'react'

interface PlaceSuggestion {
  type: 'place'
  identifier: string
  name: string
}

interface CheapieSuggestion {
  type: 'cheapie'
  id: number
  name: string
  store: string
  quantity: number
  price: number
}

type Suggestion = PlaceSuggestion | CheapieSuggestion

interface SearchBarProps {
  onSelectPlace: (id: string) => void
}

export default function SearchBar({ onSelectPlace }: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch all places and cheapies on mount
  useEffect(() => {
    async function fetchSuggestions() {
      try {
        // Fetch places
        const placeRes = await fetch('/api/place')
        const places = (await placeRes.json()) as PlaceSuggestion[]
        const mappedPlaces = places.map((p) => ({
          type: 'place' as const,
          identifier: p.identifier,
          name: p.name,
        }))

        // Fetch cheapies
        const cheapieRes = await fetch('/api/cheapie')
        const cheapiesData = (await cheapieRes.json()) as CheapieSuggestion[]
        const mappedCheapies = cheapiesData.map((c) => ({
          type: 'cheapie' as const,
          id: c.id,
          name: c.name,
          store: c.store,
          quantity: c.quantity,
          price: c.price,
        }))

        setSuggestions([...mappedPlaces, ...mappedCheapies])
      } catch (err) {
        console.error('Failed to fetch suggestions:', err)
      }
    }
    fetchSuggestions()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter suggestions based on query (case-insensitive)
  const filtered = suggestions.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    // className="absolute top-20 right-4 w-1/4 z-20"
    <div className={`
      fixed
      left-1/2 transform -translate-x-1/2
      bottom-12
      w-11/12
      z-20
      sm:absolute sm:top-20 sm:right-4 sm:left-auto sm:translate-x-0 sm:transform-none sm:bottom-auto sm:w-1/4
      transition-all duration-300
    `}>
      {/* Search input */}
      <input
        ref={inputRef}
        type="text"
        placeholder="Search place or snacks..."
        className="w-full px-4 py-2 rounded-lg border placeholder-gray-500 text-gray-900 
        bg-white/50 hover:bg-white/90 active:bg-white/90 backdrop-blur-md backdrop-brightness-150 border-gray-300 
        focus:outline-none focus:ring-2 focus:ring-blue-300"
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          // className="mt-1 max-h-64 overflow-auto bg-white/50 backdrop-blur-md rounded-lg shadow-lg"
          className="
          absolute bottom-full left-0 w-full mb-1
          sm:static sm:mt-1 sm:mb-0
          max-h-64 overflow-auto bg-white/80 backdrop-blur-md backdrop-brightness-150 rounded-lg shadow-lg
        "
        >
          {filtered.length === 0 ? (
            <div className="p-4 text-gray-500">No results</div>
          ) : (
            filtered.map((item) => {
              if (item.type === 'place') {
                return (
                  <div
                    key={`place-${item.identifier}`}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                    onClick={() => {
                      onSelectPlace(item.identifier)
                      setIsOpen(false)
                      setQuery('')
                    }}
                  >
                    {item.name}
                  </div>
                )
              } else {
                return (
                  <div
                    key={`cheapie-${item.id}`}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex flex-col text-gray-900"
                    onClick={() => {
                      onSelectPlace(item.store)
                      setIsOpen(false)
                      setQuery('')
                    }}
                  >
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">
                      {item.quantity} for ${item.price.toFixed(2)}
                    </span>
                  </div>
                )
              }
            })
          )}
        </div>
      )}
    </div>
  )
}
