'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import employerAPI from '@/app/lib/employerApi'

interface UpdatePayload {
  status: string;
  employerNotes: string;
  interviewDate?: string;
}

interface ApplicationDetails {
  id: string;
  job: {
    id: string;
    title: string;
    location: string | { city: string; country: string };
    salary: string | { min: number; max: number; currency: string; period: string };
    type?: string;      // Job type from category (Outbound, Inbound, etc.)
    jobType: string;    // Contract type (CDI, CDD, etc.)
    description: string;
    requirements: string[];
    company: {
      name: string;
      logo: string;
    } | null;
  };
  candidate: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: string;
  coverLetter?: string;
  resume?: string;
  appliedAt: string;
  lastUpdated: string;
  expectedSalary?: number;
  availableStartDate?: string;
  additionalInfo?: string;
  employerNotes: string;
  interviewDate?: string;
}

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string
  
  const [application, setApplication] = useState<ApplicationDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [interviewDate, setInterviewDate] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Function to fetch application details
  const fetchApplicationDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Refreshing application details for ID:', applicationId);
      const response = await employerAPI.getApplicationById(applicationId);
      
      // Handle different API response formats
      let applicationData = null;
      
      if (response.data?.data) {
        applicationData = response.data.data;
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        applicationData = response.data;
      } else if (response.application) {
        applicationData = response.application;
      } else if (typeof response === 'object' && !Array.isArray(response) && (response._id || response.id)) {
        applicationData = response;
      }
      
      if (applicationData) {
        // Create default values for missing data
        const defaultJob = {
          id: '',
          title: 'Information non disponible',
          location: 'Information non disponible',
          salary: 'Information non disponible',
          jobType: 'Information non disponible',
          description: '',
          requirements: [],
          company: null
        };
        
        const defaultCandidate = {
          id: '',
          name: 'Information non disponible',
          email: '',
          phone: ''
        };
        
        const validatedApplication = {
          id: applicationData._id || applicationData.id || '',
          job: applicationData.job || defaultJob,
          candidate: applicationData.candidate || defaultCandidate,
          status: applicationData.status || 'En attente',
          coverLetter: applicationData.coverLetter || '',
          resume: applicationData.resume || '',
          appliedAt: applicationData.appliedAt || applicationData.createdAt || new Date().toISOString(),
          lastUpdated: applicationData.lastUpdated || applicationData.updatedAt || new Date().toISOString(),
          employerNotes: applicationData.employerNotes || '',
          interviewDate: applicationData.interviewDate || undefined,
          expectedSalary: applicationData.expectedSalary || undefined,
          availableStartDate: applicationData.availableStartDate || undefined,
          additionalInfo: applicationData.additionalInfo || ''
        };
        
        // Handle job data if it's an ID string instead of an object
        if (typeof validatedApplication.job === 'string') {
          validatedApplication.job = {
            id: validatedApplication.job,
            title: 'Information non disponible',
            location: 'Information non disponible',
            salary: 'Information non disponible',
            jobType: 'Information non disponible',
            description: '',
            requirements: [],
            company: null
          };
        }
        
        // Handle candidate data if it's an ID string instead of an object
        if (typeof validatedApplication.candidate === 'string') {
          validatedApplication.candidate = {
            id: validatedApplication.candidate,
            name: 'Information non disponible',
            email: '',
            phone: ''
          };
        }
        
        setApplication(validatedApplication as ApplicationDetails);
        setNotes(validatedApplication.employerNotes || '');
        
        if (validatedApplication.interviewDate) {
          try {
            const date = new Date(validatedApplication.interviewDate);
            setInterviewDate(date.toISOString().split('T')[0]);
          } catch (dateError) {
            console.error('Error parsing interview date:', dateError);
            setInterviewDate('');
          }
        }
      }
    } catch (err) {
      console.error('Error refreshing application details:', err);
      setError('Impossible de charger les détails de la candidature. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]); // Remove application from dependency array to avoid circular dependency
  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (applicationId && isMounted) {
        await fetchApplicationDetails();
      }
    };
    
    loadData();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [applicationId, fetchApplicationDetails])

  const updateApplicationStatus = async (newStatus: string) => {
    try {
      setStatusUpdateLoading(true)
      setError(null)
      setSuccessMessage(null)
      
      const payload: UpdatePayload = {
        status: newStatus,
        employerNotes: notes
      }
      
      // Add interview date if status is 'Entretien' and date is provided
      if (newStatus === 'Entretien' && interviewDate) {
        payload.interviewDate = interviewDate
      }
      
      console.log(`Updating application status to ${newStatus} for ID: ${applicationId}`, payload);
      const response = await employerAPI.updateApplicationStatus(applicationId, payload)
      console.log('Application status update response:', response);
      
      // Handle different API response formats
      let isSuccess = false;
      let updatedData = null;
      
      if (response.data?.success) {
        // Standard format: { data: { success: true } }
        isSuccess = true;
        updatedData = response.data.data;
      } else if (response.success) {
        // Direct success property: { success: true }
        isSuccess = true;
        updatedData = response.data;
      } else if (response._id || response.id || (response.data && (response.data._id || response.data.id))) {
        // MongoDB document returned or nested document
        isSuccess = true;
        updatedData = response.data || response;
      }
      
      if (isSuccess) {
        setSuccessMessage("Statut de la candidature mis à jour avec succès");
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        // Use a single update approach to avoid race conditions
        // Wait a moment before refreshing to allow backend to complete processing
        setTimeout(() => {
          if (applicationId) {
            fetchApplicationDetails();
          }
        }, 1000);
      } else {
        console.error('Failed to update application status:', response);
        setError("Impossible de mettre à jour le statut de la candidature");
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError("Une erreur s'est produite lors de la mise à jour du statut de la candidature");
    } finally {
      setStatusUpdateLoading(false);
    }
  }
  

  const formatLocation = (location: string | { city: string; country: string }) => {
    if (typeof location === 'string') {
      return location
    }
    return `${location.city}, ${location.country}`
  }

  const formatSalary = (salary: string | { min: number; max: number; currency: string; period: string }) => {
    if (typeof salary === 'string') {
      return salary
    }
    return `${salary.min} - ${salary.max} ${salary.currency} / ${salary.period}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <p>{error}</p>
        <button 
          onClick={() => router.push('/dashboard/employeur/candidatures')}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retour aux candidatures
        </button>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4" role="alert">
        <p>Aucune candidature trouvée</p>
        <button 
          onClick={() => router.push('/dashboard/employeur/candidatures')}
          className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Retour aux candidatures
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/dashboard/employeur/candidatures')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Détails de la candidature</h1>
        </div>
        <div className="text-sm text-gray-500">
          Candidature reçue le {new Date(application.appliedAt).toLocaleDateString('fr-FR')}
        </div>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Candidate info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations du candidat</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                  <p className="mt-1 text-base text-gray-900">{application.candidate.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-base text-gray-900">{application.candidate.email}</p>
                </div>
                {application.candidate.phone && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Téléphone</h3>
                    <p className="mt-1 text-base text-gray-900">{application.candidate.phone}</p>
                  </div>
                )}
                {application.expectedSalary && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Salaire attendu</h3>
                    <p className="mt-1 text-base text-gray-900">{application.expectedSalary} DH</p>
                  </div>
                )}
                {application.availableStartDate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Disponibilité</h3>
                    <p className="mt-1 text-base text-gray-900">{new Date(application.availableStartDate).toLocaleDateString('fr-FR')}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Offre d'emploi</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Titre</h3>
                  <p className="mt-1 text-base text-gray-900">{application.job.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lieu</h3>
                  <p className="mt-1 text-base text-gray-900">{formatLocation(application.job.location)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type de poste</h3>
                  <p className="mt-1 text-base text-gray-900">{application.job.type || 'Non spécifié'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Type de contrat</h3>
                  <p className="mt-1 text-base text-gray-900">{application.job.jobType || 'Non spécifié'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Salaire</h3>
                  <p className="mt-1 text-base text-gray-900">{formatSalary(application.job.salary)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Application details and status management */}
        <div className="lg:col-span-2">
          {/* Status section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Statut de la candidature</h2>
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${application.status === 'En attente' ? 'bg-yellow-100 text-yellow-800' : 
                    application.status === 'Examinée' ? 'bg-blue-100 text-blue-800' : 
                    application.status === 'Entretien' ? 'bg-purple-100 text-purple-800' : 
                    application.status === 'Acceptée' ? 'bg-green-100 text-green-800' : 
                    application.status === 'Rejetée' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'}`}
                >
                  {application.status}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  Dernière mise à jour: {new Date(application.lastUpdated).toLocaleDateString('fr-FR')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button 
                  onClick={() => updateApplicationStatus('En attente')}
                  disabled={statusUpdateLoading || application.status === 'En attente'}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    application.status === 'En attente' 
                      ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                  }`}
                >
                  En attente
                </button>
                <button 
                  onClick={() => updateApplicationStatus('Examinée')}
                  disabled={statusUpdateLoading || application.status === 'Examinée'}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    application.status === 'Examinée' 
                      ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  Examinée
                </button>
                <button 
                  onClick={() => updateApplicationStatus('Entretien')}
                  disabled={statusUpdateLoading || application.status === 'Entretien'}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    application.status === 'Entretien' 
                      ? 'bg-purple-100 text-purple-800 cursor-not-allowed' 
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  Entretien
                </button>
                <button 
                  onClick={() => updateApplicationStatus('Acceptée')}
                  disabled={statusUpdateLoading || application.status === 'Acceptée'}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    application.status === 'Acceptée' 
                      ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  Acceptée
                </button>
                <button 
                  onClick={() => updateApplicationStatus('Rejetée')}
                  disabled={statusUpdateLoading || application.status === 'Rejetée'}
                  className={`px-3 py-2 rounded text-sm font-medium ${
                    application.status === 'Rejetée' 
                      ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  Rejetée
                </button>
              </div>
            </div>
            
            {/* Interview date input - only shown when status is 'Entretien' */}
            {(application.status === 'Entretien' || interviewDate) && (
              <div className="mb-6">
                <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'entretien
                </label>
                <input
                  type="date"
                  id="interviewDate"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {interviewDate && application.status === 'Entretien' && (
                  <button
                    onClick={() => updateApplicationStatus('Entretien')}
                    disabled={statusUpdateLoading}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Mettre à jour la date d'entretien
                  </button>
                )}
              </div>
            )}
            
            {/* Notes section */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes de l'employeur
              </label>
              <textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Ajoutez vos notes concernant ce candidat..."
              ></textarea>
              <button
                onClick={() => updateApplicationStatus(application.status)}
                disabled={statusUpdateLoading}
                className="mt-2 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              >
                Enregistrer les notes
              </button>
            </div>
          </div>
          
          {/* Cover letter section */}
          {application.coverLetter && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lettre de motivation</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{application.coverLetter}</p>
              </div>
            </div>
          )}
          
          {/* Resume section */}
          {application.resume && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">CV</h2>
              <a 
                href={application.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Télécharger le CV
              </a>
            </div>
          )}
          
          {/* Additional info section */}
          {application.additionalInfo && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations complémentaires</h2>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{application.additionalInfo}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
