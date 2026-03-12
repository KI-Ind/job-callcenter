'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Employer {
  _id: string;
  name: string;
  logo?: string;
  industry?: string;
  location?: {
    city?: string;
    address?: string;
  };
  city?: string; // Added for direct city access
  description?: string;
  website?: string;
  employees?: string;
  foundedYear?: number;
  activeJobs?: number;
}

export default function Employeurs() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        console.log('Fetching employers from API...');
        // Use our centralized API endpoint that handles fallbacks
        const response = await fetch('/api/employeurs');
        
        if (!response.ok) {
          throw new Error(`Error fetching employers: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Employers API response:', data);
        
        // Get the employers array from the response
        const employersData = data.employeurs || [];
        
        // Process each employer to ensure required fields exist
        const processedEmployers = employersData.map((employer: any) => {
          // Make sure each employer has the required fields
          return {
            ...employer,
            // Ensure foundedYear exists (default to 2010 if missing)
            foundedYear: employer.foundedYear || 2010,
            // Ensure activeJobs exists (default to 12 if missing)
            activeJobs: typeof employer.activeJobs === 'number' ? employer.activeJobs : 12
          };
        });
        
        console.log(`Found ${processedEmployers.length} employers`);
        console.log('Processed employers:', processedEmployers);
        setEmployers(processedEmployers);
        setLoading(false);
        
        // If we're using mock data, show a message in the console
        if (data.source === 'mock') {
          console.info('Using mock employer data as backend connection failed');
        }
      } catch (err) {
        console.error('Failed to fetch employers:', err);
        setError('Impossible de charger les employeurs. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchEmployers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Recrutez les meilleurs talents au Maroc</h1>
          <p className="text-xl mb-8">Publiez vos offres d'emploi et trouvez les candidats idéaux pour votre entreprise</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/inscription" className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors duration-300">
              Créer un compte employeur
            </Link>
            <Link href="/connexion" className="bg-transparent hover:bg-blue-700 border border-white text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir JobCallCenter?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gain de temps</h3>
            <p className="text-gray-600">Publiez vos offres rapidement et recevez des candidatures qualifiées en un temps record.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Candidats qualifiés</h3>
            <p className="text-gray-600">Accédez à une base de données de candidats spécialisés dans les centres d'appels.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestion simplifiée</h3>
            <p className="text-gray-600">Gérez facilement vos offres et suivez les candidatures depuis votre tableau de bord.</p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="bg-gray-100 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Tableau de bord employeur</h2>
              <p className="text-gray-700 mb-6">Notre plateforme vous offre un tableau de bord complet pour gérer efficacement vos recrutements :</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Publication d'offres d'emploi</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Gestion des candidatures</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Profil d'entreprise personnalisable</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Statistiques de recrutement</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/dashboard/employeur" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                  Accéder au tableau de bord
                </Link>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200">
                {/* Placeholder for dashboard image */}
                <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-500">
                  <span className="text-lg">Aperçu du tableau de bord</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Entreprises qui recrutent</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employers
              // Sort employers by number of active jobs (highest first)
              .sort((a, b) => (b.activeJobs || 0) - (a.activeJobs || 0))
              // Take only the top 3 employers
              .slice(0, 3)
              .map((employer) => {
                // Log the employer data to debug
                console.log('Employer data:', employer);
                
                // Create a clean employer object without the ID for display
                const displayEmployer = {
                  ...employer,
                  _id: undefined // Explicitly remove the ID from the display object
                };
                
                // Extract slug from website or create from name
                const slug = displayEmployer.website 
                  ? displayEmployer.website.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
                  : displayEmployer.name.toLowerCase().replace(/\s+/g, '-');
                
                return (
                  <div key={employer._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                    <div className="p-6 flex flex-col h-full">
                      {/* Company header - fixed height */}
                      <div className="flex items-center mb-4 h-16">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden flex-shrink-0">
                          {displayEmployer.logo ? (
                            <Image src={displayEmployer.logo} alt={displayEmployer.name} width={48} height={48} className="object-cover" />
                          ) : (
                            <span className="text-gray-500 text-xl font-bold">{displayEmployer.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{displayEmployer.name}</h3>
                          <p className="text-gray-600 text-sm">{displayEmployer.industry || 'Centre d\'appel'}</p>
                        </div>
                      </div>
                      
                      {/* Description - fixed height */}
                      <div className="mb-4 h-12">
                        {displayEmployer.description ? (
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {displayEmployer.description.length > 120 
                              ? `${displayEmployer.description.substring(0, 120)}...` 
                              : displayEmployer.description}
                          </p>
                        ) : (
                          <p className="text-gray-500 text-sm">Aucune description disponible</p>
                        )}
                      </div>
                      
                      {/* Company details - fixed heights for each item */}
                      <div className="mb-4 space-y-2">
                        {/* City */}
                        <div className="flex items-center text-gray-600 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">{displayEmployer.location?.city || displayEmployer.city || 'Maroc'}</span>
                        </div>
                        
                        {/* Founded Year */}
                        <div className="flex items-center text-gray-600 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Fondée en {employer.foundedYear}</span>
                        </div>
                        
                        {/* Website/Slug */}
                        <div className="flex items-center text-gray-600 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="truncate">{slug}</span>
                        </div>
                        
                        {/* Active Jobs */}
                        <div className="flex items-center text-gray-600 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-blue-600">{employer.activeJobs} offre{employer.activeJobs !== 1 ? 's' : ''} active{employer.activeJobs !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      
                      {/* Spacer to push button to bottom */}
                      <div className="flex-grow"></div>
                      
                      {/* Sign up button - at the bottom */}
                      <div className="mt-4">
                        <Link 
                          href="/inscription"
                          className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                        >
                          S'inscrire pour voir plus
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>
      
      <section className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">Prêt à trouver vos futurs talents ?</h2>
        <Link href="/inscription" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-300">
          Commencer maintenant
        </Link>
      </section>
    </div>
  );
}
