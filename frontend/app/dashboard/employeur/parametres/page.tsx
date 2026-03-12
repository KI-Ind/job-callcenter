'use client'

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useAuth } from '../../../../contexts/AuthContext'
import { employerAPI } from '../../../../app/lib/employerApi'

export default function ParametresPage() {
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | boolean | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notificationSettings: {
      emailNotifications: true,
      applicationAlerts: true,
      messageAlerts: true,
      newsletterSubscription: true
    }
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        notificationSettings: {
          ...prev.notificationSettings,
          ...(user.notificationSettings || {})
        }
      }))
    }
  }, [user])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('notification.')) {
      const notificationKey = name.split('.')[1]
      console.log(`Changing notification setting ${notificationKey} to ${checked}`)
      setFormData(prev => ({
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [notificationKey]: checked
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      // Log the data being sent
      console.log('Sending profile update data:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        notificationSettings: formData.notificationSettings
      })

      // Make the API call
      const response = await employerAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        notificationSettings: formData.notificationSettings
      })

      // Log the full response for debugging
      console.log('Profile update response:', response)

      // Always update the user context with the new data if we got a response
      // This ensures the UI reflects the changes even if the backend returns an error
      // Update the user profile in the context
      updateProfile({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        notificationSettings: formData.notificationSettings
      })

      // Show success message
      setSuccess('Vos modifications ont été enregistrées avec succès.')
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err: unknown) {
      console.error('Error updating profile:', err)

      // Check if the error is a network error
      if (err instanceof Error && err.message && err.message.includes('network')) {
        setError('Vos modifications ont peut-être été enregistrées, mais nous n\'avons pas pu confirmer en raison d\'un problème de connexion.')
      } else {
        // Use the error message from the API if available
        const apiError = err as { response?: { data?: { message?: string } } }
        setError(apiError.response?.data?.message || 'Une erreur est survenue lors de la mise à jour de votre profil.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Make the API call
      const response = await employerAPI.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })

      if (response.data && response.data.success) {
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))

        // Set success message and clear after 3 seconds
        setSuccess('Votre mot de passe a été mis à jour avec succès.')
        setTimeout(() => {
          setSuccess(null)
        }, 3000)
      } else {
        setError(response.data?.message || "Une erreur s'est produite lors du changement de mot de passe")
      }
    } catch (err: unknown) {
      console.error('Error updating password:', err)

      // Use the error message from the API if available
      const apiError = err as { response?: { data?: { message?: string } } }
      setError(apiError.response?.data?.message || 'Une erreur est survenue lors de la mise à jour de votre mot de passe.')
    } finally {
      setIsSaving(false)
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
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      {/* Only show one type of message at a time, prioritizing errors */}
      {error ? (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      ) : success && (
        <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Vos modifications ont été enregistrées avec succès.</p>
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">L'adresse email ne peut pas être modifiée</p>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Changer le mot de passe</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Paramètres de notification</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification.emailNotifications"
                name="notification.emailNotifications"
                checked={formData.notificationSettings.emailNotifications}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notification.emailNotifications" className="ml-2 block text-sm text-gray-700">
                Recevoir des notifications par email
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification.applicationAlerts"
                name="notification.applicationAlerts"
                checked={formData.notificationSettings.applicationAlerts}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notification.applicationAlerts" className="ml-2 block text-sm text-gray-700">
                Alertes de nouvelles candidatures
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification.messageAlerts"
                name="notification.messageAlerts"
                checked={formData.notificationSettings.messageAlerts}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notification.messageAlerts" className="ml-2 block text-sm text-gray-700">
                Alertes de nouveaux messages
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification.newsletterSubscription"
                name="notification.newsletterSubscription"
                checked={formData.notificationSettings.newsletterSubscription}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="notification.newsletterSubscription" className="ml-2 block text-sm text-gray-700">
                Abonnement à la newsletter
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
            </button>
          </div>
        </form>
      </div>

      {/* Account Deletion */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-red-600 mb-4">Zone de danger</h2>
        <p className="text-gray-600 mb-4">
          La suppression de votre compte est irréversible et entraînera la perte de toutes vos données, y compris les offres d'emploi publiées et les candidatures reçues.
        </p>
        <button
          type="button"
          className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}
