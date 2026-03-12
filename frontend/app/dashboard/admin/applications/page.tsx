'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '../components/AdminLayout'
import { toast } from 'react-hot-toast'
import { adminAPI } from '../../../lib/api'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

interface Job {
  _id: string
  title: string
  company: {
    _id: string
    name: string
  }
}

interface Application {
  _id: string
  job: Job
  candidate: User
  status: string
  coverLetter: string
  resume: string
  createdAt: string
  updatedAt: string
}

export default function AdminApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [processingAppId, setProcessingAppId] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const applicationsPerPage = 10

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est un admin
    const user = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!user || !token) {
      router.push('/admin-login')
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== 'admin') {
      router.push('/connexion')
      return
    }

    // Charger les candidatures
    fetchApplications()
  }, [router])

  useEffect(() => {
    // Filtrer les candidatures en fonction des critères de recherche et de filtre
    let result = applications

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        app =>
          (app.job?.title && app.job.title.toLowerCase().includes(search)) ||
          (app.candidate?.firstName && app.candidate.firstName.toLowerCase().includes(search)) ||
          (app.candidate?.lastName && app.candidate.lastName.toLowerCase().includes(search)) ||
          (app.candidate?.email && app.candidate.email.toLowerCase().includes(search)) ||
          (app.job?.company?.name && app.job.company.name.toLowerCase().includes(search))
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase())
    }

    setFilteredApplications(result)
    setTotalPages(Math.ceil(result.length / applicationsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }, [applications, searchTerm, statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getApplications()
      console.log('Données candidatures reçues:', response)
      
      // Normaliser les données pour gérer différentes structures de réponse
      const applicationsData = response.data || response.applications || response || []
      
      // S'assurer que chaque candidature a les propriétés requises
      const formattedApplicationsData = applicationsData.map((app: any) => ({
        ...app,
        status: app.status || 'pending',
        job: app.job || { title: 'N/A', company: { name: 'N/A' } },
        candidate: app.candidate || app.user || { firstName: 'N/A', lastName: 'N/A', email: 'N/A' }
      }))
      
      setApplications(formattedApplicationsData)
      setFilteredApplications(formattedApplicationsData)
      setTotalPages(Math.ceil(formattedApplicationsData.length / applicationsPerPage))
    } catch (error: any) {
      console.error('Erreur lors du chargement des candidatures:', error)
      setError(error.message || 'Erreur lors du chargement des candidatures')
      toast.error(error.message || 'Erreur lors du chargement des candidatures')
    } finally {
      setLoading(false)
    }
  }

  // Fonction utilitaire pour formater les données d'application
  const formatApplicationData = (data: any) => {
    // Normaliser les données pour gérer différentes structures de réponse
    let applicationsData = data.data || data.applications || data || [];
    
    // S'assurer que chaque candidature a les propriétés requises
    return applicationsData.map((app: any) => ({
      ...app,
      status: app.status || 'pending',
      job: app.job || { title: 'N/A', company: { name: 'N/A' } },
      candidate: app.candidate || app.user || { firstName: 'N/A', lastName: 'N/A', email: 'N/A' }
    }));
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setProcessingAppId(applicationId)
    try {
      const response = await adminAPI.updateApplicationStatus(applicationId, newStatus)
      console.log('Réponse mise à jour statut:', response)
      
      // Mettre à jour la liste des candidatures
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      )
      
      setFilteredApplications(prevApplications => 
        prevApplications.map(app => 
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      )
      
      toast.success(response.message || 'Statut de la candidature mis à jour avec succès')
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.message || 'Erreur lors de la mise à jour du statut')
    } finally {
      setProcessingAppId(null)
    }
  }

  const openApplicationDetails = (application: Application) => {
    setSelectedApplication(application)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedApplication(null)
  }

  // Pagination
  const getCurrentPageApplications = () => {
    const startIndex = (currentPage - 1) * applicationsPerPage
    const endIndex = startIndex + applicationsPerPage
    return filteredApplications.slice(startIndex, endIndex)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  // Fonction pour obtenir la classe de couleur en fonction du statut
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Fonction pour traduire le statut en français
  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'Acceptée'
      case 'rejected':
        return 'Rejetée'
      case 'pending':
        return 'En attente'
      case 'interview':
        return 'Entretien'
      default:
        return status
    }
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Gestion des candidatures</h1>
            <p className="mt-2 text-sm text-gray-700">
              Liste de toutes les candidatures soumises sur la plateforme.
            </p>
          </div>
        </div>
        
        {/* Filtres et recherche */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/2">
            <label htmlFor="search" className="sr-only">Rechercher</label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Rechercher par candidat, entreprise ou poste"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full sm:w-1/4">
            <select
              id="status-filter"
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="interview">Entretien</option>
              <option value="accepted">Acceptée</option>
              <option value="rejected">Rejetée</option>
            </select>
          </div>
          <div className="w-full sm:w-1/4">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
              onClick={fetchApplications}
            >
              Actualiser
            </button>
          </div>
        </div>

        {/* Tableau des candidatures */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                            Candidat
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Poste
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Entreprise
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Statut
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Date de candidature
                          </th>
                          <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {getCurrentPageApplications().map((application) => (
                          <tr key={application._id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {application.candidate?.firstName && application.candidate?.lastName 
                                ? `${application.candidate.firstName} ${application.candidate.lastName}`
                                : application.candidate?.email || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {application.job?.title || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {application.job?.company?.name || 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColorClass(application.status)}`}>
                                {translateStatus(application.status)}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {formatDate(application.createdAt)}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => openApplicationDetails(application)}
                              >
                                Détails
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{(currentPage - 1) * applicationsPerPage + 1}</span> à{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * applicationsPerPage, filteredApplications.length)}
                      </span>{' '}
                      sur <span className="font-medium">{filteredApplications.length}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                      >
                        <span className="sr-only">Précédent</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        // Afficher au maximum 5 pages
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 3 + i;
                          }
                          if (pageNum > totalPages) {
                            pageNum = totalPages - (4 - i);
                          }
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                              pageNum === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50"
                      >
                        <span className="sr-only">Suivant</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de détails de la candidature */}
      {isModalOpen && selectedApplication && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Détails de la candidature
                    </h3>
                    <div className="mt-2 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Candidat</h4>
                        <p className="mt-1">
                          {selectedApplication.candidate?.firstName && selectedApplication.candidate?.lastName 
                            ? `${selectedApplication.candidate.firstName} ${selectedApplication.candidate.lastName}`
                            : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">{selectedApplication.candidate?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Poste</h4>
                        <p className="mt-1">{selectedApplication.job?.title || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Entreprise</h4>
                        <p className="mt-1">{selectedApplication.job?.company?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Statut actuel</h4>
                        <p className="mt-1">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColorClass(selectedApplication.status)}`}>
                            {translateStatus(selectedApplication.status)}
                          </span>
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Date de candidature</h4>
                        <p className="mt-1">{formatDate(selectedApplication.createdAt)}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Lettre de motivation</h4>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 max-h-40 overflow-y-auto">
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {selectedApplication.coverLetter || 'Aucune lettre de motivation fournie'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">CV</h4>
                        <div className="mt-1">
                          {selectedApplication.resume ? (
                            <a 
                              href={selectedApplication.resume} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Voir le CV
                            </a>
                          ) : (
                            <p className="text-sm text-gray-500">Aucun CV fourni</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Modifier le statut</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {['pending', 'interview', 'accepted', 'rejected'].map((status) => (
                            <button
                              key={status}
                              type="button"
                              disabled={selectedApplication.status.toLowerCase() === status || processingAppId === selectedApplication._id}
                              className={`inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded ${
                                selectedApplication.status.toLowerCase() === status
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : `${getStatusColorClass(status)} hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2`
                              }`}
                              onClick={() => updateApplicationStatus(selectedApplication._id, status)}
                            >
                              {processingAppId === selectedApplication._id ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : translateStatus(status)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
