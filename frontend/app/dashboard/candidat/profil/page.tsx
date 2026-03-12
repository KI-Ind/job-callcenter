'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import api from '../../../../services/api'

// Simple interfaces for our data types
interface Education {
  degree: string;
  institution: string;
  startYear: string;
  endYear?: string;
  description?: string;
}

interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  current?: boolean;
}

interface Language {
  name: string;
  level: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  description?: string;
}

interface Resume {
  filename: string;
  url: string;
  uploadDate: string;
  fileSize: number;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  socialProfiles?: {
    github?: string;
    facebook?: string;
    linkedin?: string;
  };
  professionalSummary: string;
  summary?: string; // For backward compatibility
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  skills: string[];
  languages: Language[];
  resumes: Resume[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(false);
  const [cities, setCities] = useState<{_id: string, name: string, postalCode: string, region?: string}[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [currentSkill, setCurrentSkill] = useState('');
  
  // Initialize with empty data
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Maroc'
    },
    socialProfiles: {
      github: '',
      facebook: '',
      linkedin: ''
    },
    professionalSummary: '',
    summary: '',
    experiences: [],
    education: [],
    certifications: [],
    skills: [],
    languages: [],
    resumes: []
  });

  // Function to fetch cities
  const fetchCities = async () => {
    try {
      setIsCitiesLoading(true);
      const response = await api.get('/cities');
      
      if (response.data && response.data.success) {
        setCities(response.data.data);
      } else {
        // Fallback data in case the API call fails
        setCities([
          { _id: '1', name: 'Casablanca', postalCode: '20000', region: 'Casablanca-Settat' },
          { _id: '2', name: 'Rabat', postalCode: '10000', region: 'Rabat-Salé-Kénitra' },
          { _id: '3', name: 'Marrakech', postalCode: '40000', region: 'Marrakech-Safi' },
          { _id: '4', name: 'Fès', postalCode: '30000', region: 'Fès-Meknès' },
          { _id: '5', name: 'Tanger', postalCode: '90000', region: 'Tanger-Tétouan-Al Hoceima' },
          { _id: '6', name: 'Agadir', postalCode: '80000', region: 'Souss-Massa' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      // Fallback data in case the API call fails
      setCities([
        { _id: '1', name: 'Casablanca', postalCode: '20000', region: 'Casablanca-Settat' },
        { _id: '2', name: 'Rabat', postalCode: '10000', region: 'Rabat-Salé-Kénitra' },
        { _id: '3', name: 'Marrakech', postalCode: '40000', region: 'Marrakech-Safi' },
        { _id: '4', name: 'Fès', postalCode: '30000', region: 'Fès-Meknès' },
        { _id: '5', name: 'Tanger', postalCode: '90000', region: 'Tanger-Tétouan-Al Hoceima' },
        { _id: '6', name: 'Agadir', postalCode: '80000', region: 'Souss-Massa' }
      ]);
    } finally {
      setIsCitiesLoading(false);
    }
  };

  // Function to fetch city by postal code
  const fetchCityByPostalCode = async (postalCode: string) => {
    try {
      const city = cities.find(c => c.postalCode === postalCode);
      if (city) {
        setProfileData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            city: city.name
          }
        }));
        return;
      }
      
      const response = await api.get(`/cities/${postalCode}`);
      if (response.data && response.data.success) {
        setProfileData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            city: response.data.data.name
          }
        }));
      }
    } catch (err) {
      console.error('Error fetching city by postal code:', err);
    }
  };

  // Fetch profile data function
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      // Fetch user profile data
      const response = await api.get('/users/profile');
      
      if (response.data && response.data.success) {
        const userData = response.data.data;
        console.log('Fetched profile data:', userData);
        
        // Set profile data with user data
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          title: userData.title || '',
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            postalCode: userData.address?.postalCode || '',
            country: userData.address?.country || 'Maroc'
          },
          socialProfiles: {
            github: userData.socialProfiles?.github || '',
            facebook: userData.socialProfiles?.facebook || '',
            linkedin: userData.socialProfiles?.linkedin || ''
          },
          professionalSummary: userData.professionalSummary || userData.summary || '',
          experiences: Array.isArray(userData.experiences) ? userData.experiences : 
                      Array.isArray(userData.experience) ? userData.experience : [],
          education: Array.isArray(userData.education) ? userData.education : [],
          certifications: Array.isArray(userData.certifications) ? userData.certifications : [],
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          languages: Array.isArray(userData.languages) ? userData.languages : [],
          resumes: Array.isArray(userData.resumes) ? userData.resumes : 
                  userData.resume ? [userData.resume] : []
        });
        
        // If we have a postal code, fetch the city data
        if (userData.address?.postalCode) {
          fetchCityByPostalCode(userData.address.postalCode);
        }
      }
    } catch (err) {
      console.error('Error fetching profile data:', err);
      setError('Une erreur est survenue lors du chargement des données du profil.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
    fetchCities();
  }, []);

  // Save profile data to the server
  const saveProfileData = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      
      // Create a copy of the profile data to send to the server
      const dataToSend = {
        ...profileData,
        // Ensure both fields are present for backward compatibility
        summary: profileData.professionalSummary || profileData.summary || '',
        professionalSummary: profileData.professionalSummary || profileData.summary || ''
      };
      
      console.log('Saving profile data:', dataToSend);
      
      // Send the updated profile data to the server
      const response = await api.put('/users/profile', dataToSend);
      
      if (response.data && response.data.success) {
        console.log('Profile data saved successfully:', response.data);
        // Refresh the profile data to ensure we have the latest data
        await fetchProfileData();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        return true;
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la sauvegarde du profil');
      }
    } catch (err: any) {
      console.error('Error saving profile data:', err);
      setError(err.response?.data?.message || err.message || 'Une erreur est survenue lors de la sauvegarde du profil.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      // Save the profile data
      const success = await saveProfileData();
      
      if (success) {
        // Close the active section if save was successful
        setActiveSection(null);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la soumission du formulaire.');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested address fields
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      
      // Special handling for postal code to auto-select city
      if (addressField === 'postalCode') {
        const city = cities.find(c => c.postalCode === value);
        if (city) {
          setProfileData({
            ...profileData,
            address: {
              ...profileData.address,
              postalCode: value,
              city: city.name
            }
          });
        } else {
          setProfileData({
            ...profileData,
            address: {
              ...profileData.address,
              postalCode: value
            }
          });
        }
      } 
      // Special handling for city to auto-select postal code
      else if (addressField === 'city') {
        const city = cities.find(c => c.name === value);
        if (city) {
          setProfileData({
            ...profileData,
            address: {
              ...profileData.address,
              city: value,
              postalCode: city.postalCode
            }
          });
        } else {
          setProfileData({
            ...profileData,
            address: {
              ...profileData.address,
              city: value
            }
          });
        }
      } else {
        setProfileData({
          ...profileData,
          address: {
            ...profileData.address,
            [addressField]: value
          }
        });
      }
    } 
    // Handle nested socialProfiles fields
    else if (name.startsWith('socialProfiles.')) {
      const socialField = name.split('.')[1];
      setProfileData({
        ...profileData,
        socialProfiles: {
          ...profileData.socialProfiles,
          [socialField]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  // Handle file upload for resume
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      
      // Check if user already has 5 resumes
      if (profileData.resumes.length >= 5) {
        setError('Vous ne pouvez pas téléverser plus de 5 CV. Veuillez supprimer un CV existant avant d\'en ajouter un nouveau.');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale: 5MB');
        return;
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('resume', file);
      
      // Upload file - use the correct API endpoint
      const response = await api.post('/upload/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.success) {
        const newResume = {
          filename: file.name,
          fileSize: file.size,
          uploadDate: new Date().toISOString(),
          url: response.data.data.url
        };
        
        // Update profile with the new resume
        const updatedResumes = [...profileData.resumes, newResume];
        
        // Update the profile data locally
        setProfileData({
          ...profileData,
          resumes: updatedResumes
        });
        
        // Update the profile data on the server
        await api.put('/users/profile', { resumes: updatedResumes });
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setActiveSection(null); // Close the resume section after successful upload
      }
    } catch (err: any) {
      console.error('Error uploading resume:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors du téléversement du fichier.');
    }
  };
  
  // Handle resume deletion
  const handleResumeDelete = async (index: number) => {
    try {
      setError('');
      
      // Remove resume from the list
      const updatedResumes = [...profileData.resumes];
      const deletedResume = updatedResumes.splice(index, 1)[0];
      
      // Update local state first for immediate UI feedback
      setProfileData({
        ...profileData,
        resumes: updatedResumes
      });
      
      // Update profile with the new resumes list
      await api.put('/users/profile', { resumes: updatedResumes });
      
      // Optionally, you could also delete the file from storage if needed
      // await api.delete(`/upload/resume/${deletedResume.filename}`);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error deleting resume:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la suppression du CV.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mon Profil</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>Votre profil a été mis à jour avec succès.</p>
        </div>
      )}
      
      <div className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Informations personnelles</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'personal' ? null : 'personal')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'personal' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'personal' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titre professionnel</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={profileData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    id="address.street"
                    name="address.street"
                    value={profileData.address.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                    placeholder="Rue"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                    <select
                      id="address.city"
                      name="address.city"
                      value={profileData.address.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionnez une ville</option>
                      {cities.map(city => (
                        <option key={city._id} value={city.name}>{city.name}</option>
                      ))}
                    </select>
                    {isCitiesLoading && (
                      <div className="mt-1 text-xs text-gray-500">Chargement des villes...</div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                    <select
                      id="address.postalCode"
                      name="address.postalCode"
                      value={profileData.address.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Sélectionnez un code postal</option>
                      {cities.map(city => (
                        <option key={city._id} value={city.postalCode}>{city.postalCode} - {city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                    <select
                      id="address.country"
                      name="address.country"
                      value={profileData.address.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Maroc">Maroc</option>
                      <option value="Algérie">Algérie</option>
                      <option value="Tunisie">Tunisie</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prénom</p>
                    <p className="font-medium">{profileData.firstName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nom</p>
                    <p className="font-medium">{profileData.lastName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profileData.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{profileData.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Titre professionnel</p>
                    <p className="font-medium">{profileData.title || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">
                    {profileData.address.street ? (
                      <>
                        {profileData.address.street}, {profileData.address.postalCode} {profileData.address.city}, {profileData.address.country}
                      </>
                    ) : (
                      '-'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Media Links Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Réseaux sociaux</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'social' ? null : 'social')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'social' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'social' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="socialProfiles.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fab fa-linkedin text-blue-600 mr-2"></i>LinkedIn
                    </label>
                    <input
                      type="url"
                      id="socialProfiles.linkedin"
                      name="socialProfiles.linkedin"
                      value={profileData.socialProfiles?.linkedin || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://linkedin.com/in/votre-profil"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="socialProfiles.facebook" className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fab fa-facebook text-blue-800 mr-2"></i>Facebook
                    </label>
                    <input
                      type="url"
                      id="socialProfiles.facebook"
                      name="socialProfiles.facebook"
                      value={profileData.socialProfiles?.facebook || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://facebook.com/votre-profil"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="socialProfiles.github" className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub
                    </label>
                    <input
                      type="url"
                      id="socialProfiles.github"
                      name="socialProfiles.github"
                      value={profileData.socialProfiles?.github || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="https://github.com/votre-profil"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {profileData.socialProfiles?.linkedin || profileData.socialProfiles?.facebook || profileData.socialProfiles?.github ? (
                  <div className="grid grid-cols-1 gap-3">
                    {profileData.socialProfiles?.linkedin && (
                      <div className="flex items-center">
                        <i className="fab fa-linkedin text-blue-600 text-xl mr-3"></i>
                        <a href={profileData.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profileData.socialProfiles.linkedin}
                        </a>
                      </div>
                    )}
                    
                    {profileData.socialProfiles?.facebook && (
                      <div className="flex items-center">
                        <i className="fab fa-facebook text-blue-800 text-xl mr-3"></i>
                        <a href={profileData.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profileData.socialProfiles.facebook}
                        </a>
                      </div>
                    )}
                    
                    {profileData.socialProfiles?.github && (
                      <div className="flex items-center">
                        <i className="fab fa-github text-gray-800 text-xl mr-3"></i>
                        <a href={profileData.socialProfiles.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profileData.socialProfiles.github}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Aucun réseau social ajouté.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Résumé professionnel</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'summary' ? null : 'summary')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'summary' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'summary' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
                    Résumé professionnel
                  </label>
                  <textarea
                    id="professionalSummary"
                    name="professionalSummary"
                    value={profileData.professionalSummary || profileData.summary || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={6}
                    placeholder="Présentez-vous en quelques lignes. Décrivez votre parcours, vos compétences clés et vos objectifs professionnels."
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {profileData.professionalSummary || profileData.summary ? (
                  <p className="text-gray-700 whitespace-pre-line">{profileData.professionalSummary || profileData.summary}</p>
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucun résumé professionnel ajouté.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Certifications Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Certifications</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'certifications' ? null : 'certifications')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'certifications' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'certifications' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Certification {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedCertifications = profileData.certifications.filter((_, i) => i !== index);
                          setProfileData({...profileData, certifications: updatedCertifications});
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la certification</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => {
                            const updatedCertifications = [...profileData.certifications];
                            updatedCertifications[index].name = e.target.value;
                            setProfileData({...profileData, certifications: updatedCertifications});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: AWS Certified Developer"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organisme émetteur</label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updatedCertifications = [...profileData.certifications];
                            updatedCertifications[index].issuer = e.target.value;
                            setProfileData({...profileData, certifications: updatedCertifications});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Amazon Web Services"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date d'obtention</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => {
                            const updatedCertifications = [...profileData.certifications];
                            updatedCertifications[index].date = e.target.value;
                            setProfileData({...profileData, certifications: updatedCertifications});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Juin 2021"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration (optionnel)</label>
                        <input
                          type="text"
                          value={cert.expiryDate || ''}
                          onChange={(e) => {
                            const updatedCertifications = [...profileData.certifications];
                            updatedCertifications[index].expiryDate = e.target.value;
                            setProfileData({...profileData, certifications: updatedCertifications});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Juin 2024"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                      <textarea
                        value={cert.description || ''}
                        onChange={(e) => {
                          const updatedCertifications = [...profileData.certifications];
                          updatedCertifications[index].description = e.target.value;
                          setProfileData({...profileData, certifications: updatedCertifications});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Décrivez brièvement cette certification et ses compétences associées."
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setProfileData({
                      ...profileData,
                      certifications: [...profileData.certifications, { name: '', issuer: '', date: '' }]
                    });
                  }}
                  className="mt-2 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
                >
                  + Ajouter une certification
                </button>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {profileData.certifications.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.certifications.map((cert, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-lg">{cert.name}</h3>
                        <p className="text-gray-600">{cert.issuer}</p>
                        <p className="text-sm text-gray-500">
                          Obtenue en {cert.date}{cert.expiryDate ? ` • Expire en ${cert.expiryDate}` : ''}
                        </p>
                        {cert.description && <p className="mt-2 text-gray-700">{cert.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucune certification ajoutée.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Resume Section */}
        <section className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">CV / Resume</h2>
            <button
              onClick={() => setActiveSection(activeSection === 'resume' ? null : 'resume')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {activeSection === 'resume' ? 'Annuler' : profileData.resumes.length > 0 ? 'Gérer' : 'Ajouter'}
            </button>
          </div>
          
          {activeSection === 'resume' ? (
            <div className="mt-4">
              <div className="mb-4">
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                  Téléverser votre CV (PDF, DOCX, max 5MB) - {profileData.resumes.length}/5 CV
                </label>
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileUpload}
                  disabled={profileData.resumes.length >= 5}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {profileData.resumes.length >= 5 && (
                  <p className="text-red-500 text-xs mt-1">Vous avez atteint la limite de 5 CV. Supprimez un CV existant avant d\'en ajouter un nouveau.</p>
                )}
              </div>
              {/* List of uploaded resumes */}
              {profileData.resumes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2">CV téléversés</h3>
                  <div className="space-y-3">
                    {profileData.resumes.map((resume, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{resume.filename}</p>
                            <p className="text-xs text-gray-500">
                              Téléversé le {new Date(resume.uploadDate).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <a 
                            href={resume.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Télécharger
                          </a>
                          <button
                            onClick={() => handleResumeDelete(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              {profileData.resumes.length > 0 ? (
                <div className="space-y-3">
                  {profileData.resumes.slice(0, 2).map((resume, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{resume.filename}</p>
                          <p className="text-xs text-gray-500">
                            Téléversé le {new Date(resume.uploadDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <a 
                        href={resume.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Télécharger
                      </a>
                    </div>
                  ))}
                  {profileData.resumes.length > 2 && (
                    <p className="text-sm text-gray-500">
                      +{profileData.resumes.length - 2} autres CV. Cliquez sur "Gérer" pour voir tous vos CV.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">Aucun CV téléversé. Cliquez sur "Ajouter" pour téléverser votre CV.</p>
              )}
            </div>
          )}
        </section>
        
        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Compétences</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'skills' ? null : 'skills')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'skills' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'skills' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Compétences (séparées par des virgules)
                  </label>
                  <div className="mb-2">
                    <div className="relative">
                      <input
                        type="text"
                        id="currentSkill"
                        name="currentSkill"
                        value={currentSkill || ''}
                        onChange={(e) => setCurrentSkill(e.target.value)}
                        onKeyDown={(e) => {
                          // Add skill when Enter or comma is pressed
                          if ((e.key === 'Enter' || e.key === ',') && currentSkill.trim()) {
                            e.preventDefault();
                            if (profileData.skills.length < 10) {
                              const newSkill = currentSkill.trim();
                              if (!profileData.skills.includes(newSkill)) {
                                setProfileData({
                                  ...profileData,
                                  skills: [...profileData.skills, newSkill]
                                });
                                setCurrentSkill('');
                              }
                            }
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Ex: JavaScript, React, Node.js, HTML, CSS"
                        disabled={profileData.skills.length >= 10}
                      />
                      {currentSkill && profileData.skills.length < 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newSkill = currentSkill.trim();
                            if (newSkill && !profileData.skills.includes(newSkill)) {
                              setProfileData({
                                ...profileData,
                                skills: [...profileData.skills, newSkill]
                              });
                              setCurrentSkill('');
                            }
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          Ajouter
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">Ajoutez vos compétences techniques, outils et technologies pour faciliter la correspondance avec les offres d'emploi.</p>
                      <p className={`text-xs font-medium ${profileData.skills.length < 5 ? 'text-red-500' : profileData.skills.length >= 10 ? 'text-green-500' : 'text-blue-500'}`}>
                        {profileData.skills.length}/10 (minimum 5)
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Compétences ajoutées:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <div key={index} className="group flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                          <button 
                            type="button"
                            onClick={() => {
                              const updatedSkills = [...profileData.skills];
                              updatedSkills.splice(index, 1);
                              setProfileData({...profileData, skills: updatedSkills});
                            }}
                            className="ml-1 text-blue-500 hover:text-blue-700 focus:outline-none"
                            disabled={profileData.skills.length <= 5}
                            title={profileData.skills.length <= 5 ? "Minimum 5 compétences requises" : ""}
                          >
                            <svg className={`w-4 h-4 ${profileData.skills.length <= 5 ? 'opacity-50' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {profileData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Aucune compétence ajoutée.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Languages Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Langues</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'languages' ? null : 'languages')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'languages' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'languages' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Langues</p>
                  
                  {profileData.languages.map((language, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={language.name}
                        onChange={(e) => {
                          const updatedLanguages = [...profileData.languages];
                          updatedLanguages[index].name = e.target.value;
                          setProfileData({...profileData, languages: updatedLanguages});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Langue"
                      />
                      <select
                        value={language.level}
                        onChange={(e) => {
                          const updatedLanguages = [...profileData.languages];
                          updatedLanguages[index].level = e.target.value;
                          setProfileData({...profileData, languages: updatedLanguages});
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                        <option value="Courant">Courant</option>
                        <option value="Natif">Natif</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedLanguages = profileData.languages.filter((_, i) => i !== index);
                          setProfileData({...profileData, languages: updatedLanguages});
                        }}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={() => {
                      setProfileData({
                        ...profileData,
                        languages: [...profileData.languages, { name: '', level: 'Intermédiaire' }]
                      });
                    }}
                    className="mt-2 px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
                  >
                    + Ajouter une langue
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {profileData.languages.length > 0 ? (
                  <div className="space-y-2">
                    {profileData.languages.map((language, index) => (
                      <div key={index} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <span className="font-medium">{language.name}</span>
                        <span className="text-sm text-gray-600">{language.level}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">Aucune langue ajoutée.</p>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Expérience professionnelle</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'experience' ? null : 'experience')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'experience' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'experience' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {profileData.experiences.map((exp, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Expérience {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedExperiences = profileData.experiences.filter((_, i) => i !== index);
                          setProfileData({...profileData, experiences: updatedExperiences});
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre du poste</label>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const updatedExperiences = [...profileData.experiences];
                            updatedExperiences[index].title = e.target.value;
                            setProfileData({...profileData, experiences: updatedExperiences});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Développeur Web"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updatedExperiences = [...profileData.experiences];
                            updatedExperiences[index].company = e.target.value;
                            setProfileData({...profileData, experiences: updatedExperiences});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: ABC Technologies"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                      <input
                        type="text"
                        value={exp.location || ''}
                        onChange={(e) => {
                          const updatedExperiences = [...profileData.experiences];
                          updatedExperiences[index].location = e.target.value;
                          setProfileData({...profileData, experiences: updatedExperiences});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Ex: Casablanca, Maroc"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updatedExperiences = [...profileData.experiences];
                            updatedExperiences[index].startDate = e.target.value;
                            setProfileData({...profileData, experiences: updatedExperiences});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Janvier 2020"
                          required
                        />
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700">Date de fin</label>
                          <div className="ml-auto flex items-center">
                            <input
                              type="checkbox"
                              id={`current-${index}`}
                              checked={exp.current || false}
                              onChange={(e) => {
                                const updatedExperiences = [...profileData.experiences];
                                updatedExperiences[index].current = e.target.checked;
                                if (e.target.checked) {
                                  updatedExperiences[index].endDate = '';
                                }
                                setProfileData({...profileData, experiences: updatedExperiences});
                              }}
                              className="mr-2"
                            />
                            <label htmlFor={`current-${index}`} className="text-sm text-gray-600">Poste actuel</label>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => {
                            const updatedExperiences = [...profileData.experiences];
                            updatedExperiences[index].endDate = e.target.value;
                            setProfileData({...profileData, experiences: updatedExperiences});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Mars 2022"
                          disabled={exp.current}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => {
                          const updatedExperiences = [...profileData.experiences];
                          updatedExperiences[index].description = e.target.value;
                          setProfileData({...profileData, experiences: updatedExperiences});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Décrivez vos responsabilités, réalisations, etc."
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setProfileData({
                      ...profileData,
                      experiences: [...profileData.experiences, { title: '', company: '', startDate: '', endDate: '', current: false, description: '' }]
                    });
                  }}
                  className="px-4 py-2 border border-dashed border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 w-full"
                >
                  + Ajouter une expérience
                </button>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {profileData.experiences.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.experiences.map((exp, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-lg">{exp.title}</h3>
                        <p className="text-gray-600">{exp.company}{exp.location ? ` - ${exp.location}` : ''}</p>
                        <p className="text-sm text-gray-500">
                          {exp.startDate} - {exp.current ? 'Présent' : (exp.endDate || '')}
                        </p>
                        {exp.description && <p className="mt-2 text-gray-700">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucune expérience professionnelle ajoutée.</p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Education Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Formation</h2>
            <button 
              onClick={() => setActiveSection(activeSection === 'education' ? null : 'education')}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100"
            >
              {activeSection === 'education' ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          
          <div className="p-6">
            {activeSection === 'education' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {profileData.education.map((edu, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Formation {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedEducation = profileData.education.filter((_, i) => i !== index);
                          setProfileData({...profileData, education: updatedEducation});
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'éducation</label>
                        <select
                          value={edu.degree}
                          onChange={(e) => {
                            const updatedEducation = [...profileData.education];
                            updatedEducation[index].degree = e.target.value;
                            setProfileData({...profileData, education: updatedEducation});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Sélectionnez un niveau</option>
                          <option value="Baccalauréat">Baccalauréat</option>
                          <option value="Bac+2 / DUT / BTS">Bac+2 / DUT / BTS</option>
                          <option value="Bac+3 / Licence">Bac+3 / Licence</option>
                          <option value="Bac+5 / Master">Bac+5 / Master</option>
                          <option value="Doctorat">Doctorat</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Établissement</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const updatedEducation = [...profileData.education];
                            updatedEducation[index].institution = e.target.value;
                            setProfileData({...profileData, education: updatedEducation});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: Université Mohammed V"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Année de début</label>
                        <input
                          type="text"
                          value={edu.startYear}
                          onChange={(e) => {
                            const updatedEducation = [...profileData.education];
                            updatedEducation[index].startYear = e.target.value;
                            setProfileData({...profileData, education: updatedEducation});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: 2018"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Année de fin (ou prévue)</label>
                        <input
                          type="text"
                          value={edu.endYear || ''}
                          onChange={(e) => {
                            const updatedEducation = [...profileData.education];
                            updatedEducation[index].endYear = e.target.value;
                            setProfileData({...profileData, education: updatedEducation});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ex: 2022 (ou 'En cours')"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => {
                          const updatedEducation = [...profileData.education];
                          updatedEducation[index].description = e.target.value;
                          setProfileData({...profileData, education: updatedEducation});
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                        placeholder="Décrivez votre formation, vos spécialisations, etc."
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setProfileData({
                      ...profileData,
                      education: [...profileData.education, { degree: '', institution: '', startYear: '', endYear: '' }]
                    });
                  }}
                  className="px-4 py-2 border border-dashed border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 w-full"
                >
                  + Ajouter une formation
                </button>
                
                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {profileData.education.length > 0 ? (
                  <div className="space-y-6">
                    {profileData.education.map((edu, index) => (
                      <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-lg">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.startYear} - {edu.endYear || 'Présent'}
                        </p>
                        {edu.description && <p className="mt-2 text-gray-700">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">Aucune formation ajoutée.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
