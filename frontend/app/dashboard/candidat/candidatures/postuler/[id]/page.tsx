'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '../../../../../../services/api'
import { useAuth } from '../../../../../../contexts/AuthContext'

export default function JobApplicationPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    coverLetter: '',
    availableStartDate: '',
    salary: '',
    additionalInfo: '',
    resumeId: ''
  })
  const [userResumes, setUserResumes] = useState([])
  const [validationErrors, setValidationErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch job details
        try {
          const jobResponse = await api.get(`/jobs/${id}`)
          if (jobResponse.data && jobResponse.data.success) {
            setJob(jobResponse.data.data)
          } else {
            setError('Impossible de charger les détails de l\'offre')
            return
          }
        } catch (jobError) {
          console.error('Error fetching job details:', jobError)
          setError('Impossible de charger les détails de l\'offre')
          return
        }
        
        // Fetch user's profile to get resumes
        try {
          // Get user profile which contains resume information
          const profileResponse = await api.get('/users/profile')
          
          if (profileResponse.data && profileResponse.data.success) {
            const userProfile = profileResponse.data.data
            
            // Check if user has resumes in their profile
            let resumes = []
            
            // Handle different possible structures for resumes in the API response
            if (userProfile.resumes && Array.isArray(userProfile.resumes)) {
              resumes = userProfile.resumes
            } else if (userProfile.resume) {
              // Single resume case
              resumes = [userProfile.resume]
            }
            
            setUserResumes(resumes)
            
            // If user has only one resume, select it by default
            if (resumes.length === 1) {
              setFormData(prev => ({
                ...prev,
                resumeId: resumes[0]._id
              }))
            }
          }
        } catch (profileError) {
          console.error('Error fetching user profile:', profileError)
          // Continue even if we can't fetch resumes - user can still apply without a resume
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Une erreur est survenue lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.coverLetter.trim()) {
      errors.coverLetter = 'La lettre de motivation est requise'
    }
    
    if (!formData.resumeId && userResumes.length > 0) {
      errors.resumeId = 'Veuillez sélectionner un CV'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      setSubmitting(true)
      setSubmitError(null)
      
      const applicationData = {
        job: id,
        coverLetter: formData.coverLetter,
        resumeId: formData.resumeId,
        availableStartDate: formData.availableStartDate || null,
        expectedSalary: formData.salary || null,
        additionalInfo: formData.additionalInfo || null
      }
      
      // Use the correct applications endpoint from the backend
      const response = await api.post('/candidat/applications', applicationData)
      
      if (response && response.data && response.data.success) {
        setSubmitSuccess(true)
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/dashboard/candidat/candidatures')
        }, 2000)
      } else {
        setSubmitError((response?.data?.message) || 'Une erreur est survenue lors de l\'envoi de votre candidature')
      }
    } catch (err) {
      console.error('Error submitting application:', err)
      setSubmitError(err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi de votre candidature')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 my-6">
        <p>{error}</p>
        <button 
          onClick={() => router.back()} 
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Retour
        </button>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 my-6">
        <p>Offre d'emploi non trouvée</p>
        <button 
          onClick={() => router.back()} 
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Postuler à l'offre</h1>
      
      {/* Job details summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
            <p className="text-gray-600 mt-1">{job.company?.name}</p>
            <div className="flex items-center text-gray-500 mt-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              {job.location?.city ? `${job.location.city}${job.location.country ? `, ${job.location.country}` : ''}` : 'Lieu non spécifié'}
            </div>
          </div>
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
      </div>
      
      {submitSuccess ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-6 my-6">
          <h2 className="text-lg font-medium">Candidature envoyée avec succès!</h2>
          <p className="mt-2">Votre candidature a été soumise. Vous serez redirigé vers vos candidatures dans quelques instants.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              <p>{submitError}</p>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
              Lettre de motivation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="coverLetter"
              name="coverLetter"
              rows={6}
              value={formData.coverLetter}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${validationErrors.coverLetter ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé par ce poste..."
            ></textarea>
            {validationErrors.coverLetter && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.coverLetter}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="resumeId" className="block text-sm font-medium text-gray-700 mb-1">
              Sélectionnez votre CV <span className="text-red-500">*</span>
            </label>
            {userResumes.length > 0 ? (
              <div className="space-y-3">
                {userResumes.map(resume => (
                  <div key={resume._id} className="flex items-start">
                    <input
                      type="radio"
                      id={`resume-${resume._id}`}
                      name="resumeId"
                      value={resume._id}
                      checked={formData.resumeId === resume._id}
                      onChange={handleChange}
                      className={`mt-1 mr-2 ${validationErrors.resumeId ? 'border-red-500' : ''}`}
                    />
                    <div>
                      <label htmlFor={`resume-${resume._id}`} className="block font-medium text-gray-700 cursor-pointer">
                        {resume.filename || 'CV sans nom'}
                      </label>
                      <p className="text-xs text-gray-500">
                        Ajouté le {new Date(resume.uploadDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {validationErrors.resumeId && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.resumeId}</p>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
                <p>Vous n'avez pas encore ajouté de CV à votre profil.</p>
                <a 
                  href="/dashboard/candidat/profil" 
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                >
                  Ajouter un CV à votre profil
                </a>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="availableStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de disponibilité
              </label>
              <input
                type="date"
                id="availableStartDate"
                name="availableStartDate"
                value={formData.availableStartDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                Prétentions salariales
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: 45000 €/an"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
              Informations complémentaires
            </label>
            <textarea
              id="additionalInfo"
              name="additionalInfo"
              rows={3}
              value={formData.additionalInfo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Toute information supplémentaire que vous souhaitez partager..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi en cours...' : 'Envoyer ma candidature'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
