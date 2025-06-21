"use client"

import { FC, useState, useEffect } from 'react'

/**
 * BitRainColumn: A vertical column of random bits (0/1) that animate upward,
 * with random font size and blur effect per column.
 */
interface BitRainColumnProps {
  left: string;
  duration: number;
  delay: number;
  fontSize: number;
  blur: number;
}

const BitRainColumn: FC<BitRainColumnProps> = ({ left, duration, delay, fontSize, blur }) => {
  const [bits, setBits] = useState<string[]>([])

  useEffect(() => {
    // Initialize a random-length column of bits
    const len = Math.floor(Math.random() * 20) + 10
    setBits(Array.from({ length: len }, () => (Math.random() < 0.5 ? '0' : '1')))

    // Randomize a bit periodically
    const interval = setInterval(() => {
      setBits(prev => {
        const idx = Math.floor(Math.random() * prev.length)
        const next = [...prev]
        next[idx] = Math.random() < 0.5 ? '0' : '1'
        return next
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="
        bit-column
        absolute
        bottom-0                /* anchor bottom edge to container’s bottom */
        flex
        flex-col
        text-green-400
        font-code
        leading-tight
        opacity-50
      "
      style={{
        left,
        animation: `moveUp ${duration}s linear infinite`,
        animationDelay: `-${delay}s`,
        fontSize: `${fontSize}px`,
        filter: `blur(${blur}px)`,
      }}
    >
      {bits.map((bit, i) => (
        <span key={i}>{bit}</span>
      ))}
    </div>
  )
}

export default BitRainColumn
