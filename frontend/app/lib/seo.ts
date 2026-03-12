import { Metadata } from 'next'

export interface SEOParams {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogType?: string
  ogImage?: string
  noIndex?: boolean
}

/**
 * Génère les métadonnées pour les pages Next.js
 */
export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  canonical,
  ogType = 'website',
  ogImage = '/images/og-image.jpg',
  noIndex = false,
}: SEOParams): Metadata {
  // Base URL pour les URL canoniques et les images
  const baseUrl = 'https://toncallcenter.ma'

  // URL canonique complète
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : undefined

  return {
    title,
    description,
    keywords: keywords.join(', '),
    metadataBase: new URL(baseUrl),

    // Canonical URL
    ...(canonicalUrl && { alternates: { canonical: canonicalUrl } }),

    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },

    // Open Graph
    openGraph: {
      title,
      description,
      type: ogType,
      url: canonicalUrl,
      images: [
        {
          url: `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'TonCallCenter.ma',
      locale: 'fr_FR',
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${baseUrl}${ogImage}`],
    },
  }
}

/**
 * Génère le balisage JSON-LD pour une offre d'emploi
 */
export function generateJobPostingSchema(job: any): string {
  const jobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    'title': job.title,
    'description': job.description,
    'datePosted': job.postedDate,
    'validThrough': job.validThrough,
    'employmentType': mapContractTypeToSchema(job.contractType),
    'hiringOrganization': {
      '@type': 'Organization',
      'name': job.company,
      'logo': job.companyLogo ? `https://toncallcenter.ma${job.companyLogo}` : undefined,
      'sameAs': job.companyWebsite
    },
    'jobLocation': {
      '@type': 'Place',
      'address': {
        '@type': 'PostalAddress',
        'addressLocality': job.location,
        'addressRegion': 'Maroc',
        'addressCountry': 'MA'
      }
    },
    ...(job.salary && {
      'baseSalary': {
        '@type': 'MonetaryAmount',
        'currency': 'MAD',
        'value': {
          '@type': 'QuantitativeValue',
          'value': job.salary.replace(/[^0-9-]/g, ''),
          'unitText': 'MONTH'
        }
      }
    })
  }

  return JSON.stringify(jobPosting)
}

/**
 * Convertit les types de contrat internes en formats Schema.org
 */
function mapContractTypeToSchema(contractType: string): string {
  const mapping: Record<string, string> = {
    'CDI': 'FULL_TIME',
    'CDD': 'CONTRACTOR',
    'Stage': 'INTERN',
    'Freelance': 'FREELANCE',
    'Temps partiel': 'PART_TIME',
    'Intérim': 'TEMPORARY'
  }

  return mapping[contractType] || 'OTHER'
}

/**
 * Génère le balisage JSON-LD pour l'organisation
 */
export function generateOrganizationSchema(): string {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'TonCallCenter.ma',
    'url': 'https://toncallcenter.ma',
    'logo': 'https://toncallcenter.ma/images/logo.png',
    'sameAs': [
      'https://www.facebook.com/toncallcenter',
      'https://www.linkedin.com/company/toncallcenter',
      'https://www.instagram.com/toncallcenter'
    ],
    'contactPoint': {
      '@type': 'ContactPoint',
      'telephone': '+212-522-000000',
      'contactType': 'customer service',
      'availableLanguage': ['French', 'Arabic', 'English']
    }
  }

  return JSON.stringify(organization)
}
