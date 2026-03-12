'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../../../contexts/AuthContext'
import api from '../../../../../services/api'
import axios from 'axios'
import { ProfileData } from './interfaces'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData>({ 
    education: [],
    experience: [],
    skills: [],
    languages: [],
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Maroc'
    },
    socialLinks: {
      linkedin: '',
      github: '',
      website: ''
    }
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [cities, setCities] = useState<{_id: string, name: string, postalCode: string, region?: string}[]>([])
  const [isCitiesLoading, setIsCitiesLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSection, setCurrentSection] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Component functions will be added here

  // Render function
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <button 
          onClick={() => {
            // Toggle editing mode
            const newEditingState = !isEditing
            setIsEditing(newEditingState)
            
            // If we're exiting edit mode, clear the current section
            if (!newEditingState) {
              setCurrentSection(null)
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow"
        >
          {isEditing ? 'Annuler' : 'Modifier le profil'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm mb-6 animate-fadeIn" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-sm mb-6 animate-fadeIn" role="alert">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="font-medium">Votre profil a été mis à jour avec succès.</p>
          </div>
        </div>
      )}
      
      {/* Resume Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">CV / Resume</h2>
            {isEditing && !currentSection && (
              <button
                onClick={() => setCurrentSection('resume')}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-200"
              >
                {profileData.resume ? 'Modifier' : 'Ajouter'}
              </button>
            )}
          </div>
        </div>
        <div className="p-6">
          {/* Resume content will be added here */}
        </div>
      </div>
    </div>
  )
}
