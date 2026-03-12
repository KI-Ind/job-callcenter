'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../../contexts/AuthContext'
import ImageWithFallback from '../../../components/ImageWithFallback'

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      setLoading(false)
      return
    }

    try {
      const response = await resetPassword(params.token, { password })
      
      setSuccess('Votre mot de passe a été réinitialisé avec succès.')
      
      // Auto login and redirect after successful password reset
      setTimeout(() => {
        if (response.user?.role === 'candidat') {
          router.push('/dashboard/candidat')
        } else if (response.user?.role === 'employeur') {
          router.push('/dashboard/employeur')
        } else if (response.user?.role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      }, 2000)
    } catch (error: any) {
      if (error.message === 'Token invalide ou expiré') {
        setTokenValid(false)
      }
      setError(error.message || 'Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Blue background with logo */}
      <div className="bg-blue-600 w-full md:w-1/2 flex flex-col items-center justify-center p-12">
        <div className="max-w-md">
          <Link href="/" className="block mb-8">
            <ImageWithFallback
              src="/images/logo-white.png"
              fallbackSrc="/images/logo-icon.png"
              alt="JobCallCenter.ma"
              width={220}
              height={70}
              className="mx-auto"
            />
          </Link>
          <div className="hidden md:block text-white">
            <h2 className="text-3xl font-bold mb-6">Réinitialisation du mot de passe</h2>
            <p className="mb-4">
              Veuillez choisir un nouveau mot de passe sécurisé pour votre compte.
            </p>
            <p className="mb-4">
              Assurez-vous d'utiliser un mot de passe unique et difficile à deviner.
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <ImageWithFallback
              src="/images/logo-icon.png"
              fallbackSrc="/images/logo.png"
              alt="JobCallCenter Icon"
              width={50}
              height={50}
              className="mx-auto mb-4"
            />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Définir un nouveau mot de passe
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Veuillez entrer et confirmer votre nouveau mot de passe
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{error}</p>
              {!tokenValid && (
                <p className="mt-2">
                  <Link href="/mot-de-passe-oublie" className="font-medium underline">
                    Demander un nouveau lien de réinitialisation
                  </Link>
                </p>
              )}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{success}</p>
            </div>
          )}

          {tokenValid ? (
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Réinitialisation en cours...' : 'Réinitialiser le mot de passe'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="mb-4">Ce lien de réinitialisation est invalide ou a expiré.</p>
              <Link 
                href="/mot-de-passe-oublie" 
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Demander un nouveau lien
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/connexion" className="font-medium text-blue-600 hover:text-blue-500">
              Retour à la page de connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
