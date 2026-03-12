'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title?: string
  description?: string
  canonical?: string
  ogType?: string
  ogImage?: string
}

export default function SEO({
  title = 'TonCallCenter.ma | Trouvez des Emplois en Centre d\'Appel au Maroc',
  description = 'Premier portail d\'emploi pour les postes en centre d\'appel au Maroc. Trouvez des emplois, publiez des offres et connectez-vous avec les meilleurs employeurs.',
  canonical,
  ogType = 'website',
  ogImage = '/images/og-image.jpg',
}: SEOProps) {
  const pathname = usePathname()
  const siteUrl = 'https://toncallcenter.ma'
  const canonicalUrl = canonical || `${siteUrl}${pathname}`

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="TonCallCenter.ma" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Favicons */}
      <link rel="icon" href="/images/JBC-Favicon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/JBC-Favicon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/JBC-Favicon.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/JBC-Favicon.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  )
}
