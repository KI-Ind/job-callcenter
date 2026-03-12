'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { categoriesAPI, citiesAPI } from '../lib/api';

// Define a type for salary object structure
interface SalaryObject {
  min?: number;
  max?: number;
}

// Type guard for SalaryObject
function isSalaryObject(salary: any): salary is SalaryObject {
  return salary !== null && typeof salary === 'object' && 
         ('min' in salary || 'max' in salary);
}

// Define a type for job salary that can handle different formats
type JobSalary = SalaryObject | string | number;

// Define a type for category object structure
interface CategoryObject {
  _id?: string;
  id?: string;
  name?: string;
  label?: string;
  types?: string[];
}

// Type guard for CategoryObject
function isCategoryObject(category: any): category is CategoryObject {
  return category !== null && typeof category === 'object' && 
         ('_id' in category || 'id' in category || 'name' in category || 'label' in category);
}

interface Job {
  _id: string;
  title: string;
  company?: {
    name: string;
    _id?: string;
  };
  location?: {
    city?: string;
    address?: string;
  };
  // Direct properties that might exist in different API responses
  city?: string;
  address?: string;
  skills?: string[];
  tags?: string[];
  salary?: JobSalary;
  // Direct salary properties that might exist in different API responses
  min?: number;
  max?: number;
  description?: string;
  requirements?: string[];
  isActive?: boolean;
  applicationDeadline?: string;
  // Category-related properties
  category?: CategoryObject | string;
  categoryId?: string;
  category_id?: string;
  type?: string;      // Job type from category (Outbound, Inbound, etc.)
  jobType?: string;   // Contract type (CDI, CDD, etc.)
}

// Job listing page component
export default function OffresEmploi() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State for jobs data
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [categories, setCategories] = useState<CategoryObject[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [contractTypes, setContractTypes] = useState<string[]>(['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel']);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  
  // State for selected filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(''); // For job type from category (Outbound, Inbound, etc.)
  const [selectedContractType, setSelectedContractType] = useState<string>(''); // For contract type (CDI, CDD, etc.)
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9; // Show 9 jobs per page (3x3 grid)

  useEffect(() => {
    // Get initial filter values from URL params
    const categoryParam = searchParams.get('category') || '';
    const typeParam = searchParams.get('type') || '';
    const contractTypeParam = searchParams.get('jobType') || '';
    const cityParam = searchParams.get('city') || '';
    const queryParam = searchParams.get('q') || '';
    const pageParam = searchParams.get('page');
    
    setSelectedCategory(categoryParam);
    setSelectedType(typeParam);
    setSelectedContractType(contractTypeParam);
    setSelectedCity(cityParam);
    setSearchQuery(queryParam);
    setCurrentPage(pageParam ? parseInt(pageParam, 10) : 1);
    
    // Fetch categories and cities for filters
    const fetchFiltersData = async () => {
      setLoadingFilters(true);
      try {
        // Fetch categories
        const categoriesResponse = await categoriesAPI.getCategories();
        if (categoriesResponse) {
          let categoryList = [];
          
          if (Array.isArray(categoriesResponse)) {
            categoryList = categoriesResponse;
          } else if (categoriesResponse.categories && Array.isArray(categoriesResponse.categories)) {
            categoryList = categoriesResponse.categories;
          } else if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
            categoryList = categoriesResponse.data;
          }
          
          const formattedCategories = categoryList.map((cat: any) => ({
            id: cat.id || cat._id || '',
            name: cat.name,
            label: cat.label || cat.name,
            types: cat.types || []
          }));
          
          setCategories(formattedCategories);
          
          // Fetch all types for the type filter
          try {
            setLoadingTypes(true);
            const allTypesResponse = await categoriesAPI.getAllTypes();
            if (allTypesResponse && Array.isArray(allTypesResponse)) {
              setTypes(allTypesResponse);
            }
          } catch (typeError) {
            console.error('Error fetching types:', typeError);
          } finally {
            setLoadingTypes(false);
          }
        }
        
        // Fetch cities
        try {
          const citiesResponse = await citiesAPI.getCities();
          
          if (citiesResponse && Array.isArray(citiesResponse.cities) && citiesResponse.cities.length > 0) {
            const cityNames = citiesResponse.cities.map((city: any) => 
              typeof city === 'object' && city !== null ? (city.name || city.city || '') : city
            ).filter(Boolean);
            setCities(cityNames);
          } else if (citiesResponse && Array.isArray(citiesResponse) && citiesResponse.length > 0) {
            const cityNames = citiesResponse.map((city: any) => 
              typeof city === 'object' && city !== null ? (city.name || city.city || '') : city
            ).filter(Boolean);
            setCities(cityNames);
          }
        } catch (cityError) {
          console.error('Error fetching cities:', cityError);
        }
      } catch (err) {
        console.error('Failed to fetch filter data:', err);
      } finally {
        setLoadingFilters(false);
      }
    };
    
    fetchFiltersData();
    
    // Fetch jobs from API
    const fetchJobs = async () => {
      try {
        console.log('Fetching jobs from API...');
        // Use our centralized API endpoint that handles fallbacks
        // Add limit=100 to ensure we get all jobs from the database
        const response = await fetch('/api/jobs?limit=100');
        
        if (!response.ok) {
          throw new Error(`Error fetching jobs: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Jobs API response:', data);
        
        // Get the jobs array from the response
        const jobsData = data.jobs || [];
        
        console.log(`Found ${jobsData.length} jobs`);
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setLoading(false);
        
        // If we're using mock data, show a message in the console
        if (data.source === 'mock') {
          console.info('Using mock job data as backend connection failed');
        }
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
        setError('Impossible de charger les offres d\'emploi. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchJobs();
  }, [searchParams])
  
  // Helper function to extract salary information from job objects
  const extractSalaryInfo = (job: Job): { min?: number, max?: number } => {
    let min: number | undefined = undefined;
    let max: number | undefined = undefined;
    
    // Check for nested salary object
    if (job.salary && isSalaryObject(job.salary)) {
      min = job.salary.min;
      max = job.salary.max;
    } 
    // Check for direct salary properties
    else if (job.min !== undefined || job.max !== undefined) {
      min = job.min;
      max = job.max;
    }
    // Check for salary as a string with format like "1000-2000"
    else if (typeof job.salary === 'string' && job.salary.includes('-')) {
      try {
        const parts = job.salary.split('-');
        if (parts.length === 2) {
          const parsedMin = parseInt(parts[0].trim(), 10);
          const parsedMax = parseInt(parts[1].trim(), 10);
          if (!isNaN(parsedMin)) min = parsedMin;
          if (!isNaN(parsedMax)) max = parsedMax;
        }
      } catch (error) {
        console.error('Error parsing salary string:', error);
      }
    }
    // Check for single salary value
    else if (typeof job.salary === 'number') {
      min = job.salary;
      max = job.salary;
    }
    
    return { min, max };
  };
  
  // Helper function to extract category ID from job objects
  const extractCategoryId = (job: Job): string | undefined => {
    if (job.category && isCategoryObject(job.category)) {
      return job.category._id || job.category.id;
    } else if (typeof job.category === 'string') {
      return job.category;
    } else if (job.categoryId) {
      return job.categoryId;
    } else if (job.category_id) {
      return job.category_id;
    }
    return undefined;
  };
  
  // Fetch available types when category changes
  useEffect(() => {
    if (selectedCategory) {
      const fetchTypesForCategory = async () => {
        setLoadingTypes(true);
        try {
          const typesResponse = await categoriesAPI.getCategoryTypes(selectedCategory);
          if (typesResponse && Array.isArray(typesResponse.types)) {
            setAvailableTypes(typesResponse.types);
          } else {
            // Fallback: try to find types from the categories list
            const selectedCat = categories.find(cat => (cat.id || cat._id) === selectedCategory);
            if (selectedCat && selectedCat.types && Array.isArray(selectedCat.types)) {
              setAvailableTypes(selectedCat.types);
            } else {
              setAvailableTypes([]);
            }
          }
        } catch (error) {
          console.error('Error fetching types for category:', error);
          setAvailableTypes([]);
        } finally {
          setLoadingTypes(false);
        }
      };
      
      fetchTypesForCategory();
    } else {
      // If no category is selected, show all types
      setAvailableTypes(types);
    }
  }, [selectedCategory, categories]);
  
  // Apply filters when filter values change
  useEffect(() => {
    if (jobs.length === 0) return;
    
    let filtered = [...jobs];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(query) || 
        (job.description && job.description.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(job => {
        const categoryId = extractCategoryId(job);
        return categoryId === selectedCategory;
      });
    }
    
    // Filter by job type (from category)
    if (selectedType) {
      filtered = filtered.filter(job => {
        // Check different ways type might be stored
        if (job.type && typeof job.type === 'string') {
          return job.type.toLowerCase() === selectedType.toLowerCase();
        }
        return false;
      });
    }
    
    // Filter by contract type (CDI, CDD, etc.)
    if (selectedContractType) {
      filtered = filtered.filter(job => {
        // Check different ways contract type might be stored
        if (job.jobType && typeof job.jobType === 'string') {
          return job.jobType.toLowerCase() === selectedContractType.toLowerCase();
        }
        return false;
      });
    }
    
    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(job => 
        job.location?.city?.toLowerCase() === selectedCity.toLowerCase() ||
        job.city?.toLowerCase() === selectedCity.toLowerCase()
      );
    }
    
    // Filter by salary range
    if (selectedSalaryRange) {
      const [minRange, maxRange] = selectedSalaryRange.split('-').map(Number);
      filtered = filtered.filter(job => {
        // Extract salary information using our helper function
        const salaryInfo = extractSalaryInfo(job);
        const jobMin = salaryInfo.min;
        const jobMax = salaryInfo.max;
        
        // If we couldn't find any salary information, don't include this job in salary filter
        if (jobMin === undefined && jobMax === undefined) return false;
        
        // Handle different filter types
        if (maxRange) {
          // Range filter (min-max)
          // Include job if any part of its salary range overlaps with the filter range
          if (jobMin !== undefined && jobMax !== undefined) {
            // Job has a salary range - check for overlap
            return (jobMin <= maxRange && jobMax >= minRange);
          } else if (jobMin !== undefined) {
            // Job has only min salary
            return jobMin >= minRange && jobMin <= maxRange;
          } else if (jobMax !== undefined) {
            // Job has only max salary
            return jobMax >= minRange && jobMax <= maxRange;
          }
        } else {
          // Minimum salary filter (min+)
          return (jobMin !== undefined && jobMin >= minRange) || 
                 (jobMax !== undefined && jobMax >= minRange);
        }
        
        return false;
      });
    }
    
    setFilteredJobs(filtered);
  }, [jobs, selectedCategory, selectedCity, selectedSalaryRange, searchQuery, selectedType, selectedContractType])
  
  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Update the appropriate filter state
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        // Reset type when category changes
        setSelectedType('');
        break;
      case 'type':
        setSelectedType(value);
        break;
      case 'jobType':
        setSelectedContractType(value);
        break;
      case 'city':
        setSelectedCity(value);
        break;
      case 'salary':
        setSelectedSalaryRange(value);
        break;
      case 'search':
        setSearchQuery(value);
        break;
      default:
        break;
    }
  };

  // Apply filters and update URL
  const applyFilters = () => {
    // Build query params
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedType) params.append('type', selectedType);
    if (selectedContractType) params.append('jobType', selectedContractType);
    if (selectedCity) params.append('city', selectedCity);
    params.append('page', '1'); // Reset to first page when applying filters
    
    router.push(`/emploi${params.toString() ? `?${params.toString()}` : ''}`);
    setCurrentPage(1); // Reset pagination to first page
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedType('');
    setSelectedContractType('');
    setSelectedCity('');
    setSelectedSalaryRange('');
    setSearchQuery('');
    setCurrentPage(1);
    router.push('/emploi');
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    
    // Update URL with page number
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    router.push(`/emploi?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Offres d'emploi</h1>
      
      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtrer les offres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search filter */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              id="search"
              placeholder="Poste ou mot-clé"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          {/* Category filter */}
          <div className="mb-4">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id || category._id} value={category.id || category._id}>
                  {category.label || category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Job Type filter (from category) */}
          <div className="mb-4">
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Type de poste
            </label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              disabled={loadingTypes}
            >
              <option value="">Tous les types</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {loadingTypes && <p className="text-xs text-gray-500 mt-1">Chargement des types...</p>}
          </div>
          
          {/* Contract Type filter (CDI, CDD, etc.) */}
          <div className="mb-4">
            <label htmlFor="contract-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Type de contrat
            </label>
            <select
              id="contract-type-filter"
              value={selectedContractType}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tous les contrats</option>
              {contractTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          
          {/* City filter */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <select
              id="city"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedCity}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              disabled={loadingFilters}
            >
              <option value="">Toutes les villes</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>{city}</option>
              ))}
            </select>
          </div>
          
          {/* Salary filter */}
          <div>
            <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">Salaire (DH)</label>
            <select
              id="salary"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={selectedSalaryRange}
              onChange={(e) => handleFilterChange('salary', e.target.value)}
            >
              <option value="">Tous les salaires</option>
              <option value="2000-3000">2000 - 3000 DH</option>
              <option value="3000-5000">3000 - 5000 DH</option>
              <option value="5000-8000">5000 - 8000 DH</option>
              <option value="8000-12000">8000 - 12000 DH</option>
              <option value="12000">12000+ DH</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button 
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
          >
            Effacer les filtres
          </button>
          <button 
            onClick={applyFilters}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors duration-300"
          >
            Appliquer les filtres
          </button>
        </div>
        
        {/* Filter results count */}
        {!loading && (
          <div className="mt-4 text-sm text-gray-600">
            {filteredJobs.length} offre(s) d'emploi trouvée(s) {filteredJobs.length > 0 ? `• Page ${currentPage} sur ${Math.ceil(filteredJobs.length / jobsPerPage)}` : ''}
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs
                // Sort jobs by number of skills (descending)
                .sort((a, b) => {
                  const aSkills = (a.skills || a.tags || []).length;
                  const bSkills = (b.skills || b.tags || []).length;
                  return bSkills - aSkills;
                })
                // Apply pagination
                .slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)
                .map((job) => {
                  // Create a clean job object without the ID for display
                  const displayJob = {
                    ...job,
                    _id: undefined, // Explicitly remove the ID from the display object
                    company: job.company ? { ...job.company, _id: undefined } : job.company // Remove company ID if it exists
                  };
                  
                  // Calculate the number of skills
                  const skillsCount = (displayJob.skills || displayJob.tags || []).length;
                  
                  return (
                    <div key={job._id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                      <div className="p-6 flex flex-col h-full">
                        {/* Job title - fixed height */}
                        <h2 className="text-xl font-semibold mb-2 h-14 flex items-center">{displayJob.title}</h2>
                        
                        {/* Company name - fixed height */}
                        <p className="text-gray-600 mb-4 h-6">{displayJob.company?.name || 'Entreprise'}</p>
                        
                        {/* Location - fixed height */}
                        <div className="flex items-center mb-4 h-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600">{displayJob.location?.city || displayJob.city || 'Lieu non spécifié'}</span>
                        </div>
                        
                        {/* Job types section - fixed height */}
                        <div className="flex flex-wrap gap-2 mb-4 min-h-6">
                          {/* Job type badge (from category) */}
                          {displayJob.type && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {displayJob.type}
                            </span>
                          )}
                          
                          {/* Contract type badge (CDI, CDD, etc.) */}
                          {displayJob.jobType && (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {displayJob.jobType}
                            </span>
                          )}
                        </div>
                        
                        {/* Skills section - fixed height */}
                        <div className="mb-4 h-20">
                          {skillsCount > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 mb-1">Compétences requises ({skillsCount}):</p>
                              <div className="flex flex-wrap gap-2">
                                {(displayJob.skills || displayJob.tags || []).slice(0, 3).map((skill, index) => (
                                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    {skill}
                                  </span>
                                ))}
                                {skillsCount > 3 && (
                                  <span className="text-xs text-gray-500">+{skillsCount - 3} autres</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500">Aucune compétence spécifiée</p>
                          )}
                        </div>
                        
                        {/* Salary section - fixed height */}
                        <div className="flex items-center mb-4 h-6">
                          {displayJob.salary && isSalaryObject(displayJob.salary) && (displayJob.salary.min || displayJob.salary.max) ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-600">
                                {displayJob.salary.min && displayJob.salary.max 
                                  ? `${displayJob.salary.min} - ${displayJob.salary.max} DH` 
                                  : displayJob.salary.min 
                                    ? `À partir de ${displayJob.salary.min} DH` 
                                    : displayJob.salary.max 
                                      ? `Jusqu'à ${displayJob.salary.max} DH`
                                      : 'Salaire non spécifié'}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500">Salaire non spécifié</span>
                          )}
                        </div>

                        <div className="flex-grow"></div>
                        
                        {/* Sign in button - at the bottom */}
                        <div className="mt-4">
                          <Link 
                            href="/connexion"
                            className="w-full inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                          >
                            Se connecter pour voir plus
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-gray-600 text-lg">Aucune offre d'emploi disponible pour le moment.</p>
              </div>
            )}
          </div>
          
          {/* Pagination Controls */}
          {filteredJobs.length > jobsPerPage && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, Math.ceil(filteredJobs.length / jobsPerPage)) }, (_, i) => {
                  // Logic to show pages around current page
                  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near the start, show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near the end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 pages before and 2 pages after current
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      aria-current={currentPage === pageNum ? "page" : undefined}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(Math.min(Math.ceil(filteredJobs.length / jobsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(filteredJobs.length / jobsPerPage)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPage >= Math.ceil(filteredJobs.length / jobsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50'} text-sm font-medium`}
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
