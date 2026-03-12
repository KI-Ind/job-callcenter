'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import ImageWithFallback from '../../../components/ImageWithFallback'
import { useAuth } from '../../../contexts/AuthContext'
import NotificationBell from '../../../components/NotificationBell'

export default function CandidatDashboardLayout({
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
      } else if (user?.role !== 'candidat') {
        // Redirect to the appropriate dashboard based on role
        if (user?.role === 'employeur') {
          router.push('/dashboard/employeur')
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
              href="/dashboard/candidat" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Tableau de bord
            </Link>
            
            <Link 
              href="/dashboard/candidat/profil" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat/profil' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Mon Profil
            </Link>
            
            <Link 
              href="/dashboard/candidat/recherche" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat/recherche' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              Recherche d'emploi
            </Link>
            
            <Link 
              href="/dashboard/candidat/candidatures" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat/candidatures' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Mes Candidatures
            </Link>
            
            <Link 
              href="/dashboard/candidat/messages" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat/messages' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              Messages
            </Link>
            
            <Link 
              href="/dashboard/candidat/notifications" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat/notifications' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
              Notifications
            </Link>
            
            <Link 
              href="/dashboard/candidat/parametres" 
              className={`flex items-center px-4 py-3 rounded transition duration-150 ${
                pathname === '/dashboard/candidat/parametres' ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Paramètres
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
            Déconnexion
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
              {pathname === '/dashboard/candidat' && 'Tableau de bord'}
              {pathname === '/dashboard/candidat/profil' && 'Mon Profil'}
              {pathname === '/dashboard/candidat/recherche' && 'Recherche d\'emploi'}
              {pathname === '/dashboard/candidat/candidatures' && 'Mes Candidatures'}
              {pathname === '/dashboard/candidat/messages' && 'Messages'}
              {pathname === '/dashboard/candidat/notifications' && 'Notifications'}
              {pathname === '/dashboard/candidat/parametres' && 'Paramètres'}
              {!pathname?.match(/^\/dashboard\/candidat(\/|$)/) && 'Tableau de bord - Candidat'}
            </h1>
          </div>
          <div className="flex items-center space-x-5">
            <NotificationBell />
            <div className="flex items-center bg-white py-2 px-3 rounded-full shadow-sm border border-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <span className="ml-2 text-gray-700 font-medium">{user?.firstName} {user?.lastName}</span>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
