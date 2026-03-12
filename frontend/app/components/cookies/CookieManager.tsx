'use client'

import React, { useState, useEffect } from 'react'
import { getCookiePreferences, initializeCookies } from '../../lib/cookieManager'

type CookiePreferences = {
  essential: boolean
  functional: boolean
  analytics: boolean
  targeting: boolean
}

const CookieManager = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    functional: false,
    analytics: false,
    targeting: false
  })

  useEffect(() => {
    // Load saved preferences
    const savedPreferences = getCookiePreferences()
    setPreferences(savedPreferences)
  }, [])

  const handlePreferenceChange = (cookieType: keyof CookiePreferences) => {
    if (cookieType === 'essential') return // Essential cookies cannot be toggled
    
    setPreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }))
  }

  const handleSavePreferences = () => {
    // Save preferences to localStorage
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences))
    localStorage.setItem('cookieConsent', 'customized')
    
    // Initialize cookies based on new preferences
    initializeCookies()
    
    // Close the modal
    setIsOpen(false)
  }

  const openManager = () => {
    setIsOpen(true)
  }

  return (
    <>
      {/* Button to open cookie manager - can be placed in footer or elsewhere */}
      <button 
        onClick={openManager}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Gérer les cookies
      </button>

      {/* Cookie Manager Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Paramètres des cookies
                    </h3>
                    
                    <div className="space-y-4 mt-4">
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
                            id="manager-essential-cookies"
                          />
                          <label 
                            htmlFor="manager-essential-cookies"
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
                            id="manager-functional-cookies"
                          />
                          <label 
                            htmlFor="manager-functional-cookies"
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
                            id="manager-analytics-cookies"
                          />
                          <label 
                            htmlFor="manager-analytics-cookies"
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
                            id="manager-targeting-cookies"
                          />
                          <label 
                            htmlFor="manager-targeting-cookies"
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
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleSavePreferences}
                >
                  Enregistrer
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CookieManager
