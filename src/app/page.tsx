'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import BitRainColumn from 'src/components/bit-rain-col'
import Greeting from "../components/greeting"

interface ColumnStyle {
  left: string
  duration: number
  delay: number
  fontSize: number
  blur: number
}

export default function Home() {
  const [isBouncing, setIsBouncing] = useState(false)
  const [columns, setColumns] = useState<ColumnStyle[] | null>(null)

  const handleClick = () => {
    if (isBouncing) return
    setIsBouncing(true);
  }

  // Paras for the bitrain
  useEffect(() => {
    const generated = Array.from({ length: 16 }, () => ({
      left: `${Math.random() * 100}vw`,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 10,
      fontSize: 12 + Math.random() * 16,
      blur: Math.random() * 2,
    }))
    setColumns(generated)
  }, [])

  // Reset bounce after animation completes
  const handleAnimationEnd = useCallback(() => {
    setIsBouncing(false);
  }, [])

  return (
    <div className="relative min-h-screen pt-12 bg-gradient-to-b from-gray-800 to-black overflow-hidden">
      {/* Bit rain background */}
      {columns && 
      columns.map((col, idx) => (
        <BitRainColumn
          key={idx}
          left={col.left}
          duration={col.duration}
          delay={col.delay}
          fontSize={col.fontSize}
          blur={col.blur}
        />
      ))}

      <div
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
        className={`
          absolute bottom-0 right-0
          w-1/2 max-w-sm
          opacity-100 select-none z-20
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

      <div className="relative flex flex-col justify-center h-screen px-4 text-center">
        {/* Greeting at top-left of this centered block */}
        <Greeting />
        {/* <h1 className="self-start text-6xl sm:text-6xl md:text-8xl lg:text-9xl
                md:px-20 lg:px-32 font-bold text-white mix-blend-difference
                relative leading-tight">
          G&apos;day Mate!
        </h1> */}
        <br />

        {/* Centered self-introduction */}
        <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl lg:text-3xl text-blue-100 drop-shadow-md text-justify">
          Hello! I&apos;m Hanny Zhang, a Software Engineer, specializing in full-stack development and 
          Gen-AI related applications, and a lots MORE! Currently pursuing Masters of AI at NTU Singapore.
          I love crafting professional IT solutions, doing funny projects, whipping up new recipes, 
          also exploring the great outdoors. 
          <br /><br />
          Welcome to my personal corner of the web — grab a cuppa and have a look around!
        </p>
      </div>
    </div>
  )
}
