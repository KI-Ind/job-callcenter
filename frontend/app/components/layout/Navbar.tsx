'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ImageWithFallback from '../../../components/ImageWithFallback'
import { usePathname } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import NotificationBell from '../../../components/NotificationBell'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  // Check if we're in a dashboard route
  const isInDashboard = pathname?.includes('/dashboard/')

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <ImageWithFallback
              src="/images/JBC-Logo.png"
              alt="TonCallCenter.ma"
              width={120}
              height={120}
              className="h-20 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/emploi"
              className={`font-medium ${isActive('/emploi') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Offres d&apos;emploi
            </Link>
            <Link
              href="/employeurs"
              className={`font-medium ${isActive('/employeurs') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Employeurs
            </Link>
            <Link
              href="/candidats"
              className={`font-medium ${isActive('/candidats') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Candidats
            </Link>
            <Link
              href="/actualites"
              className={`font-medium ${isActive('/actualites') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Actualités
            </Link>
          </div>

          {/* Authentication Links */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notification Bell - only show when not in dashboard */}
                {!isInDashboard && (
                  <div className="mr-2">
                    <NotificationBell />
                  </div>
                )}

                {/* Dashboard Link */}
                <Link
                  href={user?.role === 'employeur' ? '/dashboard/employeur' : '/dashboard/candidat'}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Tableau de bord
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-700 hover:text-blue-600"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/emploi"
                className={`font-medium px-4 py-2 ${isActive('/emploi') ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Offres d&apos;emploi
              </Link>
              <Link
                href="/employeurs"
                className={`font-medium px-4 py-2 ${isActive('/employeurs') ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Employeurs
              </Link>
              <Link
                href="/candidats"
                className={`font-medium px-4 py-2 ${isActive('/candidats') ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Candidats
              </Link>
              <Link
                href="/actualites"
                className={`font-medium px-4 py-2 ${isActive('/actualites') ? 'text-blue-600 bg-blue-50 rounded-md' : 'text-gray-700'}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Actualités
              </Link>

              <div className="border-t border-gray-100 pt-4 px-4 flex space-x-4">
                <Link
                  href="/connexion"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/inscription"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
