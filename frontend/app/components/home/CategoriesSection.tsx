'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaHeadset, FaLaptop, FaPhoneAlt, FaUsers, FaComments, FaChartLine, FaBriefcase, FaCog, FaHandsHelping, FaHome, FaUserTie, FaGraduationCap } from 'react-icons/fa'
import { categoriesAPI } from '../../lib/api'

// Map of category IDs to their respective icons
const categoryIcons: Record<string, JSX.Element> = {
  // Updated categories based on new structure
  'call-center': <FaHeadset className="text-blue-500 w-6 h-6" />,
  'support-multicanal': <FaComments className="text-green-500 w-6 h-6" />,
  'support-technique': <FaCog className="text-purple-500 w-6 h-6" />,
  'back-office': <FaLaptop className="text-orange-500 w-6 h-6" />,
  'teletravail-freelance': <FaHome className="text-teal-500 w-6 h-6" />,
  'gestion-equipe': <FaUsers className="text-indigo-500 w-6 h-6" />,
  'formation-qualite': <FaChartLine className="text-pink-500 w-6 h-6" />,
  'recrutement-rh': <FaUserTie className="text-red-500 w-6 h-6" />,
  'stages-apprentissages': <FaGraduationCap className="text-amber-500 w-6 h-6" />,
  
  // Legacy categories (keeping for backward compatibility)
  'reception': <FaHeadset className="text-blue-500 w-6 h-6" />,
  'emission': <FaPhoneAlt className="text-green-500 w-6 h-6" />,
  'emission-reception': <FaLaptop className="text-purple-500 w-6 h-6" />,
  'management': <FaUsers className="text-orange-500 w-6 h-6" />,
  'reseaux-sociaux': <FaComments className="text-pink-500 w-6 h-6" />,
  'encadrement': <FaChartLine className="text-indigo-500 w-6 h-6" />
}

// Default color for categories without a specific icon
const defaultIconColors = [
  'text-blue-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
  'text-pink-500',
  'text-indigo-500',
  'text-teal-500',
  'text-red-500',
  'text-amber-500'
]

// Maximum number of categories to display on the home page
const MAX_CATEGORIES_TO_DISPLAY = 6;

// Empty default categories - we'll use only dynamic data from the database
const defaultCategories: Array<{
  id: string;
  name: string;
  icon: JSX.Element;
  count: number;
  url: string;
}> = [];

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Array<{
    id: string;
    name: string;
    label?: string; // Added label field for French display
    icon: JSX.Element;
    count: number;
    url: string;
    types?: string[]; // Added types array
  }>>(defaultCategories); // Initialize with default categories
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching categories with job counts...');
        // Fetch popular categories using the enhanced API service
        const categoriesResponse = await categoriesAPI.getPopularCategories()
          .catch((error) => {
            console.error('Error in initial API call:', error);
            return { categories: [] }; // Empty array as fallback
          });
        
        console.log('Categories response:', categoriesResponse);
        let fetchedCategories = [];
        
        // Process categories data based on response format
        if (categoriesResponse && Array.isArray(categoriesResponse.categories)) {
          fetchedCategories = categoriesResponse.categories;
        } else if (categoriesResponse && Array.isArray(categoriesResponse)) {
          fetchedCategories = categoriesResponse;
        } else if (categoriesResponse && categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
          fetchedCategories = categoriesResponse.data;
        } else {
          console.warn('Invalid categories data format, using empty array', categoriesResponse);
          fetchedCategories = [];
        }
        
        console.log('Fetched categories before sorting:', fetchedCategories);
        
        // Sort categories by job count to get the most popular ones
        fetchedCategories.sort((a: any, b: any) => {
          const countA = a.jobCount || a.count || 0;
          const countB = b.jobCount || b.count || 0;
          return countB - countA;
        });
        
        console.log('Sorted categories by job count:', fetchedCategories);
        
        // Limit to the top categories for display
        const topCategories = fetchedCategories.slice(0, MAX_CATEGORIES_TO_DISPLAY);
        
        // Map the fetched categories to our display format
        const formattedCategories = topCategories.map((category: any, index: number) => {
          const id = category._id || category.id || category.slug || `category-${index}`;
          const name = category.name || 'Catégorie';
          const label = category.label || category.name || 'Catégorie';
          const types = category.types || [];
          // Make sure we get the job count from the API response
          const count = category.jobCount || category.count || 0;
          
          console.log(`Category ${name} has ${count} jobs`);
          
          // Get the icon for this category or use a default
          let icon = categoryIcons[id.toLowerCase()];
          if (!icon) {
            // Create a default icon with a color from our palette
            const colorClass = defaultIconColors[index % defaultIconColors.length];
            icon = <FaBriefcase className={`${colorClass} w-6 h-6`} />;
          }
          
          return {
            id,
            name,
            label,
            icon,
            count,
            url: `/emploi?category=${id}`,
            types
          };
        });
        
        console.log('Formatted categories for display:', formattedCategories);
        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        // Don't set any static categories, keep the empty array
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Catégories d&apos;emploi</h2>
        <p className="text-center text-gray-600 mb-10">
          Explorez les différents domaines d&apos;emploi disponibles dans les centres d&apos;appels
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Impossible de charger les catégories depuis la base de données.</p>
            <p className="text-gray-500">Veuillez réessayer plus tard.</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fallback categories if API fails - updated to new structure */}
            {[
              { id: 'call-center', name: 'Call Center', label: 'Call Center', icon: <FaHeadset className="text-blue-500 w-6 h-6" />, count: 5, types: ['Outbound', 'Inbound', 'Back Office', 'Telemarketing', 'Appointment Setting'] },
              { id: 'support-multicanal', name: 'Support Multicanal', label: 'Support Multicanal', icon: <FaComments className="text-green-500 w-6 h-6" />, count: 4, types: ['Live Chat', 'Email Handling', 'Social Media', 'Claims'] },
              { id: 'support-technique', name: 'Support Technique', label: 'Support Technique', icon: <FaCog className="text-purple-500 w-6 h-6" />, count: 6, types: ['Hotline', 'Level 1', 'Level 2', 'Diagnostics'] },
              { id: 'back-office', name: 'Back Office', label: 'Back Office', icon: <FaLaptop className="text-orange-500 w-6 h-6" />, count: 3, types: ['Data Entry', 'File Processing', 'Verification'] },
              { id: 'teletravail-freelance', name: 'Télétravail & Freelance', label: 'Télétravail & Freelance', icon: <FaHome className="text-teal-500 w-6 h-6" />, count: 2, types: ['Remote Work', 'Hybrid', 'Freelance', 'Part-time'] },
              { id: 'gestion-equipe', name: 'Gestion d\'Équipe', label: 'Gestion d\'Équipe', icon: <FaUsers className="text-indigo-500 w-6 h-6" />, count: 2, types: ['Team Leader', 'Supervisor', 'Floor Manager', 'Quality Manager'] }
            ].map((category) => (
              <Link 
                key={category.id}
                href={`/emploi?category=${category.id}`}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{category.label || category.name}</h3>
                  <p className="text-gray-500 text-sm">{category.count} offres disponibles</p>
                  {category.types && category.types.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                      {category.types.slice(0, 3).join(', ')}{category.types.length > 3 ? '...' : ''}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id}
                href={category.url}
                className="bg-white rounded-lg shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="p-3 bg-gray-100 rounded-full">
                  {category.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{category.label || category.name}</h3>
                  <p className="text-gray-500 text-sm">{category.count} offres disponibles</p>
                  {category.types && category.types.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                      {category.types.slice(0, 3).join(', ')}{category.types.length > 3 ? '...' : ''}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link 
            href="/emploi"
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
          >
            Voir toutes les catégories
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
