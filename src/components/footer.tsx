import { FC } from 'react'
import Link from 'next/link'
import MailtoLink from './mail-to-link'
import AddContactButton from './add-contact'

const Footer: FC = () => {
  return (
    <footer className="bg-orange-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:flex md:justify-between">

        <div className="space-y-2">
          <div className="flex items-center">
            <i className="bi bi-telephone mr-2" aria-hidden="true" />
            <a href="tel:+61 432269803">
              +61 432269803
            </a>
            <AddContactButton
              fullName="Hanny Zhang"
              phone="+61432269803"
              email="hannyanhai@gmail.com"
              fileName="Hanny"
              className="inline-block px-2 py-0 bg-transparent text-black hover:text-gray-800"
            >
              <i className="bi bi-journal-plus"></i>
            </AddContactButton>
          </div>
          <div className="flex items-center">
            <i className="bi bi-envelope mr-2" aria-hidden="true" />
            <span>
              hannyanhai@gmail.com
              <MailtoLink
                email="hannyanhai@gmail.com"
                subject="G'day, Hanny!"
                body="I saw your personal website and have a interest to have a chat with you."
                className="inline-block px-2 py-0 bg-transparent text-black hover:text-gray-800"
              >
                <i className="bi bi-envelope-plus"></i>
              </MailtoLink>
            </span>
          </div>
          <div className="flex items-center">
            <i className="bi bi-pin-fill mr-2" aria-hidden="true" />
            <span>
              Carlton VIC 3053, Melbourne
              <Link
                href={"https://www.google.com/maps/place/Carlton+VIC+3053/@-37.7946724,144.9672394,720m/data=!3m1!1e3!4m6!3m5!1s0x6ad642d153982dd1:0x5045675218ce780!8m2!3d-37.8007555!4d144.9669992!16zL20vMDM0MWxz?entry=ttu&g_ep=EgoyMDI1MDkxMC4wIKXMDSoASAFQAw%3D%3D"}
                className="inline-block px-2 py-0 bg-transparent text-black hover:text-gray-800"
                target='_blank'
              >
                <i className="bi bi-pin-map-fill"></i>
              </Link>
            </span>
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
          <Link href="https://docs.google.com/document/d/1y41EdnxRE4oZDEUNZ3Iazqbi3qGr1hoU/edit?usp=sharing&ouid=104618212436179341950&rtpof=true&sd=true" target="_blank" passHref>
            <div
              className="flex items-center hover:text-gray-200 transition"
              rel="noopener noreferrer"
            >
              <i className="bi bi-file-text-fill mr-2 text-2xl text-gray-400" aria-hidden="true" />
              Resumé
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
