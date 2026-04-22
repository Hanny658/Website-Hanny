'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import BitRainColumn from 'src/components/bit-rain-col'
import Greeting from "../components/greeting"
import { motion } from 'framer-motion'

interface ColumnStyle {
  left: string
  duration: number
  delay: number
  fontSize: number
  blur: number
}

// Small chips above the intros
const CHIPS = ['Creative', 'Passionate', 'Always Ready', 'Never Stop Learning']
const INTRO_LINES = [
  ['Hi!', "Glad to see you here."], ['Welcome to my personal website.'], 
  ['Think bold,', 'Just do it.'], ['I am Hanny','An AI enthusiast.'],
  ['Hello there.'], ['Nice to see you.', 'Have fun exploring!']
]

export default function Home() {
  const [isBouncing, setIsBouncing] = useState(false)
  const [columns, setColumns] = useState<ColumnStyle[] | null>(null)

  const [isIntroDone, setIsIntroDone] = useState(false)
  const [introLineIndex, setIntroLineIndex] = useState(0)
  const [introCharIndex, setIntroCharIndex] = useState(0)
  const [introIsDeleting, setIntroIsDeleting] = useState(false)
  const selectedIntro = useMemo(() => {
    const pick = Math.floor(Math.random() * INTRO_LINES.length)
    return INTRO_LINES[pick]
  }, [])

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

  useEffect(() => {
    if (isIntroDone) return

    const currentLine = selectedIntro[introLineIndex] ?? ''
    const typingSpeed = introIsDeleting ? 28 : 44
    const pauseMs = introIsDeleting ? 300 : 520

    const timer = setTimeout(() => {
      if (!introIsDeleting) {
        if (introCharIndex < currentLine.length) {
          setIntroCharIndex((value) => value + 1)
          return
        }
        setIntroIsDeleting(true)
        return
      }

      if (introCharIndex > 0) {
        setIntroCharIndex((value) => value - 1)
        return
      }

      if (introLineIndex < selectedIntro.length - 1) {
        setIntroIsDeleting(false)
        setIntroLineIndex((value) => value + 1)
        return
      }

      setIsIntroDone(true)
    }, introCharIndex === currentLine.length ? pauseMs : typingSpeed)

    return () => clearTimeout(timer)
  }, [introCharIndex, introIsDeleting, introLineIndex, isIntroDone, selectedIntro])

  // Reset bounce after animation completes
  const handleAnimationEnd = useCallback(() => {
    setIsBouncing(false);
  }, [])

  return (
    <div className="relative min-h-screen pt-12 bg-linear-to-b from-slate-900 via-slate-950 to-black overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_80%_25%,rgba(236,72,153,0.14),transparent_38%),radial-gradient(circle_at_55%_85%,rgba(14,165,233,0.12),transparent_45%)]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-130 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
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

      <motion.div
        onClick={handleClick}
        onAnimationEnd={handleAnimationEnd}
        className={`
          absolute bottom-0 right-0
          w-1/2 max-w-sm
          opacity-100 select-none z-20
          cursor-pointer
          ${isBouncing ? 'animate-click-bounce' : ''}
        `}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isIntroDone ? 1 : 0, y: isIntroDone ? 0 : 30 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
        whileHover={{ scale: 1.03, rotate: -1 }}
      >
        <Image
          src="/hanny-suit.png"
          alt="Hanny in Suit"
          width={300}
          height={400}
          className="object-contain w-full h-auto"
        />
      </motion.div>

      {!isIntroDone && (
        <motion.div
          className="relative z-20 flex h-[70vh] items-center justify-center px-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="max-w-2xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-100 drop-shadow">
            <span>{selectedIntro[introLineIndex]?.slice(0, introCharIndex) ?? ''}</span>
            <span className="ml-1 inline-block h-7 w-0.5 animate-pulse bg-slate-200 align-middle sm:h-9 md:h-10" />
          </div>
        </motion.div>
      )}

      <motion.div
        className="relative flex flex-col justify-center h-screen px-4 text-center"
        initial="hidden"
        animate={isIntroDone ? 'show' : 'hidden'}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: 'easeOut' } },
          }}
        >
          {/* Greeting at top-left of this centered block */}
          <Greeting />
        </motion.div>
        <br />

        {/* Centered self-introduction */}
        <motion.div
          className="mt-4 flex flex-wrap justify-center gap-3"
          variants={{
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
          }}
        >
          {CHIPS.map((chip) => (
            <motion.span
              key={chip}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-slate-200/80 backdrop-blur"
              whileHover={{ scale: 1.05, y: -2, backgroundColor: 'rgba(255,255,255,0.1)' }}
              transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            >
              {chip}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
            show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: 'easeOut' } },
          }}
          className="mt-6 max-w-2xl mx-auto text-lg sm:text-lg md:text-xl lg:text-2xl text-blue-100 drop-shadow-md text-justify"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          Hello! I&apos;m Hanny Zhang, an AI Engineer, specializing in utilising the power of modern AI 
          techniques to solve real-world problems! Currently pursuing Masters of AI at NTU Singapore.
          I love crafting professional IT solutions, doing funny projects, whipping up new recipes, 
          also exploring the great outdoors. 
          <br /><br />
          Welcome to my personal corner of the web — grab a cuppa and have a look around!
        </motion.p>
      </motion.div>
    </div>
  )
}
