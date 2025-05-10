'use client'

import React, { useEffect, useState } from 'react';

interface SongMeta {
  title: string
  number: number
}

const SongListing: React.FC = () => {
  const [songs, setSongs] = useState<SongMeta[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await fetch('/api/songs')
      const data: SongMeta[] = await response.json()
      const sorted = data.sort((a, b) => a.number - b.number)
      setSongs(sorted)
    }

    fetchSongs()

    const onScroll = () => {
      setShowScrollTop(window.scrollY > 100)
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="relative">
      <div className="space-y-2">
        {songs.map((song) => (
          <div
            key={song.number}
            className="border-b bg-black/80 text-white text-xl border-gray-500 py-2 px-4 hover:bg-black/70 flex justify-center items-center"
          >
            <span className="font-medium">{song.number}. {song.title}</span>
          </div>
        ))}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-orange-500 bg-opacity-60 text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 transition"
          aria-label="Scroll to Top"
        >
          <i className="bi bi-arrow-bar-up text-xl"></i>
        </button>
      )}
    </div>
  )
}

export default SongListing
