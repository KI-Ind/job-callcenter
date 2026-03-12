'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { api } from '../../../../services/api'

export default function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Maroc'
    }
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newMessages: true,
    jobRecommendations: true,
    marketingEmails: false
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [notificationSuccess, setNotificationSuccess] = useState(false)
  const [notificationError, setNotificationError] = useState(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch profile data
        const profileResponse = await api.get('/candidat/profile')
        if (profileResponse.data && profileResponse.data.success) {
          const { firstName, lastName, email, phone, address } = profileResponse.data.data
          setProfileData({
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
            phone: phone || '',
            address: address || {
              street: '',
              city: '',
              postalCode: '',
              country: 'Maroc'
            }
          })
        }
        
        // Fetch notification settings
        const notificationResponse = await api.get('/candidat/settings/notifications')
        if (notificationResponse.data && notificationResponse.data.success) {
          setNotificationSettings(notificationResponse.data.data)
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent],
          [child]: value
        }
      })
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      })
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value
    })
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    console.log(`Notification change: ${name} = ${checked}`)
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked
    })
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    
    try {
      setProfileError(null)
      setProfileSuccess(false)
      
      const response = await updateProfile(profileData)
      
      if (response && response.success) {
        setProfileSuccess(true)
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setProfileSuccess(false)
        }, 3000)
      } else {
        setProfileError(response?.message || "Une erreur s'est produite lors de la mise à jour de votre profil")
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setProfileError(err.response?.data?.message || "Une erreur s'est produite lors de la mise à jour de votre profil")
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }
    
    try {
      setPasswordError(null)
      setPasswordSuccess(false)
      
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      if (response.data && response.data.success) {
        setPasswordSuccess(true)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess(false)
        }, 3000)
      } else {
        setPasswordError(response.data?.message || "Une erreur s'est produite lors de la mise à jour de votre mot de passe")
      }
    } catch (err) {
      console.error('Error updating password:', err)
      setPasswordError(err.response?.data?.message || "Une erreur s'est produite lors de la mise à jour de votre mot de passe")
    }
  }

  const handleNotificationUpdate = async (e) => {
    e.preventDefault()
    
    try {
      setNotificationError(null)
      setNotificationSuccess(false)
      
      const response = await api.put('/candidat/settings/notifications', notificationSettings)
      
      if (response.data && response.data.success) {
        setNotificationSuccess(true)
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setNotificationSuccess(false)
        }, 3000)
      } else {
        setNotificationError(response.data?.message || "Une erreur s'est produite lors de la mise à jour de vos préférences de notification")
      }
    } catch (err) {
      console.error('Error updating notification settings:', err)
      setNotificationError(err.response?.data?.message || "Une erreur s'est produite lors de la mise à jour de vos préférences de notification")
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>
      
      {/* Profile Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Informations personnelles</h2>
          <p className="text-sm text-gray-500 mt-1">Mettez à jour vos informations personnelles</p>
        </div>
        
        <div className="p-6">
          {profileSuccess && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p>Vos informations personnelles ont été mises à jour avec succès.</p>
            </div>
          )}
          
          {profileError && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{profileError}</p>
            </div>
          )}
          
          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={profileData.address?.city || ''}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                  Pays
                </label>
                <select
                  id="address.country"
                  name="address.country"
                  value={profileData.address?.country || 'Maroc'}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Maroc">Maroc</option>
                  <option value="Algérie">Algérie</option>
                  <option value="Tunisie">Tunisie</option>
                  <option value="France">France</option>
                  <option value="Canada">Canada</option>
                  <option value="Belgique">Belgique</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Password Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Changer de mot de passe</h2>
          <p className="text-sm text-gray-500 mt-1">Mettez à jour votre mot de passe</p>
        </div>
        
        <div className="p-6">
          {passwordSuccess && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p>Votre mot de passe a été mis à jour avec succès.</p>
            </div>
          )}
          
          {passwordError && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{passwordError}</p>
            </div>
          )}
          
          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Le mot de passe doit contenir au moins 8 caractères.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Notification Settings */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Préférences de notification</h2>
          <p className="text-sm text-gray-500 mt-1">Gérez vos préférences de notification</p>
        </div>
        
        <div className="p-6">
          {notificationSuccess && (
            <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p>Vos préférences de notification ont été mises à jour avec succès.</p>
            </div>
          )}
          
          {notificationError && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{notificationError}</p>
            </div>
          )}
          
          <form onSubmit={handleNotificationUpdate}>
            <div className="space-y-4 mb-6">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="emailNotifications"
                    name="emailNotifications"
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                    Notifications par email
                  </label>
                  <p className="text-gray-500">Recevoir des notifications par email</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="applicationUpdates"
                    name="applicationUpdates"
                    type="checkbox"
                    checked={notificationSettings.applicationUpdates}
                    onChange={handleNotificationChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="applicationUpdates" className="font-medium text-gray-700">
                    Mises à jour des candidatures
                  </label>
                  <p className="text-gray-500">Recevoir des notifications lorsque le statut de vos candidatures change</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="newMessages"
                    name="newMessages"
                    type="checkbox"
                    checked={notificationSettings.newMessages}
                    onChange={handleNotificationChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="newMessages" className="font-medium text-gray-700">
                    Nouveaux messages
                  </label>
                  <p className="text-gray-500">Recevoir des notifications lorsque vous recevez de nouveaux messages</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="jobRecommendations"
                    name="jobRecommendations"
                    type="checkbox"
                    checked={notificationSettings.jobRecommendations}
                    onChange={handleNotificationChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="jobRecommendations" className="font-medium text-gray-700">
                    Recommandations d'emploi
                  </label>
                  <p className="text-gray-500">Recevoir des recommandations d'emploi basées sur votre profil</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="marketingEmails"
                    name="marketingEmails"
                    type="checkbox"
                    checked={notificationSettings.marketingEmails}
                    onChange={handleNotificationChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="marketingEmails" className="font-medium text-gray-700">
                    Emails marketing
                  </label>
                  <p className="text-gray-500">Recevoir des emails marketing et des newsletters</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Enregistrer les préférences
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Account Deletion */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Supprimer le compte</h2>
          <p className="text-sm text-gray-500 mt-1">Supprimer définitivement votre compte</p>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4">
            La suppression de votre compte est définitive et supprimera toutes vos données, y compris votre profil, vos candidatures et vos messages.
          </p>
          
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>
    </div>
  )
}
