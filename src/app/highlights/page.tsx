// app/highlights/page.tsx

import React from 'react'
import Timeline, { Highlight } from 'src/components/timeline'
import highlightsData from 'src/highlights.json'

const HighlightPage: React.FC = () => {
  const items: Highlight[] = highlightsData.highlights

  return (
    <main className="relative min-h-screen overflow-hidden">
      <br /><br />
      {/* Full-screen background image */}
      <div
        className="
          absolute inset-0
          bg-[url('/highlights/highlight_bg.jpg')]
          bg-cover
          bg-center
          bg-no-repeat
          bg-fixed
          -z-10
        "
      />

      {/* Page content */}
      <div className="relative z-10">
        <header className="py-12 text-center text-white drop-shadow-lg">
          <h1 className="text-4xl font-bold">My Highlighted Times</h1>
          <p className="mt-2 text-lg">
            A journey from 2019 through today.
          </p>
        </header>

        <Timeline items={items} />
      </div>
    </main>
  )
}

export default HighlightPage
