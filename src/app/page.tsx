'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
// import Link from 'next/link'

export default function Home() {
  const [isBouncing, setIsBouncing] = useState(false)

   const handleClick = () => {
    if (isBouncing) return
    setIsBouncing(true)
  }


  // Reset bounce after animation completes
  const handleAnimationEnd = useCallback(() => {
    setIsBouncing(false)
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-yellow-300 to-orange-500 overflow-hidden">
      <div
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
        className={`
          absolute bottom-0 right-0
          w-1/2 max-w-sm
          opacity-80 select-none z-20
          cursor-pointer
          ${isBouncing ? 'animate-click-bounce' : ''}
        `}
      >
        <Image
          src="/hanny-suit.png"
          alt="Hanny in Suit"
          width={300}
          height={400}
          className="object-contain w-full h-auto"
        />
      </div>

      <div className="relative z-10 flex flex-col justify-center h-screen px-4 text-center">
        {/* Greeting at top-left of this centered block */}
        <h1 className="self-start text-6xl sm:text-6xl md:text-8xl lg:text-9xl md:px-20 lg:px-32 
                      font-bold bg-gradient-to-b from-yellow-200 to-white bg-clip-text text-transparent drop-shadow-lg leading-tight">
          G&apos;day Mate!
        </h1>
        <br /><br /><br />

        {/* Centered self-introduction */}
        <p className="mt-6 max-w-xl mx-auto text-lg sm:text-xl md:text-2xl lg:text-3xl text-white drop-shadow-md text-justify">
          Hello! I&apos;m Hanny Zhang, a Software Engineer based in Naarm (aka. Melbourne) specializing in full-stack
          development and Gen-AI related applications, and a lots MORE! I love crafting professional IT solutions, 
          doing funny projects, whipping up new recipes, also exploring the great outdoors. 
          <br />
          Welcome to my personal corner of the web — grab a cuppa and have a look around!
        </p>
      </div>
    </div>
  )
}
