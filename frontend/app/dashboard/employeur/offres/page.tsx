'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../../contexts/AuthContext'
import employerAPI from '../../../../app/lib/employerApi'

// Define types for job data
type LocationType = {
  city?: string;
  postalCode?: string;
  address?: string;
  country?: string;
}

type SalaryType = {
  min?: number;
  max?: number;
  currency?: string;
  period?: string;
  isDisplayed?: boolean;
}

type JobType = {
  id: string;
  title: string;
  status: string;
  location: LocationType;
  type?: string;      // Job type from category (Outbound, Inbound, etc.)
  jobType: string;    // Contract type (CDI, CDD, etc.)
  salary: SalaryType;
  applicationsCount: number;
  createdAt: string;
  expiresAt?: string;
}

// Job status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    expired: 'bg-red-100 text-red-800',
    closed: 'bg-yellow-100 text-yellow-800'
  }

  const statusLabels: Record<string, string> = {
    active: 'Active',
    draft: 'Brouillon',
    expired: 'Expirée',
    closed: 'Clôturée'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  )
}

export default function EmployeurOffres() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<JobType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOption, setSortOption] = useState('-createdAt')

  useEffect(() => {
    let isMounted = true;
    
    const loadJobs = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching jobs with filters:', {
          page: currentPage,
          limit: 10,
          status: statusFilter,
          sort: sortOption
        });

        const response = await employerAPI.getJobs({
          page: currentPage,
          limit: 10,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          sort: sortOption
        });

        console.log('Jobs API response:', response);

        if (isMounted) {
          let jobsData = [];
          
          // Handle different response structures
          if (response.success && Array.isArray(response.data)) {
            // Standard API response format
            jobsData = response.data || [];
            setTotalPages(response.pagination?.pages || 1);
          } else if (Array.isArray(response)) {
            // Direct array response
            jobsData = response || [];
            setTotalPages(1); // No pagination info in this case
          } else if (response.data && Array.isArray(response.data.jobs)) {
            // Alternative response format
            jobsData = response.data.jobs || [];
            setTotalPages(response.data.pagination?.pages || 1);
          } else if (response.jobs && Array.isArray(response.jobs)) {
            // Another possible format
            jobsData = response.jobs || [];
            setTotalPages(response.pagination?.pages || 1);
          } else {
            console.error('Unexpected response format:', response);
            setError('Impossible de charger les offres d\'emploi');
          }
          
          // Process jobs to ensure status field is correctly set
          const processedJobs = jobsData.map((job: any) => {
            // If the job has isActive field but no status field, derive status from isActive
            if (job.hasOwnProperty('isActive') && !job.status) {
              return {
                ...job,
                status: job.isActive ? 'active' : 'draft'
              };
            }
            // If job has neither status nor isActive, default to active
            if (!job.hasOwnProperty('isActive') && !job.status) {
              return {
                ...job,
                status: 'active'
              };
            }
            return job;
          });
          
          console.log('Processed jobs with correct status:', processedJobs);
          setJobs(processedJobs);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        if (isMounted) {
          setError('Erreur lors du chargement des offres d\'emploi');
          setIsLoading(false);
        }
      }
    };
    
    loadJobs();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [currentPage, statusFilter, sortOption])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Fetching jobs with filters:', {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        sort: sortOption
      })

      const response = await employerAPI.getJobs({
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortOption
      })

      console.log('Jobs API response:', response.data)

      if (response.data && response.data.success) {
        setJobs(response.data.data || [])
        setTotalPages(response.data.pagination?.pages || 1)
      } else {
        setError('Impossible de charger les offres d\'emploi')
      }
    } catch (err) {
      console.error('Error fetching jobs:', err)
      setError('Erreur lors du chargement des offres d\'emploi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre d\'emploi ?')) {
      return
    }

    try {
      // Using the employer API service for job deletion
      const response = await employerAPI.deleteJob(jobId)
      
      if (response.data && response.data.success) {
        // Safely update state using functional update to avoid stale state references
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
      } else {
        setError('Impossible de supprimer l\'offre d\'emploi')
      }
    } catch (err) {
      console.error('Error deleting job:', err)
      setError('Erreur lors de la suppression de l\'offre d\'emploi')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des offres d'emploi</h1>
        <Link 
          href="/dashboard/employeur/offres/nouvelle" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Publier une nouvelle offre
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Tous</option>
              <option value="active">Active</option>
              <option value="draft">Brouillon</option>
              <option value="expired">Expirée</option>
              <option value="closed">Clôturée</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sort-option" className="block text-sm font-medium text-gray-700 mb-1">
              Trier par
            </label>
            <select
              id="sort-option"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="-createdAt">Date de création (récent)</option>
              <option value="createdAt">Date de création (ancien)</option>
              <option value="title">Titre (A-Z)</option>
              <option value="-title">Titre (Z-A)</option>
              <option value="-applicationsCount">Candidatures (décroissant)</option>
              <option value="applicationsCount">Candidatures (croissant)</option>
            </select>
          </div>
        </div>
        
        <div>
          <button
            onClick={() => fetchJobs()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-10 mt-7"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Jobs list */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {jobs.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre d'emploi trouvée</h3>
              <p className="text-gray-500 mb-6">
                Vous n'avez pas encore publié d'offres d'emploi ou aucune offre ne correspond aux filtres sélectionnés.
              </p>
              <Link
                href="/dashboard/employeur/offres/nouvelle"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Publier votre première offre
              </Link>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Titre
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lieu
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type de poste
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type de contrat
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Candidatures
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date de création
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{job.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={job.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {job.location && typeof job.location === 'object' && job.location.city ? job.location.city : 'Non spécifiée'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                {job.type || 'Non spécifié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {job.jobType || 'Non spécifié'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{job.applicationsCount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(job.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <Link
                                href={`/jobs/${job.id}`}
                                target="_blank"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Voir
                              </Link>
                              <Link
                                href={`/dashboard/employeur/offres/edit/${job.id}`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Modifier
                              </Link>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Première
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Précédente
                </button>
                <span className="px-2 py-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Suivante
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border rounded text-sm disabled:opacity-50"
                >
                  Dernière
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}
