'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../../contexts/AuthContext'
import employerAPI from '../../../app/lib/employerApi'

// Define interfaces for type safety
interface DashboardStats {
  offresActives: number
  offresBrouillons: number
  candidatures: number
  entretiens: number
}

interface Application {
  id: string
  candidateName: string
  jobTitle: string
  appliedAt: string
  status: string
}

interface Interview {
  id: string
  candidateName: string
  jobTitle: string
  interviewType: string
  interviewDate: string
}

export default function EmployeurDashboard() {
  const { user } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    offresActives: 0,
    offresBrouillons: 0,
    candidatures: 0,
    entretiens: 0
  })
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Get dashboard stats
        const statsResponse = await employerAPI.getDashboardStats()
        if (statsResponse && statsResponse.success) {
          setDashboardStats({
            offresActives: statsResponse.data.activeJobs || 0,
            offresBrouillons: statsResponse.data.draftJobs || 0,
            candidatures: statsResponse.data.applications || 0,
            entretiens: statsResponse.data.interviews || 0
          })
        }
        
        // Get recent applications
        const applicationsResponse = await employerAPI.getRecentApplications()
        if (applicationsResponse && applicationsResponse.success) {
          setRecentApplications(applicationsResponse.data || [])
        }
        
        // Get upcoming interviews
        const interviewsResponse = await employerAPI.getUpcomingInterviews()
        if (interviewsResponse && interviewsResponse.success) {
          setUpcomingInterviews(interviewsResponse.data || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to sample data if API fails
        setDashboardStats({
          offresActives: 0,
          offresBrouillons: 0,
          candidatures: 0,
          entretiens: 0
        })
        // Set empty arrays for applications and interviews
        setRecentApplications([])
        setUpcomingInterviews([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      {/* Header with general stats and company profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* General statistics */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statistiques générales</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{dashboardStats.offresActives}</p>
              <p className="text-sm text-gray-600">Offres actives</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{dashboardStats.offresBrouillons}</p>
              <p className="text-sm text-gray-600">Offres brouillons</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{dashboardStats.candidatures}</p>
              <p className="text-sm text-gray-600">Candidatures</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{dashboardStats.entretiens}</p>
              <p className="text-sm text-gray-600">Entretiens</p>
            </div>
          </div>
        </div>
        
        {/* Company profile */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profil entreprise</h2>
          <div className="w-20 h-20 rounded-full bg-gray-200 mb-3 flex items-center justify-center overflow-hidden">
            {user?.company?.logo ? (
              <Image 
                src={user.company.logo} 
                alt={user?.company?.name || 'Entreprise'} 
                width={80} 
                height={80}
                className="object-cover"
              />
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{user?.company?.name || 'Entreprise'}</h3>
          <p className="text-sm text-gray-600 mb-4">Secteur d'activité</p>
          <Link href="/dashboard/employeur/profil" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center transition duration-150">
            Modifier le profil
          </Link>
        </div>
      </div>
      
      {/* Recent applications and upcoming interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Candidatures récentes</h2>
          
          {recentApplications.length > 0 ? (
            <div>
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 uppercase mb-2">
                <div>Candidat</div>
                <div>Poste</div>
                <div>Date</div>
                <div>Statut</div>
              </div>
              <div className="space-y-2">
                {recentApplications.map(application => (
                  <div key={application.id} className="grid grid-cols-4 gap-2 py-2 border-b border-gray-100 text-sm">
                    <div className="text-gray-900">{application.candidateName}</div>
                    <div className="text-gray-600">{application.jobTitle}</div>
                    <div className="text-gray-500">{new Date(application.appliedAt).toLocaleDateString('fr-FR')}</div>
                    <div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        application.status === 'new' ? 'bg-blue-100 text-blue-800' : 
                        application.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' : 
                        application.status === 'interview' ? 'bg-green-100 text-green-800' : 
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status === 'new' ? 'Nouvelle' : 
                         application.status === 'reviewing' ? 'En cours' : 
                         application.status === 'interview' ? 'Entretien' : 
                         application.status === 'rejected' ? 'Rejetée' : 
                         application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune candidature récente</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link href="/dashboard/employeur/candidatures" className="text-sm text-blue-600 hover:text-blue-500">
              Voir toutes les candidatures →
            </Link>
          </div>
        </div>
        
        {/* Upcoming interviews */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Entretiens à venir</h2>
          
          {upcomingInterviews.length > 0 ? (
            <div className="space-y-4">
              {upcomingInterviews.map(interview => (
                <div key={interview.id} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{interview.candidateName}</h3>
                      <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{interview.interviewType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(interview.interviewDate).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(interview.interviewDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Link href={`/dashboard/employeur/entretiens/${interview.id}`} className="text-sm text-blue-600 hover:text-blue-500">
                      Voir détails
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Aucun entretien planifié</p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link href="/dashboard/employeur/entretiens" className="text-sm text-blue-600 hover:text-blue-500">
              Gérer les entretiens →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/dashboard/employeur/offres/creer" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <span className="text-sm text-gray-700">Publier une offre d'emploi</span>
          </Link>
          
          <Link href="/dashboard/employeur/candidatures" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <span className="text-sm text-gray-700">Consulter les candidatures</span>
          </Link>
          
          <Link href="/dashboard/employeur/entretiens" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-sm text-gray-700">Planifier des entretiens</span>
          </Link>
          
          <Link href="/dashboard/employeur/candidats" className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span className="text-sm text-gray-700">Rechercher des candidats</span>
          </Link>
        </div>
      </div>
      
      {/* Additional actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/employeur/offres" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
          <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <span className="text-gray-700">Gérer mes offres</span>
        </Link>
        
        <Link href="/dashboard/employeur/messages" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
          <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
          <span className="text-gray-700">Messages</span>
        </Link>
        
        <Link href="/dashboard/employeur/parametres" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
          <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          <span className="text-gray-700">Paramètres entreprise</span>
        </Link>
        
        <Link href="/dashboard/employeur/rapports" className="flex items-center p-4 border rounded-lg hover:bg-gray-50 transition duration-150">
          <svg className="w-6 h-6 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span className="text-gray-700">Rapports et statistiques</span>
        </Link>
      </div>
    </>
  )
}
