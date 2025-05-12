import fs from 'fs'
import path from 'path'
import Link from "next/link"
import { GetStaticPaths, GetStaticProps } from 'next'
import "../../app/globals.css"
import "bootstrap-icons/font/bootstrap-icons.css"

interface SongLine {
  chords: string
  lyrics: string
}

interface SongSection {
  id: string
  label: string
  lines: SongLine[]
}

interface SongData {
  title: string
  link: string
  number: number
  lyrics: SongSection[]
  song: string[]
}

interface Props {
  song: SongData
}

export default function SongLyrics({ song }: Props) {
  const sectionMap = Object.fromEntries(song.lyrics.map(sec => [sec.id, sec]))
  const videoId = song.link?.split('v=')[1]?.split('&')[0] || song.link?.split('youtu.be/')[1] || ''


  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
    {/* Top Bar */}
    <header className="w-full !bg-black bg-opacity-70 !text-white py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-semibold">My Favorite Songs - {song.title}</h1>
      <Link href="/songbook">
        <i className="bi bi-house-door-fill text-3xl text-white hover:text-amber-100 cursor-pointer" />
      </Link>
    </header>

    {/* YouTube Player */}
    {videoId && (
      <div className="w-full md:w-1/2 p-4 mx-auto">
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-64 md:h-80 rounded-lg shadow-md"
          />
        </div>
      </div>
    )}

    {/* Song Content */}
    <div className="p-4 space-y-8">
      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">{song.title}</h2>

      {song.song.map((sectionId, index) => {
        const section = sectionMap[sectionId]
        if (!section) return null

        return (
          <div
            key={index}
            className="flex flex-col md:flex-row md:space-x-8 border-l-4 border-blue-400 pl-4 md:pl-6"
          >
            <div className="w-full md:w-48 font-semibold text-lg md:text-xl text-blue-700 mb-2 md:mb-0">
              {section.label}
            </div>
            <div className="flex-grow space-y-2">
              {section.lines.map((line, idx) => (
                <div key={idx}>
                  <p className="text-sm md:text-lg text-blue-500 whitespace-pre">{line.chords}</p>
                  <p className="text-base md:text-xl text-black">{line.lyrics}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>

    {/* Footer */}
    <footer className="w-full text-center text-sm text-gray-600 py-4 border-t">
      Website by Hanny <i className="bi bi-c-circle"></i> 2025
    </footer>
  </div>
  )
}

// --- Build-time generation of paths and props
export const getStaticPaths: GetStaticPaths = async () => {
  const dir = path.join(process.cwd(), 'src', 'songdata')
  const files = fs.readdirSync(dir).filter(file => file.endsWith('.json'))

  const paths = files.map(file => {
    const json = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8'))
    return { params: { number: json.number.toString() } }
  })

  return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const number = params?.number
  const filePath = path.join(process.cwd(), 'src', 'songdata', `${number}.json`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const song = JSON.parse(content)

  return {
    props: { song },
  }
}
