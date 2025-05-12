import React from 'react'
import Image from 'next/image'
// import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative min-h-screen grid grid-rows-[20px_1fr_auto] items-center justify-items-center bg-gradient-to-b from-yellow-300 to-orange-500 px-4 py-8 sm:px-20 sm:py-20 font-[family-name:var(--font-geist-sans)] overflow-hidden">
      
      <div className="hidden sm:block absolute bottom-0 right-0 w-1/2 max-w-sm opacity-80 pointer-events-none select-none z-0">
        <Image
          src="/hanny-suit.png"
          alt="Hanny in Suit"
          width={300}
          height={400}
          className="object-contain w-full h-auto"
        />
      </div>

      {/* Main Title */}
      <main className="row-start-2 z-10 text-center">
        <p className="text-4xl sm:text-7xl md:text-8xl lg:text-9xl text-white drop-shadow-md">
          Comin&apos; Soooooooooon
        </p>
      </main>

      {/* Footer */}
      <footer className="row-start-3 z-10 mt-10 flex flex-col items-center text-center space-y-2 px-4">
        <p className="text-2xl sm:text-3xl text-cyan-600">
          Hanny is working on his own <b>P</b>ersonal <b>H</b>ome <b>P</b>age
        </p>
        <p className="text-lg text-cyan-600">(but not with PHP XD)</p>
      </footer>
    </div>
  )
}
