'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  customItems?: BreadcrumbItem[]
}

export default function Breadcrumb({ items, customItems }: BreadcrumbProps) {
  const pathname = usePathname()
  
  // Generate breadcrumb items from pathname if not provided
  const breadcrumbItems = customItems || items || generateBreadcrumbItems(pathname)
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `https://jobcallcenter.ma${item.url}`
    }))
  }

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Visible breadcrumb */}
      <nav className="flex py-3 px-5 text-gray-700 bg-gray-50 rounded-lg" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
              <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
              </svg>
              Accueil
            </Link>
          </li>
          
          {breadcrumbItems.slice(1).map((item, index) => (
            <li key={index}>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                </svg>
                <Link 
                  href={item.url} 
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  {item.name}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// Helper function to generate breadcrumb items from pathname
function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean)
  
  // Start with home
  const items: BreadcrumbItem[] = [
    { name: 'Accueil', url: '/' }
  ]
  
  // Add each path segment
  let currentPath = ''
  paths.forEach((path, index) => {
    currentPath += `/${path}`
    
    // Format the name (capitalize and replace hyphens with spaces)
    let name = path.replace(/-/g, ' ')
    
    // Special cases for common paths
    if (path === 'emploi') name = 'Offres d\'emploi'
    if (path === 'entreprises') name = 'Entreprises'
    if (path === 'cv') name = 'CV'
    if (path === 'connexion') name = 'Connexion'
    if (path === 'inscription') name = 'Inscription'
    
    // If it's a city or job title, keep it as is but capitalize first letter
    name = name.charAt(0).toUpperCase() + name.slice(1)
    
    items.push({ name, url: currentPath })
  })
  
  return items
}
