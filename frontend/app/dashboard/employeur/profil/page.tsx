'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '../../../../contexts/AuthContext'
import employerAPI from '../../../../app/lib/employerApi'
import cityService from '../../../../services/cityService'

export default function EmployeurProfile() {
  const { user } = useAuth()
  const [company, setCompany] = useState({
    id: '',
    name: '',
    logo: '',
    industry: '',
    size: '',
    foundingYear: null as number | null,
    website: '',
    description: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Morocco'
    },
    contactEmail: '',
    contactPhone: '',
    socialMedia: {
      linkedin: '',
      facebook: '',
      twitter: ''
    },
    isVerified: false,
    isFeatured: false,
    slug: '',
    adminRoles: {
      isAdmin: false,
      isPrimaryContact: true,
      isProfileVerified: false
    },
    contactPerson: {
      jobTitle: '',
      department: ''
    }
  })
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState<Array<{_id: string, name: string, postalCode: string}>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<{ type: string; content: string } | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching company profile...')
        const response = await employerAPI.getCompanyProfile()
        console.log('Company profile API response:', response)
        
        // Handle different API response formats
        let companyData = null;
        
        if (response.data?.data) {
          // Standard format: { data: { data: {...} } }
          companyData = response.data.data;
          console.log('Found company data in response.data.data');
        } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          // Direct object: { data: {...} }
          companyData = response.data;
          console.log('Found company data in response.data');
        } else if (response.company) {
          // Nested under company: { company: {...} }
          companyData = response.company;
          console.log('Found company data in response.company');
        } else if (typeof response === 'object' && !Array.isArray(response) && (response._id || response.id)) {
          // Direct company object
          companyData = response;
          console.log('Found company data directly in response');
        }
        
        if (companyData) {
          console.log('Setting company data:', companyData);
          
          // Ensure all nested objects exist to prevent undefined errors
          // Make sure contactPerson exists
          if (!companyData.contactPerson) {
            companyData.contactPerson = {
              jobTitle: '',
              department: ''
            };
          }
          
          // Make sure adminRoles exists
          if (!companyData.adminRoles) {
            companyData.adminRoles = {
              isAdmin: false,
              isPrimaryContact: true,
              isProfileVerified: false
            };
          }
          
          // Make sure address exists
          if (!companyData.address) {
            companyData.address = {
              street: '',
              city: '',
              postalCode: '',
              country: 'Morocco'
            };
          }
          
          // Make sure socialMedia exists
          if (!companyData.socialMedia) {
            companyData.socialMedia = {
              linkedin: '',
              facebook: '',
              twitter: ''
            };
          }
          
          setCompany(companyData)
        } else {
          console.error('No company data found in response:', response)
          setMessage({
            type: 'warning',
            content: 'Aucun profil d\'entreprise trouvé. Veuillez compléter votre profil.'
          })
        }
      } catch (error) {
        console.error('Error fetching company profile:', error)
        setMessage({
          type: 'error',
          content: 'Impossible de charger les informations de l\'entreprise'
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories for company profile...')
        // The correct API endpoint path
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories`)
        const data = await response.json()
        console.log('Categories API response:', data)
        
        if (data && data.success) {
          console.log('Categories loaded successfully:', data.data)
          setCategories(data.data)
        } else {
          console.error('Failed to fetch categories:', data)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    const fetchCities = async () => {
      try {
        console.log('Fetching cities for company profile...')
        const response = await cityService.getAllCities()
        console.log('Cities API response:', response)
        
        if (response && response.success) {
          console.log('Cities loaded successfully:', response.data)
          setCities(response.data)
        } else {
          console.error('Failed to fetch cities:', response)
        }
      } catch (error) {
        console.error('Error fetching cities:', error)
        // If API fails, use default cities from the frontend (temporary fallback)
        import('../../../../data/moroccanCities').then(module => {
          const moroccanCities = module.default;
          const formattedCities = moroccanCities.map(city => ({
            _id: city.city,
            name: city.city,
            postalCode: city.postalCode
          }));
          setCities(formattedCities);
          console.log('Using fallback cities data');
        });
      }
    }
    
    fetchCompanyProfile()
    fetchCategories()
    fetchCities()
  }, [])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    // Handle checkbox inputs differently than other inputs
    const inputValue = type === 'checkbox' ? checked : value
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setCompany(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as Record<string, any>),
          [child]: inputValue
        }
      }))
    } else {
      setCompany(prev => ({
        ...prev,
        [name]: inputValue
      }))
    }
  }
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setSelectedFile(file)
    await uploadLogo(file)
  }
  
  const uploadLogo = async (file: File) => {
    try {
      setIsUploading(true)
      setMessage({ type: '', content: '' })
      
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append('companyLogo', file)
      
      console.log('Uploading company logo...');
      // Upload the file
      const response = await employerAPI.uploadCompanyLogo(formData)
      console.log('Logo upload response:', response);
      
      // Handle different API response formats to get the logo URL
      let logoUrl = null;
      
      // First, check for the specific format from our upload controller
      // which returns { success: true, data: { url: '/uploads/filename' } }
      if (response.success && response.data?.url) {
        logoUrl = response.data.url;
      } else if (response.data?.data?.url) {
        // Standard format: { data: { data: { url: '...' } } }
        logoUrl = response.data.data.url;
      } else if (response.data?.url) {
        // Direct URL in data: { data: { url: '...' } }
        logoUrl = response.data.url;
      } else if (response.url) {
        // Direct URL property: { url: '...' }
        logoUrl = response.url;
      } else if (response.data?.logo) {
        // Logo property in data: { data: { logo: '...' } }
        logoUrl = response.data.logo;
      } else if (response.logo) {
        // Direct logo property: { logo: '...' }
        logoUrl = response.logo;
      } else if (response.data?.data?.logo) {
        // Nested logo: { data: { data: { logo: '...' } } }
        logoUrl = response.data.data.logo;
      } else if (typeof response === 'string' && (response.startsWith('/') || response.startsWith('http'))) {
        // Direct URL string response
        logoUrl = response;
      }
      
      if (logoUrl) {
        console.log('Found logo URL:', logoUrl);
        
        // For local development, prepend the backend URL if the URL is relative
        const fullLogoUrl = logoUrl.startsWith('http') 
          ? logoUrl 
          : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${logoUrl}`
        
        console.log('Using full logo URL:', fullLogoUrl);
        
        // Update the company with the new logo URL
        const updateResponse = await employerAPI.updateCompanyProfile({ logo: fullLogoUrl })
        console.log('Logo update in profile response:', updateResponse);
        
        // Check for success in different response formats
        let isSuccess = false;
        
        if (updateResponse.data?.success) {
          isSuccess = true;
        } else if (updateResponse.success) {
          isSuccess = true;
        } else if (updateResponse._id || updateResponse.id || 
                  (updateResponse.data && (updateResponse.data._id || updateResponse.data.id))) {
          isSuccess = true;
        }
        
        if (isSuccess) {
          setCompany(prev => ({
            ...prev,
            logo: fullLogoUrl
          }))
          
          setMessage({
            type: 'success',
            content: 'Logo téléchargé avec succès'
          })
        } else {
          console.error('Failed to update company profile with logo:', updateResponse);
          setMessage({
            type: 'error',
            content: 'Le logo a été téléchargé mais n\'a pas pu être associé au profil'
          })
        }
      } else {
        console.error('No logo URL found in response:', response);
        setMessage({
          type: 'error',
          content: 'Erreur lors du téléchargement du logo: URL introuvable'
        })
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      setMessage({
        type: 'error',
        content: 'Erreur lors du téléchargement du logo'
      })
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', content: '' })
    
    try {
      // Ensure boolean fields are properly set as booleans
      const companyData = {
        ...company,
        isVerified: Boolean(company.isVerified),
        isFeatured: Boolean(company.isFeatured),
        adminRoles: {
          ...company.adminRoles,
          isAdmin: Boolean(company.adminRoles.isAdmin),
          isPrimaryContact: Boolean(company.adminRoles.isPrimaryContact),
          isProfileVerified: Boolean(company.adminRoles.isProfileVerified)
        }
      }
      
      console.log('Updating company profile with data:', companyData);
      const response = await employerAPI.updateCompanyProfile(companyData)
      console.log('Company profile update response:', response);
      
      // Handle different API response formats
      let isSuccess = false;
      let message = '';
      
      if (response.data?.success) {
        // Standard format: { data: { success: true } }
        isSuccess = true;
        message = response.data.message || 'Profil entreprise mis à jour avec succès';
      } else if (response.success) {
        // Direct success property: { success: true }
        isSuccess = true;
        message = response.message || 'Profil entreprise mis à jour avec succès';
      } else if (response._id || response.id || (response.data && (response.data._id || response.data.id))) {
        // MongoDB document returned or nested document
        isSuccess = true;
        message = 'Profil entreprise mis à jour avec succès';
      }
      
      if (isSuccess) {
        setMessage({
          type: 'success',
          content: message
        });
        
        // Refresh company data
        const fetchCompanyProfile = async () => {
          try {
            const refreshResponse = await employerAPI.getCompanyProfile();
            if (refreshResponse.data?.data) {
              setCompany(refreshResponse.data.data);
            } else if (refreshResponse.data) {
              setCompany(refreshResponse.data);
            } else if (typeof refreshResponse === 'object' && !Array.isArray(refreshResponse)) {
              setCompany(refreshResponse);
            }
          } catch (refreshError) {
            console.error('Error refreshing company data:', refreshError);
          }
        };
        
        fetchCompanyProfile();
      } else {
        // Handle error response
        const errorMessage = 
          response.data?.message || 
          response.message || 
          response.error || 
          response.data?.error || 
          'Erreur lors de la mise à jour du profil';
          
        setMessage({
          type: 'error',
          content: errorMessage
        });
      }
    } catch (error) {
      console.error('Error updating company profile:', error)
      setMessage({
        type: 'error',
        content: 'Erreur lors de la mise à jour du profil'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profil entreprise</h1>
      </div>
      
      {message && (
        <div className={`p-4 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <p>{message.content}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 mb-3 flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <Image 
                  src={company.logo} 
                  alt={company.name || 'Company Logo'} 
                  width={128} 
                  height={128}
                  className="object-cover"
                />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              )}
            </div>
            <input
              type="file"
              id="logo-upload"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-500"
              disabled={isUploading}
            >
              {isUploading ? 'Téléchargement...' : 'Changer le logo'}
            </button>
            <p className="text-xs text-gray-500 mt-1">Format recommandé: JPG, PNG. Max 2MB</p>
          </div>
          
          {/* Profile Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <span className="inline-flex items-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Informations du profil
              </span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">Informations sur votre rôle au sein de l'entreprise</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="contactPerson.jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du poste*
                </label>
                <input
                  type="text"
                  id="contactPerson.jobTitle"
                  name="contactPerson.jobTitle"
                  value={company.contactPerson.jobTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Responsable RH"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Votre poste au sein de l'entreprise</p>
              </div>
              
              <div>
                <label htmlFor="contactPerson.department" className="block text-sm font-medium text-gray-700 mb-1">
                  Département
                </label>
                <input
                  type="text"
                  id="contactPerson.department"
                  name="contactPerson.department"
                  value={company.contactPerson.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Ressources Humaines"
                />
                <p className="text-xs text-gray-500 mt-1">Département dont vous faites partie</p>
              </div>
            </div>
            
            {/* Administration */}
            <div className="mb-6">
              <h3 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Administration
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adminRoles.isAdmin"
                    name="adminRoles.isAdmin"
                    checked={company.adminRoles.isAdmin}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adminRoles.isAdmin" className="ml-2 block text-sm text-gray-700">
                    Administrateur de l'entreprise
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adminRoles.isPrimaryContact"
                    name="adminRoles.isPrimaryContact"
                    checked={company.adminRoles.isPrimaryContact}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adminRoles.isPrimaryContact" className="ml-2 block text-sm text-gray-700">
                    Contact principal
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adminRoles.isProfileVerified"
                    name="adminRoles.isProfileVerified"
                    checked={company.adminRoles.isProfileVerified}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="adminRoles.isProfileVerified" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Profil vérifié
                  </label>
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Activé
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">Seul le contact principal peut modifier les informations de l'entreprise. Les options de vérification sont maintenant activées pour tous les utilisateurs.</p>
            </div>
          </div>
          
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={company.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={company.industry}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un secteur</option>
                  {categories.map((category: any) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="foundingYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Année de fondation
                </label>
                <input
                  type="number"
                  id="foundingYear"
                  name="foundingYear"
                  value={company.foundingYear || ''}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 2010"
                />
              </div>
              
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Site web
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={company.website}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description de l'entreprise
            </label>
            <textarea
              id="description"
              name="description"
              value={company.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Décrivez votre entreprise, son activité, sa culture..."
            ></textarea>
          </div>
          
          {/* Address */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Adresse</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                  Rue
                </label>
                <input
                  type="text"
                  id="address.street"
                  name="address.street"
                  value={company.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  id="address.city"
                  name="address.city"
                  value={company.address.city}
                  onChange={(e) => {
                    handleChange(e);
                    // Auto-fill postal code when city is selected
                    const selectedCity = cities.find(city => city.name === e.target.value);
                    if (selectedCity) {
                      setCompany(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          postalCode: selectedCity.postalCode
                        }
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une ville</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <select
                  id="address.postalCode"
                  name="address.postalCode"
                  value={company.address.postalCode}
                  onChange={(e) => {
                    handleChange(e);
                    // Auto-fill city when postal code is selected
                    const selectedCity = cities.find(city => city.postalCode === e.target.value);
                    if (selectedCity) {
                      setCompany(prev => ({
                        ...prev,
                        address: {
                          ...prev.address,
                          city: selectedCity.name
                        }
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un code postal</option>
                  {cities.map((city) => (
                    <option key={city._id + '-postal'} value={city.postalCode}>
                      {city.postalCode} {city.postalCode && `(${city.name})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={company.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contact
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={company.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone de contact
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  value={company.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              <span className="inline-flex items-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Informations supplémentaires
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Verified section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Vérifié</h3>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isVerified"
                    name="isVerified"
                    checked={company.isVerified}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Entreprise vérifiée
                  </label>
                </div>
                <p className="text-xs text-gray-500">Les entreprises vérifiées apparaissent en priorité dans les résultats de recherche</p>
              </div>
              
              {/* Featured section */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Mis en avant</h3>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={company.isFeatured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                    Mettre en avant
                  </label>
                </div>
                <p className="text-xs text-gray-500">Les entreprises mises en avant apparaissent sur la page d'accueil et dans les sections spéciales</p>
              </div>
            </div>
            
            {/* Slug */}
            <div className="mb-6">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={company.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="slug-de-lentreprise"
              />
              <p className="text-xs text-gray-500 mt-1">Slug de l'entreprise</p>
            </div>
          </div>
          
          {/* Social Media */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Réseaux sociaux</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="socialMedia.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="socialMedia.linkedin"
                  name="socialMedia.linkedin"
                  value={company.socialMedia.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="socialMedia.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  type="url"
                  id="socialMedia.facebook"
                  name="socialMedia.facebook"
                  value={company.socialMedia.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  type="url"
                  id="socialMedia.twitter"
                  name="socialMedia.twitter"
                  value={company.socialMedia.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
