'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

type CookiePreferences = {
  essential: boolean
  functional: boolean
  analytics: boolean
  targeting: boolean
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Essential cookies cannot be disabled
    functional: true,
    analytics: true,
    targeting: true
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consentStatus = localStorage.getItem('cookieConsent')
    if (!consentStatus) {
      // If no choice has been made, show the banner
      setShowBanner(true)
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('cookiePreferences') || '{}')
        setPreferences(prev => ({
          ...prev,
          ...savedPreferences
        }))
      } catch (error) {
        console.error('Error loading cookie preferences:', error)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      targeting: true
    }
    
    setPreferences(allAccepted)
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookiePreferences', JSON.stringify(allAccepted))
    setShowBanner(false)
    
    // Here you would initialize all your cookies/tracking scripts
    console.log('All cookies accepted')
  }

  const handleRejectAll = () => {
    const minimalPreferences = {
      essential: true, // Essential cookies are always enabled
      functional: false,
      analytics: false,
      targeting: false
    }
    
    setPreferences(minimalPreferences)
    localStorage.setItem('cookieConsent', 'rejected')
    localStorage.setItem('cookiePreferences', JSON.stringify(minimalPreferences))
    setShowBanner(false)
    
    // Here you would ensure only essential cookies are active
    console.log('Non-essential cookies rejected')
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', 'customized')
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    setShowBanner(false)
    setShowPreferences(false)
    
    // Here you would initialize cookies based on preferences
    console.log('Custom cookie preferences saved:', preferences)
  }

  const handlePreferenceChange = (cookieType: keyof CookiePreferences) => {
    if (cookieType === 'essential') return // Essential cookies cannot be toggled
    
    setPreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }))
  }

  const openPreferences = () => {
    setShowPreferences(true)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200">
      {!showPreferences ? (
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6 max-w-3xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nous utilisons des cookies</h3>
              <p className="text-gray-600 text-sm">
                Nous utilisons des cookies pour améliorer votre expérience sur notre site, personnaliser le contenu et les publicités, 
                fournir des fonctionnalités de médias sociaux et analyser notre trafic. 
                Consultez notre <Link href="/politique-cookies" className="text-blue-600 hover:underline">politique de cookies</Link> pour plus d'informations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={openPreferences}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Personnaliser
              </button>
              <button 
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Refuser tout
              </button>
              <button 
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Accepter tout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Paramètres des cookies</h3>
          <div className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-800">Cookies essentiels</h4>
                  <p className="text-sm text-gray-600">Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={preferences.essential} 
                    disabled
                    className="sr-only"
                    id="essential-cookies"
                  />
                  <label 
                    htmlFor="essential-cookies"
                    className="flex items-center h-6 w-11 bg-blue-600 rounded-full cursor-not-allowed"
                  >
                    <span className="h-4 w-4 bg-white rounded-full transform translate-x-6 transition"></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-800">Cookies fonctionnels</h4>
                  <p className="text-sm text-gray-600">Permettent de mémoriser vos préférences et d'améliorer votre expérience.</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={preferences.functional} 
                    onChange={() => handlePreferenceChange('functional')}
                    className="sr-only"
                    id="functional-cookies"
                  />
                  <label 
                    htmlFor="functional-cookies"
                    className={`flex items-center h-6 w-11 rounded-full cursor-pointer transition ${
                      preferences.functional ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`h-4 w-4 bg-white rounded-full transform transition ${
                      preferences.functional ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-800">Cookies analytiques</h4>
                  <p className="text-sm text-gray-600">Nous aident à comprendre comment vous utilisez notre site.</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={preferences.analytics} 
                    onChange={() => handlePreferenceChange('analytics')}
                    className="sr-only"
                    id="analytics-cookies"
                  />
                  <label 
                    htmlFor="analytics-cookies"
                    className={`flex items-center h-6 w-11 rounded-full cursor-pointer transition ${
                      preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`h-4 w-4 bg-white rounded-full transform transition ${
                      preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </label>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-800">Cookies de ciblage</h4>
                  <p className="text-sm text-gray-600">Permettent d'afficher des offres d'emploi et publicités pertinentes.</p>
                </div>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={preferences.targeting} 
                    onChange={() => handlePreferenceChange('targeting')}
                    className="sr-only"
                    id="targeting-cookies"
                  />
                  <label 
                    htmlFor="targeting-cookies"
                    className={`flex items-center h-6 w-11 rounded-full cursor-pointer transition ${
                      preferences.targeting ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`h-4 w-4 bg-white rounded-full transform transition ${
                      preferences.targeting ? 'translate-x-6' : 'translate-x-1'
                    }`}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => setShowPreferences(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
            <button 
              onClick={handleSavePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Enregistrer mes préférences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CookieConsent
