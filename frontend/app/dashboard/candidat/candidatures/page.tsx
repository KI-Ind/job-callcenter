'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import api from '../../../../services/api'

// Define application type
interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    location: string | {
      city: string;
      country: string;
    };
    jobType: string;
    company: {
      name: string;
      logo?: string;
    };
  };
  status: string;
  coverLetter?: string;
  createdAt: string;
  lastUpdate?: string;
}

interface StatusCounts {
  total: number;
  'En attente': number;
  'Examinée': number;
  'Entretien': number;
  'Acceptée': number;
  'Rejetée': number;
  [key: string]: number;
}

export default function CandidaturesPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    total: 0,
    'En attente': 0,
    'Examinée': 0,
    'Entretien': 0,
    'Acceptée': 0,
    'Rejetée': 0
  })

  useEffect(() => {
    fetchApplications()
  }, [currentFilter, currentPage])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (currentFilter !== 'all') {
        // Convert frontend filter values to backend status values
        const backendStatus = getStatusFilterValue(currentFilter)
        params.append('status', backendStatus)
      }
      params.append('page', currentPage.toString())
      
      const response = await api.get(`/candidat/applications?${params.toString()}`)
      
      if (response.data && response.data.success) {
        setApplications(response.data.data.applications)
        setTotalPages(response.data.data.totalPages || 1)
        if (response.data.data.counts) {
          setStatusCounts(response.data.data.counts)
        }
      } else {
        setError(response.data?.message || 'Une erreur est survenue lors de la récupération de vos candidatures')
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err)
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la récupération de vos candidatures')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  // Map frontend filter values to backend status values
  const getStatusFilterValue = (filter: string) => {
    switch (filter) {
      case 'pending': return 'En attente'
      case 'reviewing': return 'Examinée'
      case 'interview': return 'Entretien'
      case 'accepted': return 'Acceptée'
      case 'rejected': return 'Rejetée'
      default: return filter
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            En attente
          </span>
        )
      case 'Examinée':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            En cours d'examen
          </span>
        )
      case 'Entretien':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Entretien
          </span>
        )
      case 'Acceptée':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Acceptée
          </span>
        )
      case 'Rejetée':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Refusée
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Candidatures</h1>
      
      {/* Status counts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-700">{statusCounts.total}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">{statusCounts['En attente']}</div>
          <div className="text-sm text-yellow-600">En attente</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{statusCounts['Examinée']}</div>
          <div className="text-sm text-blue-600">En cours d'examen</div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-700">{statusCounts['Entretien']}</div>
          <div className="text-sm text-purple-600">Entretien</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{statusCounts['Acceptée']}</div>
          <div className="text-sm text-green-600">Acceptées</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{statusCounts['Rejetée']}</div>
          <div className="text-sm text-red-600">Refusées</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleFilterChange('all')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              currentFilter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              currentFilter === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => handleFilterChange('reviewing')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              currentFilter === 'reviewing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            En cours d'examen
          </button>
          <button
            onClick={() => handleFilterChange('interview')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              currentFilter === 'interview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Entretien
          </button>
          <button
            onClick={() => handleFilterChange('accepted')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              currentFilter === 'accepted'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Acceptées
          </button>
          <button
            onClick={() => handleFilterChange('rejected')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              currentFilter === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Refusées
          </button>
        </nav>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {isLoading ? (
          <div className="p-6 text-center">
            <svg className="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Chargement des candidatures...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="text-red-500 mb-2">
              <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Aucune candidature trouvée.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application._id}>
                <Link href={`/dashboard/candidat/candidatures/${application._id}`}>
                  <div className="block hover:bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-gray-900 truncate">
                          {application.job.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {application.job.company.name}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {typeof application.job.location === 'object' ? 
                            `${application.job.location.city}, ${application.job.location.country}` : 
                            application.job.location}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(application.status)}
                        <span className="text-sm text-gray-500 mt-2">
                          Postulé le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {application.coverLetter ? application.coverLetter.substring(0, 150) + '...' : 'Pas de lettre de motivation'}
                      </p>
                    </div>
                    
                    {application.lastUpdate && (
                      <div className="mt-4 text-sm text-gray-500">
                        <span className="font-medium">Dernière mise à jour:</span> {new Date(application.lastUpdate).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        
        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Précédent
            </button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
