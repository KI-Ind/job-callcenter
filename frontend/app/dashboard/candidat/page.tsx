'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'
import { interviewsAPI, dashboardAPI } from '../../lib/api'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Define types for our data structures
interface DashboardStats {
  offresConsultees: number
  candidatures: number
  offresSauvegardees: number
  entretiensProgrammes: number
}

interface Company {
  _id?: string
  name: string
  logo?: string
}

interface Job {
  _id: string
  title: string
  company: Company
  location: {
    city: string
    country: string
  }
  type?: string      // Job type from category (Outbound, Inbound, etc.)
  jobType: string    // Contract type (CDI, CDD, etc.)
  salary?: {
    min: number
    max: number
    currency: string
    isDisplayed: boolean
  }
  description?: string
  skills?: string[]
  createdAt: string
}

interface Interview {
  _id: string
  job: {
    _id: string
    title: string
  }
  employer: {
    _id: string
    firstName: string
    lastName: string
    company?: string
  }
  interviewDate: string
  interviewType: string
  interviewLink?: string
  status: string
}

export default function CandidatDashboard() {
  const { user } = useAuth()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    offresConsultees: 0,
    candidatures: 0,
    offresSauvegardees: 0,
    entretiensProgrammes: 0
  })
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([])
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [profileSections, setProfileSections] = useState({
    personalInfo: false,
    professionalExperience: false,
    education: false,
    resume: false
  })
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Fetch dashboard data from API
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Get dashboard stats using dashboardAPI
        const statsResponse = await dashboardAPI.getStats()
        console.log('Dashboard stats in component:', statsResponse)
        
        if (statsResponse && statsResponse.success) {
          // Check if the data is nested under 'data' property or directly in the response
          const statsData = statsResponse.data || statsResponse
          
          setDashboardStats({
            offresConsultees: statsData.viewedJobs || 0,
            candidatures: statsData.applications || 0,
            offresSauvegardees: statsData.savedJobs || 0,
            entretiensProgrammes: statsData.scheduledInterviews || 0
          })
          
          console.log('Set dashboard stats to:', {
            offresConsultees: statsData.viewedJobs || 0,
            candidatures: statsData.applications || 0,
            offresSauvegardees: statsData.savedJobs || 0,
            entretiensProgrammes: statsData.scheduledInterviews || 0
          })
        } else {
          console.error('Failed to get valid stats response:', statsResponse)
        }
        
        // Get upcoming interviews
        try {
          const interviewsResponse = await interviewsAPI.getUpcomingInterviews()
          if (interviewsResponse && interviewsResponse.success) {
            console.log('Upcoming interviews:', interviewsResponse.data)
            if (Array.isArray(interviewsResponse.data)) {
              setUpcomingInterviews(interviewsResponse.data)
            } else {
              console.error('Unexpected interview data format:', interviewsResponse.data)
              setUpcomingInterviews([])
            }
          }
        } catch (error) {
          console.error('Error fetching upcoming interviews:', error)
        }
        
        // Get recent activities
        try {
          const activitiesResponse = await dashboardAPI.getRecentActivities()
          if (activitiesResponse && activitiesResponse.success) {
            setRecentActivities(activitiesResponse.data || [])
            console.log('Recent activities:', activitiesResponse.data)
          }
        } catch (error) {
          console.error('Error fetching recent activities:', error)
        }
        
        // Get recommended jobs
        const recommendedResponse = await api.get('/candidat/jobs/recommended')
        if (recommendedResponse.data && recommendedResponse.data.success) {
          setRecommendedJobs(recommendedResponse.data.data)
        }
        
        // Get profile completion percentage
        const profileResponse = await api.get('/candidat/profile/completion')
        if (profileResponse.data && profileResponse.data.success) {
          setProfileCompletion(profileResponse.data.data.percentage || 0)
          if (profileResponse.data.data.sections) {
            setProfileSections(profileResponse.data.data.sections)
            console.log('Profile sections:', profileResponse.data.data.sections)
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to sample data if API fails
        setDashboardStats({
          offresConsultees: 4,
          candidatures: 1,
          offresSauvegardees: 0,
          entretiensProgrammes: 0
        })
        
        setUpcomingInterviews([
          {
            _id: '1',
            job: {
              _id: '1',
              title: 'Superviseur Centre d\'Appels'
            },
            employer: {
              _id: '1',
              firstName: 'Employeur',
              lastName: 'Test',
              company: 'CallMaster Solutions'
            },
            interviewDate: '2025-05-30T10:00:00',
            interviewType: 'Via Microsoft Teams',
            interviewLink: 'https://teams.microsoft.com/meeting/link',
            status: 'scheduled'
          }
        ])
        
        setProfileCompletion(80)
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {user?.firstName || 'Rizwan'}!</h1>
          <p className="text-gray-600">Voici le récapitulatif de votre activité sur JobCallCenter</p>
        </div>
        <Link href="/dashboard/candidat/recherche" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150">
          Rechercher des emplois
        </Link>
      </div>
          
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-blue-100 p-3 mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Offres consultées</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.offresConsultees}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-purple-100 p-3 mr-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Candidatures</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.candidatures}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-yellow-100 p-3 mr-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Offres sauvegardées</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.offresSauvegardees}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="rounded-full bg-pink-100 p-3 mr-4">
            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-600">Entretiens programmés</p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.entretiensProgrammes}</p>
          </div>
        </div>
      </div>
          
          {/* Profile completion */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Complétion du profil</h2>
              <Link href="/dashboard/candidat/profil" className="text-sm text-blue-600 hover:text-blue-500">
                Compléter mon profil
              </Link>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${profileCompletion}%` }}></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Informations personnelles */}
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${profileSections.personalInfo ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  {profileSections.personalInfo ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-700">Informations personnelles</span>
              </div>
              
              {/* Expérience professionnelle */}
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${profileSections.professionalExperience ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  {profileSections.professionalExperience ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-700">Expérience professionnelle</span>
              </div>
              
              {/* Formation */}
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${profileSections.education ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  {profileSections.education ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-700">Formation</span>
              </div>
              
              {/* CV / Resume */}
              <div className="flex items-center">
                <div className={`flex-shrink-0 h-8 w-8 rounded-full ${profileSections.resume ? 'bg-green-100' : 'bg-gray-100'} flex items-center justify-center`}>
                  {profileSections.resume ? (
                    <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                  )}
                </div>
                <span className="ml-2 text-sm text-gray-700">CV / Resume</span>
              </div>
            </div>
          </div>
          
          {/* Two column layout for recommended jobs and upcoming interviews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recommended jobs */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Offres recommandées pour vous</h2>
                <Link href="/offres-emploi" className="text-sm text-blue-600 hover:text-blue-500">
                  Voir toutes les offres
                </Link>
              </div>
              
              {recommendedJobs.length > 0 ? (
                <div className="space-y-4">
                  {recommendedJobs.map((job) => (
                    <div key={job._id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="p-4">
                        <h3 className="font-medium text-lg text-gray-900">
                          <Link href={`/jobs/${job._id}`} className="hover:text-blue-600">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{job.company.name}</p>
                        
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {job.location.city}, {job.location.country}
                        </div>
                        
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm font-medium text-gray-900">
                            {job.salary ? `${job.salary.min}-${job.salary.max} ${job.salary.currency}` : 'Salaire non spécifié'}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {/* Job type badge (from category) */}
                            {job.type && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {job.type}
                              </span>
                            )}
                            
                            {/* Contract type badge (CDI, CDD, etc.) */}
                            {job.jobType && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {job.jobType}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <Link href={`/jobs/${job._id}`} className="text-sm text-blue-600 hover:text-blue-800">
                            Voir l'offre
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <p className="text-lg">Aucun emploi recommandé.</p>
                  <p className="mt-2">Complétez votre profil pour recevoir des recommandations personnalisées.</p>
                </div>
              )}
            </div>
            
            {/* Upcoming interviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Entretiens à venir</h2>
              </div>
              
              {upcomingInterviews.length > 0 ? (
                <div className="space-y-4">
                  {upcomingInterviews.map(interview => (
                    <div key={interview._id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{interview.job.title}</h3>
                          <p className="text-sm text-gray-600">{interview.employer.company || `${interview.employer.firstName} ${interview.employer.lastName}`}</p>
                          <p className="text-xs text-gray-500 mt-1">{interview.interviewType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{new Date(interview.interviewDate).toLocaleDateString('fr-FR')}</p>
                          <p className="text-xs text-gray-500">{new Date(interview.interviewDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Link href={`/dashboard/candidat/entretiens/${interview._id}`} className="text-sm text-blue-600 hover:text-blue-500">
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-lg">Aucun entretien programmé.</p>
                  <p className="mt-2">Vos futurs entretiens apparaîtront ici.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent activity */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h2>
            <div className="bg-white rounded-lg shadow p-6">
              {recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          {activity.type === 'application' && (
                            <div className="rounded-full bg-purple-100 p-2">
                              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            </div>
                          )}
                          {activity.type === 'view' && (
                            <div className="rounded-full bg-blue-100 p-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                              </svg>
                            </div>
                          )}
                          {activity.type === 'interview' && (
                            <div className="rounded-full bg-pink-100 p-2">
                              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-gray-800">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.date ? format(new Date(activity.date), 'dd MMMM yyyy à HH:mm', { locale: fr }) : 'Date non disponible'}
                          </p>
                          {activity.jobId && (
                            <Link href={`/jobs/${activity.jobId}`} className="text-xs text-blue-600 hover:text-blue-500 mt-1 inline-block">
                              Voir l'offre
                            </Link>
                          )}
                          {activity.type === 'application' && activity.status && (
                            <span className={`text-xs ml-2 px-2 py-1 rounded-full ${activity.status === 'Entretien' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                              {activity.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Aucune activité récente à afficher.</p>
                </div>
              )}
            </div>
          </div>
    </>
  )
}
