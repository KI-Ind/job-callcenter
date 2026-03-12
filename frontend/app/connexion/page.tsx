'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageWithFallback from '../../components/ImageWithFallback'
import { useAuth } from '../../contexts/AuthContext'
import oauthService from '../../services/oauthService'
import RoleSelectionModal from '../../components/RoleSelectionModal'

// Define types for auth responses
interface AuthResponse {
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
}

// Define OAuth service response types
interface OAuthResponse {
  success?: boolean;
  user?: {
    role: string;
    _id: string;
    [key: string]: any;
  };
  token?: string;
  needsRoleSelection?: boolean;
  email?: string;
  provider?: string;
}

export default function LoginPage() {
  const router = useRouter()
  const { login, googleLogin, facebookLogin, linkedinLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthInitialized, setOauthInitialized] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [socialLoginData, setSocialLoginData] = useState<{ email: string, provider: string } | null>(null)

  // Gérer la connexion avec email/mot de passe
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await login({ email, password })

      if (response.success) {
        // Déterminer la redirection en fonction du rôle de l'utilisateur
        const role = response.user.role;
        if (role === 'candidat') {
          router.push('/dashboard/candidat')
        } else if (role === 'employeur') {
          router.push('/dashboard/employeur')
        } else if (role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Initialiser les services OAuth au chargement de la page
  useEffect(() => {
    const initOAuthServices = async () => {
      try {
        // Pré-initialiser les services OAuth pour accélérer la connexion
        if (typeof window !== 'undefined') {
          await Promise.all([
            oauthService.initGoogleAuth().catch(e => console.log('Google init optional:', e)),
            oauthService.initFacebookAuth().catch(e => console.log('Facebook init optional:', e)),
            oauthService.initLinkedInAuth().catch(e => console.log('LinkedIn init optional:', e))
          ]);
        }
      } catch (error) {
        // Ignorer les erreurs d'initialisation, elles seront gérées lors de la connexion
        console.log('OAuth init error (non-blocking):', error);
      }
    };

    initOAuthServices();
  }, []);

  // Using the global AuthResponse type defined at the top of the file

  // Gérer la connexion avec les réseaux sociaux
  const handleSocialLogin = async (provider: string) => {
    try {
      console.log(`Social login clicked: ${provider}`)
      setLoading(true)
      setError('')

      let response: AuthResponse;
      // Appeler le service approprié en fonction du fournisseur
      switch (provider) {
        case 'google':
          response = await oauthService.signInWithGoogle() as AuthResponse;
          break;
        case 'facebook':
          response = await oauthService.signInWithFacebook() as AuthResponse;
          break;
        case 'linkedin':
          response = await oauthService.signInWithLinkedIn() as AuthResponse;
          break;
        default:
          throw new Error('Fournisseur non pris en charge');
      }

      console.log('Social login response:', response);

      if (response.needsRoleSelection) {
        // Stocker les données pour le modal de sélection de rôle
        setSocialLoginData({
          email: response.email || '',
          provider: response.provider || ''
        });
        setShowRoleModal(true);
        return;
      }

      // Redirection en fonction du rôle
      const role = response.user?.role;
      if (response.success) {
        // Ensure token is in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Ensure user is in localStorage
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Déterminer la redirection en fonction du rôle de l'utilisateur
        const role = response.user?.role;
        if (role === 'candidat') {
          router.push('/dashboard/candidat')
        } else if (role === 'employeur') {
          router.push('/dashboard/employeur')
        } else if (role === 'admin') {
          router.push('/dashboard/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      console.error(`Erreur de connexion ${provider}:`, error)
      setError(error?.message || `Échec de la connexion avec ${provider}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelection = async (role: string) => {
    try {
      setLoading(true);
      setError('');

      if (!socialLoginData) {
        throw new Error('Données de connexion sociale manquantes');
      }

      const response = await oauthService.completeSocialLogin(role) as AuthResponse;

      if (response.success) {
        console.log('Role selection successful:', response);

        // Ensure token is in localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
        }

        // Ensure user is in localStorage
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Fermer la modal
        setShowRoleModal(false);

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
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sélection du rôle');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRoleSelection = () => {
    setShowRoleModal(false);
    setSocialLoginData(null);
    oauthService.resetTempUserData();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Blue background with logo */}
      <div className="bg-blue-600 w-full md:w-1/2 flex flex-col items-center justify-center p-12">
        <div className="max-w-md">
          <Link href="/" className="block mb-8">
            <ImageWithFallback
              src="/images/JBC-icon-white.png"
              fallbackSrc="/images/JBC-Logo.png"
              alt="TonCallCenter Logo"
              width={180}
              height={60}
              className="mx-auto mb-4"
            />
          </Link>
          <div className="hidden md:block text-white">
            <h2 className="text-3xl font-bold mb-6">Bienvenue sur TonCallCenter.ma</h2>
            <p className="mb-4">
              La plateforme spécialisée dans le recrutement des centres d&apos;appels au Maroc.
            </p>
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Des milliers d&apos;offres d&apos;emploi en centre d&apos;appel
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Candidature simplifiée en quelques clics
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Suivi personnalisé de vos candidatures
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <ImageWithFallback
              src="/images/JBC-icon.png"
              fallbackSrc="/images/JBC-Logo.png"
              alt="TonCallCenter Icon"
              width={80}
              height={80}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-700 text-sm">Bienvenue sur notre plateforme</p>
          </div>
          {/* Afficher les erreurs */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Connexion avec les réseaux sociaux */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
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
              Continuer avec Google
            </button>
            <button
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9 21.59 18.03 20.37 19.6 18.57C21.16 16.76 22.03 14.47 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
              </svg>
              Continuer avec Facebook
            </button>
            <button
              onClick={() => handleSocialLogin('linkedin')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              <svg className="h-5 w-5 mr-2" fill="#0A66C2" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.68 1.68 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              Continuer avec LinkedIn
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou connectez-vous avec</span>
              </div>
            </div>

            {/* Formulaire de connexion par email */}
            <form className="mt-6 space-y-6" onSubmit={handleEmailLogin}>
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
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/mot-de-passe-oublie" className="font-medium text-blue-600 hover:text-blue-500">
                    Mot de passe oublié?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-700">
              Vous n&apos;avez pas de compte ?{' '}
              <Link href="/inscription" className="font-medium text-blue-600 hover:text-blue-500">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      {showRoleModal && socialLoginData && (
        <RoleSelectionModal
          email={socialLoginData.email}
          provider={socialLoginData.provider}
          onRoleSelect={handleRoleSelection}
          onCancel={handleCancelRoleSelection}
        />
      )}
    </div>
  )
}
