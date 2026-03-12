'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import ImageWithFallback from '../../components/ImageWithFallback'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await forgotPassword({ email })
      setSuccess('Un email de réinitialisation a été envoyé à votre adresse email.')

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/connexion')
      }, 3000)
    } catch (error: any) {
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
              src="/images/JBC-icon-white.png"
              fallbackSrc="/images/JBC-Logo.png"
              alt="TonCallCenter.ma"
              width={220}
              height={70}
              className="mx-auto"
            />
          </Link>
          <div className="hidden md:block text-white">
            <h2 className="text-3xl font-bold mb-6">Mot de passe oublié?</h2>
            <p className="mb-4">
              Pas de panique ! Nous allons vous aider à récupérer l&apos;accès à votre compte.
            </p>
            <p className="mb-4">
              Entrez simplement l&apos;adresse email associée à votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <ImageWithFallback
              src="/images/JBC-icon.png"
              fallbackSrc="/images/JBC-Logo.png"
              alt="TonCallCenter Icon"
              width={50}
              height={50}
              className="mx-auto mb-4"
            />
            <h2 className="text-3xl font-extrabold text-gray-900">
              Réinitialisation du mot de passe
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <p>{success}</p>
            </div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </div>
          </form>

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
