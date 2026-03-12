'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Candidate {
  _id: string;
  name: string;
  profilePicture?: string;
  title?: string;
  skills?: string[];
  location?: {
    city?: string;
  };
  experience?: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  languages?: {
    name: string;
    level: string;
  }[];
  availableForWork?: boolean;
}

export default function Candidats() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch candidates from API
    const fetchCandidates = async () => {
      try {
        console.log('Fetching candidates from API...');
        // Use our centralized API endpoint that handles fallbacks
        const response = await fetch('/api/candidats');
        
        if (!response.ok) {
          throw new Error(`Error fetching candidates: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Candidates API response:', data);
        
        // Get the candidates array from the response
        const candidatesData = data.candidats || [];
        
        console.log(`Found ${candidatesData.length} candidates`);
        setCandidates(candidatesData);
        setLoading(false);
        
        // If we're using mock data, show a message in the console
        if (data.source === 'mock') {
          console.info('Using mock candidate data as backend connection failed');
        }
      } catch (err) {
        console.error('Failed to fetch candidates:', err);
        setError('Impossible de charger les candidats. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Trouvez votre prochain emploi en centre d'appel</h1>
          <p className="text-xl mb-8">Des milliers d'offres d'emploi dans les centres d'appel au Maroc vous attendent</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/inscription" className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-colors duration-300">
              Créer un compte candidat
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Offres exclusives</h3>
            <p className="text-gray-600">Accédez à des offres d'emploi en centre d'appel exclusives et vérifiées.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Candidature simplifiée</h3>
            <p className="text-gray-600">Postulez en quelques clics et suivez vos candidatures facilement.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Carrière accélérée</h3>
            <p className="text-gray-600">Développez votre carrière dans les centres d'appel avec des opportunités adaptées à votre profil.</p>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <div className="bg-gray-100 rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Votre espace candidat</h2>
              <p className="text-gray-700 mb-6">Gérez votre recherche d'emploi efficacement avec notre plateforme dédiée :</p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>CV en ligne personnalisable</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Suivi de vos candidatures</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Alertes emploi personnalisées</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Messagerie avec les recruteurs</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link href="/dashboard/candidat" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300">
                  Accéder à mon espace
                </Link>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-200">
                {/* Placeholder for dashboard image */}
                <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-500">
                  <span className="text-lg">Aperçu de l'espace candidat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Offres d'emploi populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/emploi" className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Téléconseiller francophone</h3>
              <p className="text-gray-600 mb-4">Casablanca</p>
              <div className="flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Temps plein</span>
              </div>
            </div>
          </Link>
          <Link href="/emploi" className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Conseiller client espagnol</h3>
              <p className="text-gray-600 mb-4">Rabat</p>
              <div className="flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Temps plein</span>
              </div>
            </div>
          </Link>
          <Link href="/emploi" className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">Superviseur centre d'appel</h3>
              <p className="text-gray-600 mb-4">Tanger</p>
              <div className="flex items-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Temps plein</span>
              </div>
            </div>
          </Link>
        </div>
        <div className="text-center mt-8">
          <Link href="/emploi" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
            Voir toutes les offres
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>
      
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Candidats disponibles</h2>
        
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
            {candidates
              // Sort candidates by number of skills (highest first)
              .sort((a, b) => (b.skills?.length || 0) - (a.skills?.length || 0))
              // Take only the top 3 candidates
              .slice(0, 3)
              .map((candidate) => (
                <div key={candidate._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                        {candidate.profilePicture ? (
                          <Image src={candidate.profilePicture} alt={candidate.name} width={64} height={64} className="object-cover" />
                        ) : (
                          <span className="text-gray-500 text-xl font-bold">{candidate.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{candidate.name}</h3>
                        <p className="text-gray-600 text-sm">{candidate.title || 'Professionnel du centre d\'appel'}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-gray-600 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{candidate.location?.city || 'Maroc'}</span>
                      </div>
                      
                      {candidate.availableForWork !== undefined && (
                        <div className="flex items-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className={candidate.availableForWork ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            {candidate.availableForWork 
                              ? 'Disponible pour un emploi' 
                              : 'Actuellement en poste'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Compétences ({candidate.skills.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 3 && (
                            <span className="text-xs text-gray-500">+{candidate.skills.length - 3} autres</span>
                          )}
                        </div>
                      </div>
                    )}
                    
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
              ))}
          </div>
        )}
      </section>

      <section className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">Prêt à démarrer votre carrière ?</h2>
        <Link href="/inscription" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-300">
          Créer mon compte
        </Link>
      </section>
    </div>
  );
}
