import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import ClientOnly from './components/ClientOnly'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

// Dynamically import the CookieConsent component to avoid SSR issues
const CookieConsent = dynamic(
  () => import('./components/cookies/CookieConsent'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'TonCallCenter.ma | Trouvez des Emplois en Centre d\'Appel au Maroc',
  description: 'Premier portail d\'emploi pour les postes en centre d\'appel au Maroc. Trouvez des emplois, publiez des offres et connectez-vous avec les meilleurs employeurs.',
  keywords: 'centre d\'appel, emplois, Maroc, recrutement, téléconseiller, service client',
  icons: {
    icon: '/images/JBC-icon.png',
    apple: '/images/JBC-icon.png',
    shortcut: '/images/JBC-icon.png'
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <Navbar />
            <main>
              {children}
            </main>
            <ClientOnly>
              <Footer />
              <CookieConsent />
            </ClientOnly>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
