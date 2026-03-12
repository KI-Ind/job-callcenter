'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'

export default function DetailPageFooter() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="inline-block">
              <Image
                src="/images/JBC-Logo.png"
                alt="JobCallCenter.ma"
                width={220}
                height={80}
                className="h-16 w-auto"
              />
            </Link>
          </div>
          
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/" className="text-gray-400 hover:text-white">Accueil</Link>
            <Link href="/emploi" className="text-gray-400 hover:text-white">Offres d&apos;emploi</Link>
            <Link href="/employeurs" className="text-gray-400 hover:text-white">Employeurs</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
          </div>
          
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
        
        <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} JobCallCenter.ma. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
