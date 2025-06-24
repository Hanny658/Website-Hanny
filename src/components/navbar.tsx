'use client'

import { FC, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar: FC = () => {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav className="fixed w-full top-0 z-50 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo on the left */}
                    <div className="flex-shrink-0">
                        <Link href="/" passHref>
                            <div className="flex items-center">
                                <Image
                                    src="/hanny.png"
                                    alt="Hanny Logo"
                                    width={80}
                                    height={60}
                                    className="object-contain"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Navigation links on the right */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/my-skills" passHref>
                            <div className="flex items-center text-gray-800 hover:text-gray-600 transition">
                                <i className="bi bi-laptop me-1" aria-hidden="true" />
                                My Skills
                            </div>
                        </Link>
                        <Link href="/highlights" passHref>
                            <div className="flex items-center text-gray-800 hover:text-gray-600 transition">
                                <i className="bi bi-star me-1" aria-hidden="true" />
                                Highlights
                            </div>
                        </Link>
                        <Link href="https://snackmap.org" target='_blank'>
                            <div className="flex items-center text-gray-800 hover:text-gray-600 transition">
                                <i className="bi bi-map me-1" aria-hidden="true" />
                                Snack Map
                            </div>
                        </Link>
                        <Link href="https://www.cgsongbook.org/" target='_blank'>
                            <div className="flex items-center text-gray-800 hover:text-gray-600 transition">
                                <i className="bi bi-music-note-list me-1" aria-hidden="true" />
                                Songbook
                            </div>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-800 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        >
                            <i className={`bi ${menuOpen ? 'bi-x' : 'bi-list'} text-2xl`} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile dropdown links */}
            {menuOpen && (
                <div className="md:hidden bg-white/50 backdrop-blur-sm px-2 pt-2 pb-3 space-y-1">
                    <Link href="/my-skills" passHref>
                        <div
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                        >
                            <i className="bi bi-laptop me-1" aria-hidden="true" /> My Skills
                        </div>
                    </Link>
                    <Link href="/highlights" passHref>
                        <div
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                        >
                            <i className="bi bi-star me-1" aria-hidden="true" /> Highlights
                        </div>
                    </Link>
                    <Link href="/map-of-snacks" passHref>
                        <div
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                        >
                            <i className="bi bi-map me-1" aria-hidden="true" /> Snack Map
                        </div>
                    </Link>
                    <Link href="/songbook" passHref>
                        <div
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:bg-gray-100"
                            onClick={() => setMenuOpen(false)}
                        >
                            <i className="bi bi-music-note-list me-1" aria-hidden="true" /> Songbook
                        </div>
                    </Link>
                </div>
            )}
        </nav >
    )
}

export default Navbar
