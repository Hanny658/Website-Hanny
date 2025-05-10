import React from "react"
import Link from "next/link"
import SongListing from "../components/SongListing"
//import SongLyrics from "../components/SongLyrics"
import "../app/globals.css";

const SongbookPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      {/* Top Bar */}
      <header className="w-full !bg-black bg-opacity-70 !text-white py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-semibold">My Favorite Songs</h1>
        <Link href="/">
          <i className="bi bi-house-door-fill text-2xl hover:text-gray-400 cursor-pointer" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow px-6 py-4">
        {/* Placeholder: Replace with routing logic or conditional rendering */}
        <SongListing />
        {/* <SongLyrics /> */}
      </main>

      {/* Footer */}
      <footer className="w-full text-center text-sm text-gray-600 py-4 border-t">
        Website by Hanny <i className="bi bi-c-circle"></i> 2025
      </footer>
    </div>
  )
}

export default SongbookPage
