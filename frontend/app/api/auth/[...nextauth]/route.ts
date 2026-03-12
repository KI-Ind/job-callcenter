import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import LinkedInProvider from 'next-auth/providers/linkedin'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import clientPromise from '../../../lib/mongodb'

// Configuration de l'authentification
const handler = NextAuth({
  // Adaptateur MongoDB pour stocker les sessions et les utilisateurs
  adapter: MongoDBAdapter(clientPromise),
  
  // Fournisseurs d'authentification
  providers: [
    // Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    
    // Facebook
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    
    // LinkedIn
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
    }),
    
    // Email/Mot de passe
    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' }
      },
      async authorize(credentials) {
        // Ici, vous implémenteriez la logique de vérification des identifiants
        // contre votre base de données ou API
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          // Exemple de vérification (à remplacer par votre logique réelle)
          // const user = await verifyCredentials(credentials.email, credentials.password)
          
          // Pour la démo, nous retournons un utilisateur factice
          // En production, vous vérifieriez les identifiants contre votre base de données
          const user = {
            id: '1',
            name: 'Utilisateur Test',
            email: credentials.email,
          }
          
          return user
        } catch (error) {
          console.error('Erreur d\'authentification:', error)
          return null
        }
      }
    }),
  ],
  
  // Pages personnalisées
  pages: {
    signIn: '/connexion',
    signOut: '/deconnexion',
    error: '/connexion', // Erreur d'authentification
    verifyRequest: '/verifier-email', // Utilisé pour les providers qui envoient des liens par email
    newUser: '/inscription/complete' // Nouvel utilisateur
  },
  
  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      // Ajouter des données supplémentaires au token JWT si nécessaire
      if (user) {
        token.id = user.id
        // Vous pouvez ajouter d'autres propriétés ici
      }
      return token
    },
    
    async session({ session, token }) {
      // Ajouter des données supplémentaires à la session
      if (token) {
        session.user.id = token.id as string
        // Vous pouvez ajouter d'autres propriétés ici
      }
      return session
    },
  },
  
  // Configuration de la session
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  
  // Sécurité
  secret: process.env.NEXTAUTH_SECRET,
  
  // Debug (à désactiver en production)
  debug: process.env.NODE_ENV === 'development',
})

export { handler as GET, handler as POST }
