'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import oauthService from '../../services/oauthService'
import ImageWithFallback from '../../components/ImageWithFallback'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'candidat',
    acceptTerms: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Définir le type de réponse d'authentification
  type AuthResponse = {
    success: boolean;
    user?: {
      role: string;
      _id: string;
      [key: string]: any;
    };
    token?: string;
    needsRoleSelection?: boolean;
    email?: string;
    provider?: string;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      setLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation.')
      setLoading(false)
      return
    }

    try {
      // Préparer les données pour l'API
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.userType === 'candidat' ? 'candidat' : 'employeur'
      }

      // Appeler l'API d'inscription
      const response = await register(userData)

      if (response.success) {
        // Déterminer la redirection en fonction du rôle de l'utilisateur
        const role = response.user?.role;
        if (role === 'candidat') {
          router.push('/dashboard/candidat')
        } else if (role === 'employeur') {
          router.push('/dashboard/employeur')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Initialiser les services OAuth au chargement de la page
  useEffect(() => {
    const initOAuthServices = async () => {
      try {
        // Pré-initialiser les services OAuth pour accélérer l'inscription
        if (typeof window !== 'undefined') {
          await Promise.all([
            oauthService.initGoogleAuth().catch(e => console.log('Google init optional:', e)),
            oauthService.initFacebookAuth().catch(e => console.log('Facebook init optional:', e)),
            oauthService.initLinkedInAuth().catch(e => console.log('LinkedIn init optional:', e))
          ]);
        }
      } catch (error) {
        // Ignorer les erreurs d'initialisation, elles seront gérées lors de l'inscription
        console.log('OAuth init error (non-blocking):', error);
      }
    };

    initOAuthServices();
  }, []);

  const handleSocialRegister = async (provider: string) => {
    setLoading(true)
    setError('')
    try {
      let response: AuthResponse;

      // Utiliser le type d'utilisateur sélectionné dans le formulaire
      const role = formData.userType === 'candidat' ? 'candidat' : 'employeur';

      // Appeler directement les méthodes du service OAuth
      switch (provider) {
        case 'google':
          response = await oauthService.signInWithGoogle(role) as AuthResponse;
          break;
        case 'facebook':
          response = await oauthService.signInWithFacebook(role) as AuthResponse;
          break;
        case 'linkedin':
          response = await oauthService.signInWithLinkedIn(role) as AuthResponse;
          break;
        default:
          throw new Error('Fournisseur non pris en charge');
      }

      // Vérifier si la connexion a réussi
      if (response && response.success) {
        // Ensure token is in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Ensure user is in localStorage
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Déterminer la redirection en fonction du rôle de l'utilisateur
        const userRole = response.user?.role;
        if (userRole === 'candidat') {
          router.push('/dashboard/candidat');
        } else if (userRole === 'employeur') {
          router.push('/dashboard/employeur');
        } else if (userRole === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        throw new Error('Échec de l\'authentification sociale')
      }
    } catch (error: any) {
      console.error('Social registration error:', error);
      setError(error.message || 'Une erreur est survenue avec la connexion sociale. Veuillez réessayer.')
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
            <h2 className="text-3xl font-bold mb-6">Rejoignez TonCallCenter.ma</h2>
            <p className="mb-4">
              Créez votre compte pour accéder à toutes les fonctionnalités de notre plateforme spécialisée dans le recrutement en centre d&apos;appel au Maroc.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Postulez rapidement aux offres d&apos;emploi
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Recevez des alertes personnalisées
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Suivez l&apos;état de vos candidatures
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Registration form */}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Créer un compte</h2>
            <p className="text-gray-700 text-sm">Rejoignez notre plateforme spécialisée dans les centres d&apos;appels</p>
          </div>
          {/* Display errors */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Social registration */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialRegister('google')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              S'inscrire avec Google
            </button>
            <button
              onClick={() => handleSocialRegister('facebook')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.6 18.57C21.16 16.76 22.03 14.47 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
              </svg>
              S'inscrire avec Facebook
            </button>
            <button
              onClick={() => handleSocialRegister('linkedin')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              S'inscrire avec LinkedIn
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou inscrivez-vous avec</span>
              </div>
            </div>

            {/* Registration form */}
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
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
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vous êtes
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`border rounded-md p-4 flex items-center cursor-pointer transition-colors ${formData.userType === 'candidat' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setFormData({ ...formData, userType: 'candidat' })}
                  >
                    <input
                      type="radio"
                      id="userType-candidat"
                      name="userType"
                      value="candidat"
                      checked={formData.userType === 'candidat'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="userType-candidat" className="ml-3 block text-sm font-medium cursor-pointer">
                      <div className="font-medium text-gray-900">Candidat</div>
                      <div className="text-xs text-gray-700">Je cherche un emploi</div>
                    </label>
                  </div>
                  <div
                    className={`border rounded-md p-4 flex items-center cursor-pointer transition-colors ${formData.userType === 'employeur' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setFormData({ ...formData, userType: 'employeur' })}
                  >
                    <input
                      type="radio"
                      id="userType-employeur"
                      name="userType"
                      value="employeur"
                      checked={formData.userType === 'employeur'}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="userType-employeur" className="ml-3 block text-sm font-medium cursor-pointer">
                      <div className="font-medium text-gray-900">Employeur</div>
                      <div className="text-xs text-gray-700">Je recrute</div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                  J'accepte les{' '}
                  <Link href="/conditions-utilisation" className="font-medium text-blue-600 hover:text-blue-500">
                    conditions d'utilisation
                  </Link>{' '}
                  et la{' '}
                  <Link href="/politique-confidentialite" className="font-medium text-blue-600 hover:text-blue-500">
                    politique de confidentialité
                  </Link>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link href="/connexion" className="font-medium text-blue-600 hover:text-blue-500">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
