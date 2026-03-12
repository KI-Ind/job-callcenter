'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import ImageWithFallback from '../../../components/ImageWithFallback'
import { useAuth } from '../../../contexts/AuthContext'
import NotificationBell from '../../../components/NotificationBell'

export default function EmployeurDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading, logout } = useAuth()

  useEffect(() => {
    // Check if user is authenticated and has the right role
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/connexion')
      } else if (user?.role !== 'employeur') {
        // Redirect to the appropriate dashboard based on role
        if (user?.role === 'candidat') {
          router.push('/dashboard/candidat')
        } else if (user?.role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/')
        }
      }
    }
  }, [isAuthenticated, loading, user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white">
        <div className="p-4">
          <div className="flex items-center mb-8">
            <Link href="/">
              <ImageWithFallback 
                src="/images/JBC-icon.png" 
                alt="JobCallCenter" 
                width={80} 
                height={80} 
                className="mx-auto"
              />
            </Link>
          </div>
          
          <nav className="space-y-2">
            <Link 
              href="/dashboard/employeur" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/employeur' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>Tableau de bord</span>
            </Link>
            
            <Link 
              href="/dashboard/employeur/offres" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/offres') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
              <span>Offres d&apos;emploi</span>
            </Link>
            
            <Link 
              href="/dashboard/employeur/candidatures" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/candidatures') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <span>Candidatures</span>
            </Link>
            
            <Link 
              href="/dashboard/employeur/cvtheque" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/cvtheque') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
              </svg>
              CVthèque
            </Link>
            
            <Link 
              href="/dashboard/employeur/messages" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/messages') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              <span>Messages</span>
            </Link>
            
            <Link 
              href="/dashboard/employeur/profil" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/profil') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span>Profil entreprise</span>
            </Link>
            
            <Link 
              href="/dashboard/employeur/parametres" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/parametres') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span>Paramètres</span>
            </Link>
            
            <Link 
              href="/dashboard/employeur/aide" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname.startsWith('/dashboard/employeur/aide') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Aide et support</span>
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-4">
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-3 hover:bg-blue-700 rounded transition duration-150 w-full"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1">
        {/* Header with notification bell */}
        <div className="bg-blue-50 border-b border-blue-100 p-5 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-1 h-6 bg-blue-600 rounded-full mr-3"></div>
            <h1 className="text-xl font-semibold text-blue-800">
              {pathname === '/dashboard/employeur' && 'Tableau de bord'}
              {pathname === '/dashboard/employeur/offres' && 'Offres d\'emploi'}
              {pathname === '/dashboard/employeur/candidatures' && 'Candidatures'}
              {pathname === '/dashboard/employeur/messages' && 'Messages'}
              {pathname === '/dashboard/employeur/profil' && 'Profil entreprise'}
              {pathname === '/dashboard/employeur/parametres' && 'Paramètres'}
              {pathname === '/dashboard/employeur/aide' && 'Aide et support'}
              {!pathname?.match(/^\/dashboard\/employeur(\/|$)/) && 'Tableau de bord - Employeur'}
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <NotificationBell />
            <div className="flex items-center bg-white py-2 px-3 rounded-full shadow-sm border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                {user?.companyName?.charAt(0) || 'E'}
              </div>
              <span className="ml-2 text-gray-700 font-medium">{user?.companyName || 'Entreprise'}</span>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
