import { FC } from 'react'
import Link from 'next/link'

const Footer: FC = () => {
  return (
    <footer className="bg-orange-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:flex md:justify-between">
        
        <div className="space-y-2">
          <div className="flex items-center">
            <i className="bi bi-telephone mr-2" aria-hidden="true" />
            <span>+61 432269803</span>
          </div>
          <div className="flex items-center">
            <i className="bi bi-envelope mr-2" aria-hidden="true" />
            <span>hannyanhai@gmail.com</span>
          </div>
        </div>
        
        {/* Right side: social links */}
        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <Link href="https://github.com/Hanny658" target="_blank" passHref>
            <div
              className="flex items-center hover:text-gray-200 transition"
              rel="noopener noreferrer"
            >
              <i className="bi bi-github mr-2 text-2xl text-black" aria-hidden="true" />
              GitHub
            </div>
          </Link>
          <Link href="https://www.linkedin.com/in/hanny-zhang-02b394270/" target="_blank" passHref>
            <div
              className="flex items-center hover:text-gray-200 transition"
              rel="noopener noreferrer"
            >
              <i className="bi bi-linkedin mr-2 text-2xl text-blue-700" aria-hidden="true" />
              LinkedIn
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div className="border-t border-white/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-center text-sm text-white/75">
            Website by Hanny Zhang <i className="bi bi-c-circle text-xs" /> 2025
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
