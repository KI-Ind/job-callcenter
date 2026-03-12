'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { companiesAPI } from '../../lib/api'

interface CallCenter {
  id: string;
  name: string;
  jobCount: number;
  shortCode: string;
  color: string;
}

// Maximum number of companies to display
const MAX_COMPANIES_TO_DISPLAY = 4;

// Company badge colors
const companyBadgeColors = [
  'bg-blue-100',
  'bg-green-100',
  'bg-purple-100',
  'bg-yellow-100',
  'bg-red-100',
  'bg-indigo-100',
  'bg-pink-100',
  'bg-gray-100'
];

export default function RecruitingCentersSection() {
  const [callCenters, setCallCenters] = useState<CallCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching top companies with job counts...');
        // Fetch companies with the most job listings
        const response = await companiesAPI.getTopCompanies(MAX_COMPANIES_TO_DISPLAY)
          .catch((error) => {
            console.error('Error in initial API call:', error);
            return { companies: [] }; // Empty array as fallback
          });
        
        console.log('Companies response:', response);
        let fetchedCompanies = [];
        
        // Process companies data based on response format
        if (response && 'companies' in response && Array.isArray(response.companies)) {
          fetchedCompanies = response.companies;
        } else if (response && Array.isArray(response)) {
          fetchedCompanies = response;
        } else if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          fetchedCompanies = response.data;
        } else {
          console.warn('Invalid companies data format, using fallback data', response);
          fetchedCompanies = [];
        }
        
        console.log('Fetched companies:', fetchedCompanies);
        
        if (fetchedCompanies.length > 0) {
          // Map the fetched companies to our display format
          const formattedCompanies = fetchedCompanies.map((company: any, index: number) => {
            const id = company._id || company.id || `company-${index}`;
            const name = company.name || 'Entreprise';
            // Create a short code from the company name (first letter)
            const shortCode = name.substring(0, 1).toUpperCase();
            // Get a badge color based on index
            const color = companyBadgeColors[index % companyBadgeColors.length];
            // Get job count from the API
            const jobCount = company.jobCount || 0;
            
            return {
              id,
              name,
              jobCount,
              shortCode,
              color
            };
          });
          
          console.log('Formatted companies for display:', formattedCompanies);
          setCallCenters(formattedCompanies);
        } else {
          // Use fallback data if no companies were found
          setCallCenters([
            {
              id: 'globalcall',
              name: 'GlobalCall Services',
              jobCount: 0,
              shortCode: 'G',
              color: 'bg-blue-100'
            },
            {
              id: 'techsupport',
              name: 'TechSupport International',
              jobCount: 0,
              shortCode: 'T',
              color: 'bg-green-100'
            },
            {
              id: 'financetel',
              name: 'FinanceTel',
              jobCount: 0,
              shortCode: 'F',
              color: 'bg-purple-100'
            },
            {
              id: 'multicontact',
              name: 'MultiContact Center',
              jobCount: 0,
              shortCode: 'M',
              color: 'bg-yellow-100'
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError('Failed to load companies');
        // Use fallback data on error
        setCallCenters([
          {
            id: 'globalcall',
            name: 'GlobalCall Services',
            jobCount: 0,
            shortCode: 'G',
            color: 'bg-blue-100'
          },
          {
            id: 'techsupport',
            name: 'TechSupport International',
            jobCount: 0,
            shortCode: 'T',
            color: 'bg-green-100'
          },
          {
            id: 'financetel',
            name: 'FinanceTel',
            jobCount: 0,
            shortCode: 'F',
            color: 'bg-purple-100'
          },
          {
            id: 'multicontact',
            name: 'MultiContact Center',
            jobCount: 0,
            shortCode: 'M',
            color: 'bg-yellow-100'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Centres d'appels qui recrutent</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Découvrez les entreprises partenaires qui proposent régulièrement des opportunités d'emploi
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2 text-sm">Impossible de charger les entreprises.</p>
            <p className="text-gray-500 text-xs">Veuillez réessayer plus tard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {callCenters.map((center) => (
              <Link 
                key={center.id}
                href={`/emploi?company=${center.id}`}
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 ${center.color} rounded-full flex items-center justify-center font-bold text-sm mb-3`}>
                  {center.shortCode}
                </div>
                <h3 className="font-semibold text-sm mb-1">{center.name}</h3>
                <p className="text-xs text-gray-500">{center.jobCount} offres d'emploi</p>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-6">
          <Link 
            href="/emploi" 
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-sm"
          >
            Voir tous les employeurs
            <FaArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  )
}
