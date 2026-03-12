'use client'

import Link from 'next/link'
import Image from 'next/image'

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  contractType: string
  logo?: string
  postedDate: string
  slug: string
}

export default function JobCard({
  id,
  title,
  company,
  location,
  salary,
  contractType,
  logo = '/images/default-company-logo.png',
  postedDate,
  slug,
}: JobCardProps) {
  // Format the posted date
  const formattedDate = new Date(postedDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Image
            src={logo}
            alt={`${company} logo`}
            width={60}
            height={60}
            className="rounded-md"
          />
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold mb-1">
                <Link href={`/emploi/${slug}`} className="hover:text-blue-600 transition-colors">
                  {title}
                </Link>
              </h3>
              <p className="text-gray-700 mb-1">{company}</p>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
                {location}
              </div>
            </div>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
              contractType === 'CDI' 
                ? 'bg-blue-100 text-blue-800' 
                : contractType === 'CDD' 
                ? 'bg-green-100 text-green-800'
                : contractType === 'Stage' 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {contractType}
            </span>
          </div>
          
          <div className="mt-3 flex flex-wrap justify-between items-center">
            {salary && (
              <div className="text-gray-700 font-medium mb-2 md:mb-0">
                <span className="text-sm text-gray-500 mr-1">Salaire:</span> {salary}
              </div>
            )}
            <div className="text-sm text-gray-500">
              Publié le {formattedDate}
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <Link 
              href={`/emploi/${slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Voir l&apos;offre
            </Link>
            <button 
              className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
              aria-label="Sauvegarder cette offre"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
