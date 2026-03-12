'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '../../../../services/api'

export default function JobSearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [contractType, setContractType] = useState('') // For CDI, CDD, etc.
  const [category, setCategory] = useState('')
  const [jobType, setJobType] = useState('') // For category types like Outbound, Inbound, etc.
  const [experience, setExperience] = useState('')
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [availableTypes, setAvailableTypes] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [savedJobs, setSavedJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])
  const [expandedDescriptions, setExpandedDescriptions] = useState({})

  useEffect(() => {
    // Fetch job categories
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        if (response.data && response.data.success) {
          setCategories(response.data.data)
        }
      } catch (err) {
        console.error('Error fetching job categories:', err)
        // Fallback to categoriesAPI if the direct API call fails
        try {
          const { categoriesAPI } = await import('../../../lib/api')
          const categoriesResponse = await categoriesAPI.getCategories()
          if (categoriesResponse && categoriesResponse.categories) {
            setCategories(categoriesResponse.categories)
          }
        } catch (fallbackErr) {
          console.error('Error fetching categories from fallback:', fallbackErr)
        }
      }
    }

    // Fetch saved jobs
    const fetchSavedJobs = async () => {
      try {
        const response = await api.get('/candidat/jobs/saved')
        if (response.data && response.data.success) {
          setSavedJobs(response.data.data.map(job => job.id))
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err)
      }
    }

    // Fetch user's applications
    const fetchApplications = async () => {
      try {
        const response = await api.get('/candidat/applications')
        if (response.data && response.data.success) {
          // Extract job IDs from applications
          const jobIds = response.data.data.applications.map(app => app.job._id)
          setAppliedJobs(jobIds)
        }
      } catch (err) {
        console.error('Error fetching applications:', err)
      }
    }

    fetchCategories()
    fetchSavedJobs()
    fetchApplications()
    searchJobs() // Initial search with empty parameters
  }, [])
  
  // Fetch available types when category changes
  useEffect(() => {
    if (category) {
      const fetchTypesForCategory = async () => {
        setLoadingTypes(true)
        try {
          // Try direct API call first
          const response = await api.get(`/categories/${category}/types`)
          if (response.data && response.data.success) {
            setAvailableTypes(response.data.data)
          } else {
            // Fallback to categoriesAPI
            try {
              const { categoriesAPI } = await import('../../../lib/api')
              const typesResponse = await categoriesAPI.getCategoryTypes(category)
              if (typesResponse && Array.isArray(typesResponse.types)) {
                setAvailableTypes(typesResponse.types)
              } else {
                setAvailableTypes([])
              }
            } catch (fallbackErr) {
              console.error('Error fetching types from fallback:', fallbackErr)
              setAvailableTypes([])
            }
          }
        } catch (err) {
          console.error('Error fetching types for category:', err)
          setAvailableTypes([])
        } finally {
          setLoadingTypes(false)
        }
      }
      
      fetchTypesForCategory()
    } else {
      // If no category is selected, clear the types
      setAvailableTypes([])
      setJobType('')
    }
  }, [category])

  const searchJobs = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (location) params.append('location', location)
      if (contractType) params.append('jobType', contractType) // Contract type (CDI, CDD, etc.)
      if (jobType) params.append('type', jobType) // Job type from category (Outbound, Inbound, etc.)
      if (category) params.append('category', category)
      if (experience) params.append('experience', experience)
      params.append('page', page.toString())
      
      // Use the correct backend route with query parameters instead of /jobs/search
      // Based on the API mismatch information, the backend uses /jobs with query parameters
      let finalResponse;
      try {
        const response = await api.get(`/jobs?${params.toString()}`)
        if (response.data && response.data.success) {
          finalResponse = response;
        } else {
          // Fallback to /jobs/search if the main endpoint fails
          console.log('Falling back to /jobs/search endpoint')
          const fallbackResponse = await api.get(`/jobs/search?${params.toString()}`)
          if (fallbackResponse.data && fallbackResponse.data.success) {
            finalResponse = fallbackResponse;
          } else {
            finalResponse = response; // Use original response if both fail
          }
        }
      } catch (error) {
        console.error('Error with primary endpoint, trying fallback:', error);
        try {
          const fallbackResponse = await api.get(`/jobs/search?${params.toString()}`)
          finalResponse = fallbackResponse;
        } catch (fallbackError) {
          console.error('Error with fallback endpoint:', fallbackError);
          throw error; // Re-throw the original error if both fail
        }
      }
      
      if (finalResponse.data && finalResponse.data.success) {
        setJobs(finalResponse.data.data.jobs)
        setTotalPages(finalResponse.data.data.totalPages)
        setCurrentPage(page)
      } else {
        setError(finalResponse.data?.message || 'Une erreur est survenue lors de la recherche')
      }
    } catch (err) {
      console.error('Error searching jobs:', err)
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la recherche')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    searchJobs(1) // Reset to first page on new search
  }

  const handleSaveJob = async (jobId) => {
    try {
      if (savedJobs.includes(jobId)) {
        // Unsave job
        await api.delete(`/candidat/jobs/saved/${jobId}`)
        setSavedJobs(savedJobs.filter(id => id !== jobId))
      } else {
        // Save job
        await api.post(`/candidat/jobs/saved/${jobId}`)
        setSavedJobs([...savedJobs, jobId])
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err)
    }
  }
  
  const toggleDescription = (jobId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }))
  }

  const handleApply = (jobId) => {
    router.push(`/dashboard/candidat/candidatures/postuler/${jobId}`)
  }

  const handlePageChange = (page) => {
    searchJobs(page)
  }

  // Track job view when viewing details
  const trackJobView = async (jobId) => {
    try {
      await api.post(`/candidat/jobs/view/${jobId}`)
      // Optionally refresh dashboard stats here if needed
    } catch (err) {
      console.error('Error tracking job view:', err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Recherche d'emploi</h1>
      
      {/* Search form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                Mots-clés
              </label>
              <input
                type="text"
                id="searchQuery"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Titre, compétences ou mots-clés"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Lieu
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ville ou région"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de contrat
              </label>
              <select
                id="contractType"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous les types</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
                <option value="Temps partiel">Temps partiel</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de poste
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!category || loadingTypes}
              >
                <option value="">Tous les types de poste</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {loadingTypes && <p className="text-xs text-gray-500 mt-1">Chargement des types...</p>}
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Expérience
              </label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tous niveaux d'expérience</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Rechercher
            </button>
          </div>
        </form>
      </div>
      
      {/* Search results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Résultats de recherche</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Aucune offre d'emploi ne correspond à vos critères de recherche.
          </div>
        ) : (
          <div>
            <div className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        <a href={`/jobs/${job.id}`} className="hover:text-blue-600">
                          {job.title}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{job.company.name}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        {job.location?.city ? `${job.location.city}${job.location.country ? `, ${job.location.country}` : ''}` : 'Lieu non spécifié'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {/* Display job type from category (if available) */}
                      {job.type && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                          {job.type}
                        </span>
                      )}
                      
                      {/* Display contract type (CDI, CDD, etc.) */}
                      {job.jobType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {job.jobType}
                        </span>
                      )}
                      
                      <span className="text-sm text-gray-500 mt-2">
                        Publié le {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className={`text-sm text-gray-600 ${!expandedDescriptions[job._id] ? 'line-clamp-2' : ''}`}>
                      {job.description}
                    </p>
                    {job.description && job.description.length > 150 && (
                      <button 
                        onClick={() => toggleDescription(job._id)} 
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 focus:outline-none"
                      >
                        {expandedDescriptions[job._id] ? 'Voir moins' : 'Voir plus'}
                      </button>
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {job.skills && job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))}
                      {job.skills && job.skills.length > 3 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveJob(job._id)}
                        className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          savedJobs.includes(job._id) ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-500'
                        }`}
                        title={savedJobs.includes(job._id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <svg className="w-5 h-5" fill={savedJobs.includes(job._id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                      </button>
                      
                      <Link
                        href={`/dashboard/candidat/offre/${job._id}`}
                        className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => trackJobView(job._id)}
                      >
                        Voir détails
                      </Link>
                      
                      {appliedJobs.includes(job._id) ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-md cursor-not-allowed"
                        >
                          Déjà postulé
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(job._id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Postuler
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
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
        )}
      </div>
    </div>
  )
}
