'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import api from '../../../../lib/api'
import Breadcrumb from '../../../../components/common/Breadcrumb'
import { FaMapMarkerAlt, FaBuilding, FaClock, FaCalendarAlt, FaMoneyBillWave, FaBriefcase } from 'react-icons/fa'

// Define types for job data
interface Company {
  name: string;
  logo?: string;
}

interface Location {
  city?: string;
  country?: string;
  address?: string;
}

interface Salary {
  min?: number;
  max?: number;
  currency?: string;
  period?: string;
}

interface Job {
  _id: string;
  id?: string;
  title: string;
  company: Company;
  location: Location;
  type?: string;       // Job type from category (Outbound, Inbound, etc.)
  jobType?: string;    // Contract type (CDI, CDD, etc.)
  description: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string[];
  salary?: Salary | number | string;
  applicationDeadline?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function JobDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const jobId = params.id
  
  const [job, setJob] = useState<Job | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  
  // Fetch job details and check if it's saved
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setIsLoading(true)
        
        // Fetch job details using the jobs API module
        let jobData = null
        
        try {
          const jobResponse = await api.jobs.getJob(jobId)
          if (jobResponse && (jobResponse.success || jobResponse._id || jobResponse.id)) {
            jobData = jobResponse.data || jobResponse
          }
        } catch (error) {
          console.error(`Error fetching job ${jobId}:`, error)
        }
        
        if (!jobData) {
          throw new Error('Failed to fetch job details from any endpoint')
        }
        
        setJob(jobData)
        
        // Track job view
        try {
          // Since there's no specific API module for tracking views, use fetchAPI directly
          const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
            const defaultHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
              defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers: {
                ...defaultHeaders,
                ...options.headers,
              },
            });
            
            return res;
          };
          
          // Try primary endpoint
          try {
            await fetchAPI(`/candidat/jobs/view/${jobId}`, { method: 'POST' });
          } catch (viewError) {
            console.error('Error tracking job view with primary endpoint:', viewError);
            // Try fallback endpoint
            try {
              await fetchAPI(`/candidat/dashboard/track-view/${jobId}`, { method: 'POST' });
            } catch (fallbackError) {
              console.error('Error tracking job view with fallback endpoint:', fallbackError);
            }
          }
        } catch (viewError) {
          console.error('Error tracking job view:', viewError);
        }
        
        // Check if job is saved
        try {
          let savedJobs = []
          
          // Use the fetchAPI function directly since there's no specific API for saved jobs
          const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
            const defaultHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
              defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers: {
                ...defaultHeaders,
                ...options.headers,
              },
            });
            
            if (!res.ok) {
              throw new Error(res.statusText);
            }
            
            if (res.status === 204) {
              return null;
            }
            
            return res.json();
          };
          
          try {
            const savedResponse = await fetchAPI('/candidat/jobs/saved')
            if (savedResponse && (savedResponse.success || Array.isArray(savedResponse))) {
              savedJobs = (savedResponse.data || savedResponse).map((job: any) => job.id || job._id || job.jobId)
            }
          } catch (savedError) {
            console.error('Error checking saved status with primary endpoint:', savedError)
            // Try fallback endpoint
            try {
              const fallbackResponse = await fetchAPI('/candidat/saved-jobs')
              if (fallbackResponse) {
                savedJobs = (fallbackResponse.data || fallbackResponse).map((job: any) => job.id || job._id || job.jobId)
              }
            } catch (fallbackError) {
              console.error('Error checking saved status with fallback endpoint:', fallbackError)
            }
          }
          
          setIsSaved(savedJobs.includes(jobId))
        } catch (savedError) {
          console.error('Error checking saved status:', savedError)
        }
        
        // Check if user has applied to this job
        try {
          let applications = []
          
          // Use the fetchAPI function directly
          const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
            const defaultHeaders: Record<string, string> = {
              'Content-Type': 'application/json',
            };
            
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            if (token) {
              defaultHeaders['Authorization'] = `Bearer ${token}`;
            }
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
            const res = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers: {
                ...defaultHeaders,
                ...options.headers,
              },
            });
            
            if (!res.ok) {
              throw new Error(res.statusText);
            }
            
            if (res.status === 204) {
              return null;
            }
            
            return res.json();
          };
          
          try {
            const applicationsResponse = await fetchAPI('/candidat/applications')
            if (applicationsResponse && (applicationsResponse.success || Array.isArray(applicationsResponse))) {
              applications = applicationsResponse.data?.applications || applicationsResponse.applications || applicationsResponse || []
            }
          } catch (appliedError) {
            console.error('Error checking application status with primary endpoint:', appliedError)
            // Try fallback endpoint
            try {
              const fallbackResponse = await fetchAPI('/candidat/job-applications')
              if (fallbackResponse) {
                applications = fallbackResponse.data || fallbackResponse || []
              }
            } catch (fallbackError) {
              console.error('Error checking application status with fallback endpoint:', fallbackError)
            }
          }
          
          setHasApplied(applications.some((app: any) => {
            const appJobId = app.job?._id || app.job?.id || app.jobId
            return appJobId === jobId
          }))
        } catch (appliedError) {
          console.error('Error checking application status:', appliedError)
        }
      } catch (err) {
        console.error('Error fetching job details:', err)
        setError('Une erreur est survenue lors du chargement des détails de cette offre')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (jobId) {
      fetchJobDetails()
    }
  }, [jobId])
  
  // Handle save/unsave job
  const handleSaveJob = async () => {
    try {
      // Use the fetchAPI function directly
      const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
        const defaultHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            ...defaultHeaders,
            ...options.headers,
          },
        });
        
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        
        if (res.status === 204) {
          return null;
        }
        
        return res.json();
      };
      
      if (isSaved) {
        // Unsave job - try multiple endpoints
        try {
          await fetchAPI(`/candidat/jobs/saved/${jobId}`, { method: 'DELETE' })
        } catch (unsaveError) {
          console.error('Error unsaving job with primary endpoint:', unsaveError)
          // Try fallback endpoint
          await fetchAPI(`/candidat/saved-jobs/${jobId}`, { method: 'DELETE' })
        }
        setIsSaved(false)
      } else {
        // Save job - try multiple endpoints
        try {
          await fetchAPI(`/candidat/jobs/saved/${jobId}`, { method: 'POST' })
        } catch (saveError) {
          console.error('Error saving job with primary endpoint:', saveError)
          // Try fallback endpoint
          await fetchAPI(`/candidat/saved-jobs/${jobId}`, { method: 'POST' })
        }
        setIsSaved(true)
      }
      
      // Refresh dashboard stats using fetchAPI
      try {
        const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
          const defaultHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
          }
          
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
              ...defaultHeaders,
              ...options.headers,
            },
          });
          
          return res;
        };
        
        await fetchAPI('/candidat/dashboard/stats');
      } catch (statsError) {
        console.error('Error refreshing dashboard stats:', statsError)
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err)
    }
  }
  
  // Handle apply for job
  const handleApply = () => {
    router.push(`/dashboard/candidat/candidatures/postuler/${jobId}`)
  }
  
  // Format salary for display
  const formatSalary = (salary: Salary | string | number | undefined) => {
    if (!salary) return 'Non spécifié'
    
    if (typeof salary === 'number') {
      return `${salary.toLocaleString('fr-FR')} MAD`
    }
    
    if (typeof salary === 'string') {
      return salary
    }
    
    // Handle salary object
    const { min, max, currency = 'MAD', period = 'mois' } = salary
    
    if (min && max) {
      return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')} ${currency}/${period}`
    } else if (min) {
      return `À partir de ${min.toLocaleString('fr-FR')} ${currency}/${period}`
    } else if (max) {
      return `Jusqu'à ${max.toLocaleString('fr-FR')} ${currency}/${period}`
    }
    
    return 'Non spécifié'
  }
  
  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Non spécifiée'
    
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr })
    } catch (e) {
      return dateString
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !job) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold text-red-600 mb-4">Erreur</h1>
        <p className="text-gray-700">{error || "Impossible de trouver cette offre d'emploi"}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retour
        </button>
      </div>
    )
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 px-4">
        <Breadcrumb items={[
          { label: 'Tableau de bord', href: '/dashboard/candidat' },
          { label: 'Recherche', href: '/dashboard/candidat/recherche' },
          { label: job.title, href: `/dashboard/candidat/offre/${job._id || job.id}` }
        ]} />
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
          {/* Job Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <FaBuilding className="mr-2" />
                  <span>{job.company?.name || 'Entreprise non spécifiée'}</span>
                </div>
                <div className="flex items-center mt-2 text-gray-600">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>
                    {job.location?.city ? 
                      `${job.location.city}${job.location.country ? `, ${job.location.country}` : ''}` : 
                      'Lieu non spécifié'}
                  </span>
                </div>
                <div className="flex items-center mt-2 text-gray-600">
                  <FaBriefcase className="mr-2" />
                  <span>{job.jobType || 'Type de contrat non spécifié'}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                {/* Display job type from category */}
                {job.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-2">
                    Type de poste: {job.type}
                  </span>
                )}
                
                {/* Display contract type */}
                {job.jobType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-2">
                    Type de contrat: {job.jobType}
                  </span>
                )}
                
                <div className="flex items-center text-gray-600">
                  <FaCalendarAlt className="mr-2" />
                  <span>Publié le {formatDate(job.createdAt)}</span>
                </div>
                {job.applicationDeadline && (
                  <div className="flex items-center text-gray-600 mt-1">
                    <FaClock className="mr-2" />
                    <span>Date limite: {formatDate(job.applicationDeadline)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Job Details */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description du poste</h2>
                <div className="prose max-w-none text-gray-700">
                  {(job.description || 'Aucune description disponible').split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              {/* Requirements */}
              {job.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Prérequis</h2>
                  <div className="prose max-w-none text-gray-700">
                    {job.requirements.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsabilités</h2>
                  <div className="prose max-w-none text-gray-700">
                    {job.responsibilities.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Compétences requises</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              {/* Job Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Résumé de l'offre</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type de poste</h3>
                    <p className="mt-1 text-gray-900">{job.type || 'Non spécifié'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type de contrat</h3>
                    <p className="mt-1 text-gray-900">{job.jobType || 'Non spécifié'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                    <p className="mt-1 text-gray-900">
                      {job.location?.city ? 
                        `${job.location.city}${job.location.country ? `, ${job.location.country}` : ''}` : 
                        'Non spécifié'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Salaire</h3>
                    <p className="mt-1 text-gray-900">{formatSalary(job.salary)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date de publication</h3>
                    <p className="mt-1 text-gray-900">{formatDate(job.createdAt)}</p>
                  </div>
                  
                  {job.applicationDeadline && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date limite de candidature</h3>
                      <p className="mt-1 text-gray-900">{formatDate(job.applicationDeadline)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveJob}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isSaved
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-500'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500'
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                  </svg>
                  {isSaved ? 'Retirer des favoris' : 'Sauvegarder l\'offre'}
                </button>
                
                {hasApplied ? (
                  <button
                    disabled
                    className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md cursor-not-allowed"
                  >
                    Vous avez déjà postulé
                  </button>
                ) : (
                  <button
                    onClick={handleApply}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Postuler maintenant
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
