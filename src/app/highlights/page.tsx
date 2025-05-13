import Link from 'next/link'
import 'bootstrap-icons/font/bootstrap-icons.css'

export const metadata = {
  title: 'Highlights – Under Construction',
  description: 'This page is being built. Check back soon!',
}

const HighlightsPage = () => {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center space-y-6">

        <i className="bi bi-tools text-6xl text-yellow-500 animate-bounce" />

        <h1 className="text-5xl font-extrabold text-gray-800">
          Page Under Construction
        </h1>

        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Hanny is working hard to bring you something amazing. Come back soon!
        </p>

        <Link href="/">
          <div className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">
            <i className="bi bi-house-door-fill mr-2" aria-hidden="true" />
            Back to Home
          </div>
        </Link>
      </div>
    </main>
  )
}

export default HighlightsPage
