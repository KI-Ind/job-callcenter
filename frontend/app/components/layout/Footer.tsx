'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import dynamic from 'next/dynamic'

// Dynamically import the CookieManager to avoid SSR issues
const CookieManager = dynamic(
  () => import('../cookies/CookieManager'),
  { ssr: false }
)

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/JBC-Logo.png"
                alt="JobCallCenter.ma"
                width={220}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Platform specializing in call center recruitment. Connect with top talent or find your next job.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaFacebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaTwitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">Accueil</Link>
              </li>
              <li>
                <Link href="/emploi" className="text-gray-400 hover:text-white">Offres d&apos;emploi</Link>
              </li>
              <li>
                <Link href="/employeurs" className="text-gray-400 hover:text-white">Employeurs</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link>
              </li>
              <li>
                <Link href="/cvtheque" className="text-gray-400 hover:text-white">CVthèque</Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link href="/guides-carriere" className="text-gray-400 hover:text-white">Guides de carrière</Link>
              </li>
              <li>
                <Link href="/conseils-entretien" className="text-gray-400 hover:text-white">Conseils d&apos;entretien</Link>
              </li>
              <li>
                <Link href="/formations" className="text-gray-400 hover:text-white">Formations</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">Nous contacter</Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/conditions-generales" className="text-gray-400 hover:text-white">Conditions générales</Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="text-gray-400 hover:text-white">Politique de confidentialité</Link>
              </li>
              <li>
                <Link href="/politique-cookies" className="text-gray-400 hover:text-white">Politique de cookies</Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-gray-400 hover:text-white">Mentions légales</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p className="mb-2">&copy; {currentYear} JobCallCenter. Tous droits réservés.</p>
          <div className="flex justify-center mt-3">
            <CookieManager />
          </div>
        </div>
      </div>
    </footer>
  )
}
