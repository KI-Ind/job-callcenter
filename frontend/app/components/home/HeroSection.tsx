'use client'

import { useState, useEffect, Fragment } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { categoriesAPI, citiesAPI } from '../../lib/api'

// Define types for API responses
type Category = {
  id?: string;
  _id?: string;
  name: string;
  count?: number;
  jobCount?: number;
  slug?: string;
}

export default function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('Toutes les villes')
  // Start with a default list of Moroccan cities to ensure the dropdown is never empty
  const [cities, setCities] = useState<string[]>([
    'Toutes les villes',
    'Casablanca',
    'Rabat',
    'Marrakech',
    'Tanger',
    'Fès',
    'Agadir',
    'Meknès',
    'Oujda',
    'Tétouan'
  ])
  const [popularCategories, setPopularCategories] = useState<{id: string, name: string, count: number}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchCitiesAndCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch cities using the citiesAPI service
        try {
          const citiesResponse = await citiesAPI.getCities();
          
          // Process cities data
          if (citiesResponse && Array.isArray(citiesResponse.cities) && citiesResponse.cities.length > 0) {
            // Extract city names from objects if they are objects, otherwise use as is
            const cityNames = citiesResponse.cities.map((city: any) => 
              typeof city === 'object' && city !== null ? (city.name || city.city || '') : city
            ).filter(Boolean);
            setCities(['Toutes les villes', ...cityNames]);
          } else if (citiesResponse && Array.isArray(citiesResponse) && citiesResponse.length > 0) {
            // Extract city names from objects if they are objects, otherwise use as is
            const cityNames = citiesResponse.map((city: any) => 
              typeof city === 'object' && city !== null ? (city.name || city.city || '') : city
            ).filter(Boolean);
            setCities(['Toutes les villes', ...cityNames]);
          }
          // If the API fails, we'll keep using the default cities list
        } catch (cityError) {
          console.error('Error fetching cities:', cityError);
          // Keep using the default cities list
        }
        
        // Try to fetch popular categories
        try {
          // First try to get popular categories directly
          const popularResponse = await categoriesAPI.getPopularCategories();
          
          if (popularResponse) {
            let categoryList: Category[] = [];
            
            // Handle different response formats
            if (popularResponse.categories && Array.isArray(popularResponse.categories)) {
              categoryList = popularResponse.categories;
            } else if (Array.isArray(popularResponse)) {
              categoryList = popularResponse;
            } else if (popularResponse.data && Array.isArray(popularResponse.data)) {
              categoryList = popularResponse.data;
            }
            
            console.log('Popular categories raw data:', categoryList);
            
            // Make sure we have the count property and sort by it
            const processedCategories = categoryList
              .map((cat: Category) => ({
                id: cat.id || cat._id || '',
                name: cat.name,
                count: cat.count || cat.jobCount || 0
              }))
              .filter(cat => cat.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5); // Get top 5 categories
              
            console.log('Processed popular categories:', processedCategories);
              
            if (processedCategories.length > 0) {
              setPopularCategories(processedCategories);
            }
          }
        } catch (categoryError) {
          console.error('Error fetching popular categories:', categoryError);
          // Fall back to all categories and sort client-side
          try {
            const categoriesResponse = await categoriesAPI.getCategories();
            
            let categoryList: Category[] = [];
            
            if (categoriesResponse && Array.isArray(categoriesResponse.categories)) {
              categoryList = categoriesResponse.categories;
            } else if (Array.isArray(categoriesResponse)) {
              categoryList = categoriesResponse;
            } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
              categoryList = categoriesResponse.data;
            }
            
            // Map and sort by job count
            const sortedCategories = categoryList
              .map((cat: Category) => ({
                id: cat.id || cat._id || '',
                name: cat.name,
                count: cat.count || cat.jobCount || 0
              }))
              .filter(cat => cat.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5); // Get top 5 categories
            
            if (sortedCategories.length > 0) {
              setPopularCategories(sortedCategories);
            }
          } catch (allCategoriesError) {
            console.error('Error fetching all categories:', allCategoriesError);
            // Keep empty popular categories list
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCitiesAndCategories()
  }, [])
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build the query parameters
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedCity && selectedCity !== 'Toutes les villes') params.append('city', selectedCity)
    
    // Redirect to the search results page
    router.push(`/emploi${params.toString() ? `?${params.toString()}` : ''}`)
  }
  
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Trouvez votre emploi idéal<br />dans les centres d&apos;appels
        </h1>
        <p className="text-xl mb-8">
          La plateforme spécialisée dans le recrutement des centres d&apos;appels au Maroc. Des 
          milliers d&apos;offres d&apos;emploi vous attendent.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              placeholder="Poste, compétence ou mot-clé"
              className="flex-grow px-4 py-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="px-4 py-3 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={isLoading}
            >
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-md"
            >
              Rechercher
            </button>
          </div>
        </form>
        
        {!isLoading && (
          <div className="mt-6 text-sm">
            <p className="mb-2">Recherches populaires:</p>
            {popularCategories.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-2">
                {popularCategories.map((category, index) => (
                  <Fragment key={category.id || index}>
                    {index > 0 && <span>•</span>}
                    <Link 
                      href={`/emploi?category=${category.id}`} 
                      className="text-white hover:underline"
                    >
                      {category.name}
                    </Link>
                  </Fragment>
                ))}
              </div>
            ) : (
              <div className="text-center text-white text-opacity-80">
                <p>Les catégories populaires s&apos;afficheront ici dès qu&apos;elles seront disponibles dans la base de données.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
