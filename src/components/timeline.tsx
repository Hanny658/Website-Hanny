'use client'

import React, { useRef, useEffect } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import Image from 'next/image'

// ─── Data Model ──────────────────────────────────────────────────────────────
export interface Highlight {
    time: string
    title: string
    description: string
    picture?: string
}

interface TimelineProps {
    items: Highlight[]
}

// ─── TimelineItem ────────────────────────────────────────────────────────────
const TimelineItem: React.FC<{ item: Highlight; isLeft: boolean }> = ({
    item,
    isLeft,
}) => {
    const ref = useRef<HTMLLIElement>(null)
    const isInView = useInView(ref, { once: false, amount: 0.4 })
    const controls = useAnimation()

    useEffect(() => {
        if (isInView) {
            // entering → always slide up from bottom
            controls.start({ opacity: 1, y: 0 })
        } else if (ref.current) {
            const { top } = ref.current.getBoundingClientRect()
            if (top < 0) {
                // node left at the top edge → exit upwards
                controls.start({ opacity: 0, y: -50 })
            } else {
                // node left at the bottom edge → exit downwards
                controls.start({ opacity: 0, y: 50 })
            }
        }
    }, [isInView, controls])

    return (
        <motion.li
            ref={ref}
            className="relative flex items-center w-full"
            // always start hidden, pick the “off-screen” y for first play
            initial={{ opacity: 0, y: 50 }}
            animate={controls}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* ─── MOBILE LAYOUT ─────────────────────────────────── */}
            <div className="flex flex-col items-center w-full space-y-4 md:hidden">
                {/* Date on top */}
                <time className="font-bold text-sm text-shadow-amber-100/70 text-shadow-md text-gray-500">{item.time}</time>
                {/* Node icon */}
                <i className="bi bi-record-circle text-blue-600 text-3xl" />
                {/* Article card under */}
                <article className="bg-white p-6 rounded-lg shadow-md w-full">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-gray-600">{item.description}</p>
                    {item.picture &&
                        <Image
                            width={500}
                            height={300}
                            src={item.picture}
                            alt={item.title}
                            className="mt-4 w-full h-48 object-cover rounded"
                        />
                    }
                </article>
            </div>

            {/* ─── DESKTOP LAYOUT ───────────────────────────────── */}
            <div className="hidden md:flex items-center w-full">
                {/* Left column */}
                <div className={`w-1/2 ${isLeft ? 'pr-8 text-right' : 'pr-8 text-left'}`}>
                    {isLeft ? (
                        <time className="font-bold text-sm text-shadow-amber-100/70 text-shadow-md text-gray-500">{item.time}</time>
                    ) : (
                        <article className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-cyan-800">{item.title}</h3>
                            <p className="mt-2 text-gray-600">{item.description}</p>
                            {item.picture &&
                                <Image
                                    width={500}
                                    height={300}
                                    src={item.picture}
                                    alt={item.title}
                                    className="mt-4 w-full h-48 object-cover rounded"
                                />
                            }
                        </article>
                    )}
                </div>
                {/* Center-line icon */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                    <i className="bi bi-record-circle text-blue-600 text-3xl" />
                </div>
                {/* Right column */}
                <div className={`w-1/2 ${isLeft ? 'pl-8 text-left' : 'pl-8 text-left'}`}>
                    {isLeft ? (
                        <article className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-amber-800">{item.title}</h3>
                            <p className="mt-2 text-gray-600">{item.description}</p>
                            {item.picture &&
                                <Image
                                    width={500}
                                    height={300}
                                    src={item.picture}
                                    alt={item.title}
                                    className="mt-4 w-full h-48 object-cover rounded"
                                />
                            }
                        </article>
                    ) : (
                        <time className="font-bold text-sm text-shadow-amber-100/60 text-shadow-md text-gray-500">{item.time}</time>
                    )}
                </div>
            </div>
        </motion.li>
    )
}

// ─── Timeline ────────────────────────────────────────────────────────────────
// Loops through all highlights and renders a TimelineItem for each
const Timeline: React.FC<TimelineProps> = ({ items }) => {
    return (
        <div className="relative mx-auto px-4 py-4 max-w-4xl">
            {/* Vertical center line (Whoa, align it with picture is such a torture) */}
            <div className="absolute left-1/2 top-0 w-[2px] bg-gray-300 h-full -translate-x-1/2 
                mask-b-from-0 mask-b-to-20 mask-b-from-transparent mask-b-to-gray-300" />

            <ul className="space-y-16">
                {items.map((item, idx) => (
                    <TimelineItem
                        key={item.time}
                        item={item}
                        isLeft={idx % 2 === 0}
                    />
                ))}
            </ul>
        </div>
    )
}

export default Timeline
