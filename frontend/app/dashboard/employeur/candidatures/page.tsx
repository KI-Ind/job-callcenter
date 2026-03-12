'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import employerAPI from '../../../../app/lib/employerApi'
import Link from 'next/link'

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  coverLetter?: string;
  resume?: string;
  appliedAt: string;
  lastUpdated?: string;
  expectedSalary?: number;
  availableStartDate?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function CandidaturesPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobFilter, setJobFilter] = useState('')

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', '10')
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      if (jobFilter) {
        params.append('jobId', jobFilter)
      }
      
      // Fetch applications for the employer's jobs using the employerAPI service
      const response = await employerAPI.getApplications({
        page: currentPage,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        jobId: jobFilter !== 'all' ? jobFilter : undefined
      })
      
      console.log('Applications API response:', response);
      
      // Handle different API response formats
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        // Standard format
        setApplications(response.data.data)
        setPagination(response.data.pagination || { page: 1, pages: 1, limit: 10, total: response.data.data.length })
      } else if (Array.isArray(response.data)) {
        // Direct array in data property
        setApplications(response.data)
        setPagination({ page: 1, pages: 1, limit: 10, total: response.data.length })
      } else if (Array.isArray(response)) {
        // Direct array response
        setApplications(response)
        setPagination({ page: 1, pages: 1, limit: 10, total: response.length })
      } else if (response.applications && Array.isArray(response.applications)) {
        // Nested under applications property
        setApplications(response.applications)
        setPagination(response.pagination || { page: 1, pages: 1, limit: 10, total: response.applications.length })
      } else {
        console.error('Unexpected response format:', response)
        setError("Impossible de récupérer les candidatures")
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError("Une erreur s'est produite lors de la récupération des candidatures")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user, currentPage, statusFilter, jobFilter])
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  const handleJobFilterChange = (jobId: string) => {
    setJobFilter(jobId)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Candidatures reçues</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Filter controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Examinée">Examinée</option>
              <option value="Entretien">Entretien</option>
              <option value="Acceptée">Acceptée</option>
              <option value="Rejetée">Rejetée</option>
            </select>
          </div>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Vous n'avez pas encore reçu de candidatures.</p>
          <p className="mt-2 text-gray-600">Les candidatures pour vos offres d'emploi apparaîtront ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidat
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offre d'emploi
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.candidateName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.candidateEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{application.jobTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${application.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 
                        application.status === 'Examinée' ? 'bg-blue-100 text-blue-800' : 
                        application.status === 'Entretien' ? 'bg-purple-100 text-purple-800' : 
                        application.status === 'Acceptée' ? 'bg-green-100 text-green-800' : 
                        application.status === 'Rejetée' ? 'bg-red-100 text-red-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/dashboard/employeur/candidatures/${application.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      Voir détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
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
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
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
                disabled={currentPage === pagination.pages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === pagination.pages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
