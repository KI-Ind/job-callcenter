/**
 * API service for making requests to the backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch wrapper with error handling and automatic JSON parsing
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authentication token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }

  // For 204 No Content responses
  if (res.status === 204) {
    return null;
  }

  return res.json();
}

/**
 * Job API functions
 */
export const jobsAPI = {
  // Get all jobs with optional filters
  getJobs: async (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    try {
      return await fetchAPI(`/jobs${queryString ? `?${queryString}` : ''}`);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Try fallback endpoint
      try {
        return await fetchAPI(`/job${queryString ? `?${queryString}` : ''}`);
      } catch (fallbackError) {
        console.error('Error fetching jobs from fallback endpoint:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get job by ID
  getJob: async (id: string) => {
    try {
      return await fetchAPI(`/jobs/${id}`);
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      // Try fallback endpoint
      try {
        return await fetchAPI(`/job/${id}`);
      } catch (fallbackError) {
        console.error(`Error fetching job ${id} from fallback endpoint:`, fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get jobs by category
  getJobsByCategory: async (category: string) => {
    try {
      return await fetchAPI(`/jobs/category/${category}`);
    } catch (error) {
      console.error(`Error fetching jobs by category ${category}:`, error);
      // Try fallback endpoint with query parameter
      try {
        return await fetchAPI(`/jobs?category=${category}`);
      } catch (fallbackError) {
        console.error(`Error fetching jobs by category ${category} from fallback endpoint:`, fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get jobs by location
  getJobsByLocation: async (location: string) => {
    try {
      return await fetchAPI(`/jobs/location/${location}`);
    } catch (error) {
      console.error(`Error fetching jobs by location ${location}:`, error);
      // Try fallback endpoint with query parameter
      try {
        return await fetchAPI(`/jobs?city=${location}`);
      } catch (fallbackError) {
        console.error(`Error fetching jobs by location ${location} from fallback endpoint:`, fallbackError);
        throw fallbackError;
      }
    }
  },

  // Get cities with active job openings
  getJobCities: async () => {
    try {
      // Try the dedicated endpoint first
      return await fetchAPI('/jobs/cities');
    } catch (error) {
      console.error('Error fetching job cities:', error);
      // Try alternative endpoints
      try {
        return await fetchAPI('/cities');
      } catch (fallbackError) {
        console.error('Error fetching cities from fallback endpoint:', fallbackError);
        // If all endpoints fail, we'll fall back to extracting cities from all jobs
        throw fallbackError;
      }
    }
  },

  // Get popular categories (categories with most job openings)
  getPopularCategories: async () => {
    try {
      // Try the dedicated endpoint first
      return await fetchAPI('/jobs/categories/popular');
    } catch (error) {
      console.error('Error fetching popular categories:', error);
      // Try alternative endpoints
      try {
        return await fetchAPI('/categories/popular');
      } catch (fallbackError) {
        console.error('Error fetching popular categories from fallback endpoint:', fallbackError);
        throw fallbackError;
      }
    }
  },

  // Search jobs
  searchJobs: async (query: string, city?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (city && city !== 'Toutes les villes') {
      params.append('city', city);
    }
    
    try {
      return await fetchAPI(`/jobs/search?${params.toString()}`);
    } catch (error) {
      console.error('Error searching jobs:', error);
      // Try fallback endpoint
      try {
        return await fetchAPI(`/jobs?${params.toString()}`);
      } catch (fallbackError) {
        console.error('Error searching jobs from fallback endpoint:', fallbackError);
        throw fallbackError;
      }
    }
  },
};

/**
 * Company API functions
 */
export const companiesAPI = {
  // Get all companies
  getCompanies: async () => {
    try {
      // Try multiple endpoints to get companies
      const endpoints = [
        '/companies',
        '/employers',
        '/api/companies',
        '/api/employers'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              return { companies: response };
            } else if (response.companies && Array.isArray(response.companies)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return { companies: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching companies from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints fail, try to extract company data from jobs
      console.log('Falling back to extracting companies from jobs');
      try {
        const jobsResponse = await jobsAPI.getJobs();
        let jobs = [];
        
        if (Array.isArray(jobsResponse)) {
          jobs = jobsResponse;
        } else if (jobsResponse && Array.isArray(jobsResponse.jobs)) {
          jobs = jobsResponse.jobs;
        } else if (jobsResponse && jobsResponse.data && Array.isArray(jobsResponse.data)) {
          jobs = jobsResponse.data;
        }
        
        // Extract unique companies from jobs
        const companiesMap = new Map<string, any>();
        
        jobs.forEach((job: any) => {
          if (job.company) {
            const companyId = job.company._id || job.company.id;
            if (companyId && !companiesMap.has(companyId)) {
              companiesMap.set(companyId, {
                _id: companyId,
                name: job.company.name,
                jobCount: 1
              });
            } else if (companyId) {
              const company = companiesMap.get(companyId);
              company.jobCount = (company.jobCount || 0) + 1;
              companiesMap.set(companyId, company);
            }
          } else if (job.companyName) {
            // Handle case where company is just a name string
            const companyName = job.companyName;
            if (!companiesMap.has(companyName)) {
              companiesMap.set(companyName, {
                _id: `company-${companiesMap.size + 1}`,
                name: companyName,
                jobCount: 1
              });
            } else {
              const company = companiesMap.get(companyName);
              company.jobCount = (company.jobCount || 0) + 1;
              companiesMap.set(companyName, company);
            }
          }
        });
        
        return { companies: Array.from(companiesMap.values()) };
      } catch (jobsError) {
        console.error('Error extracting companies from jobs:', jobsError);
        return { companies: [] };
      }
    } catch (error) {
      console.error('Error in companiesAPI.getCompanies:', error);
      return { companies: [] };
    }
  },
  
  // Get companies with the most job listings
  getTopCompanies: async (limit = 4) => {
    try {
      // First try dedicated endpoints for companies with job counts
      const endpoints = [
        '/companies/top',
        '/employers/top',
        '/api/companies/top',
        '/api/employers/top',
        '/companies/stats',
        '/employers/stats',
        '/api/companies/stats',
        '/api/employers/stats'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch top companies from endpoint: ${endpoint}`);
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              console.log('Got array response from endpoint', endpoint, response);
              return { companies: response.slice(0, limit) };
            } else if (response.companies && Array.isArray(response.companies)) {
              console.log('Got companies array in response from endpoint', endpoint, response.companies);
              return { companies: response.companies.slice(0, limit) };
            } else if (response.data && Array.isArray(response.data)) {
              console.log('Got data array in response from endpoint', endpoint, response.data);
              return { companies: response.data.slice(0, limit) };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching top companies from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If dedicated endpoints fail, try to get job counts by querying jobs
      console.log('Dedicated top company endpoints failed, trying to count jobs per company');
      
      // Fetch all jobs and count by company
      try {
        // Fetch all jobs with a high limit to ensure we get everything
        const jobsResponse = await jobsAPI.getJobs({ limit: '100' });
        let jobs = [];
        
        if (Array.isArray(jobsResponse)) {
          jobs = jobsResponse;
        } else if (jobsResponse && Array.isArray(jobsResponse.jobs)) {
          jobs = jobsResponse.jobs;
        } else if (jobsResponse && jobsResponse.data && Array.isArray(jobsResponse.data)) {
          jobs = jobsResponse.data;
        }
        
        console.log('Fetched jobs for company counting:', jobs.length);
        
        // Count jobs by company
        const companyJobCounts = new Map<string, any>();
        
        jobs.forEach((job: any) => {
          if (job.company) {
            const companyId = job.company._id || job.company.id;
            const companyName = job.company.name;
            
            if (companyId && !companyJobCounts.has(companyId)) {
              companyJobCounts.set(companyId, {
                _id: companyId,
                name: companyName,
                jobCount: 1
              });
            } else if (companyId) {
              const company = companyJobCounts.get(companyId);
              company.jobCount = (company.jobCount || 0) + 1;
              companyJobCounts.set(companyId, company);
            }
          } else if (job.companyName) {
            const companyName = job.companyName;
            
            if (!companyJobCounts.has(companyName)) {
              companyJobCounts.set(companyName, {
                _id: `company-${companyJobCounts.size + 1}`,
                name: companyName,
                jobCount: 1
              });
            } else {
              const company = companyJobCounts.get(companyName);
              company.jobCount = (company.jobCount || 0) + 1;
              companyJobCounts.set(companyName, company);
            }
          }
        });
        
        // Convert to array, sort by job count, and limit
        const companies = Array.from(companyJobCounts.values())
          .sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0))
          .slice(0, limit);
        
        console.log('Companies with job counts:', companies);
        return { companies };
      } catch (jobsError) {
        console.error('Error counting jobs by company:', jobsError);
      }
      
      // Fall back to regular company list if all else fails
      const companiesResponse = await companiesAPI.getCompanies();
      
      if (companiesResponse && Array.isArray(companiesResponse.companies)) {
        // Sort companies by job count
        const sortedCompanies = [...companiesResponse.companies]
          .sort((a, b) => (b.jobCount || 0) - (a.jobCount || 0))
          .slice(0, limit);
          
        return { companies: sortedCompanies };
      }
      
      return { companies: [] };
    } catch (error) {
      console.error('Error in companiesAPI.getTopCompanies:', error);
      return { companies: [] };
    }
  },

  // Get company by ID
  getCompany: async (id: string) => {
    try {
      // Try multiple endpoints to get company by ID
      const endpoints = [
        `/companies/${id}`,
        `/employers/${id}`,
        `/api/companies/${id}`,
        `/api/employers/${id}`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) return response;
        } catch (endpointError) {
          console.error(`Error fetching company from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      throw new Error(`Company with ID ${id} not found`);
    } catch (error) {
      console.error(`Error in companiesAPI.getCompany:`, error);
      throw error;
    }
  },

  // Get jobs by company
  getCompanyJobs: async (id: string) => {
    try {
      // Try multiple endpoints to get company jobs
      const endpoints = [
        `/companies/${id}/jobs`,
        `/employers/${id}/jobs`,
        `/jobs?company=${id}`,
        `/api/companies/${id}/jobs`,
        `/api/employers/${id}/jobs`
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              return { jobs: response };
            } else if (response.jobs && Array.isArray(response.jobs)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return { jobs: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching company jobs from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints fail, try to filter all jobs by company ID
      try {
        const allJobs = await jobsAPI.getJobs();
        let jobs = [];
        
        if (Array.isArray(allJobs)) {
          jobs = allJobs;
        } else if (allJobs && Array.isArray(allJobs.jobs)) {
          jobs = allJobs.jobs;
        } else if (allJobs && allJobs.data && Array.isArray(allJobs.data)) {
          jobs = allJobs.data;
        }
        
        // Filter jobs by company ID
        const companyJobs = jobs.filter((job: any) => {
          if (job.company && (job.company._id === id || job.company.id === id)) {
            return true;
          }
          return false;
        });
        
        return { jobs: companyJobs };
      } catch (jobsError) {
        console.error('Error filtering jobs by company:', jobsError);
        return { jobs: [] };
      }
    } catch (error) {
      console.error(`Error in companiesAPI.getCompanyJobs:`, error);
      return { jobs: [] };
    }
  }
};

/**
 * Categories API functions
 */
export const categoriesAPI = {
  // Get all categories
  getCategories: async () => {
    try {
      // Try multiple endpoints to get categories
      const endpoints = [
        '/categories',
        '/jobs/categories',
        '/api/categories',
        '/api/jobs/categories'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              return { categories: response };
            } else if (response.categories && Array.isArray(response.categories)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return { categories: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching categories from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints fail, try to extract categories from jobs
      try {
        const jobsResponse = await fetchAPI('/jobs');
        if (jobsResponse) {
          const jobs = Array.isArray(jobsResponse) ? jobsResponse : 
                     (jobsResponse.jobs && Array.isArray(jobsResponse.jobs)) ? jobsResponse.jobs :
                     (jobsResponse.data && Array.isArray(jobsResponse.data)) ? jobsResponse.data : [];
          
          // Extract unique categories from jobs and count occurrences
          const categoryCounts = new Map();
          const categoryNames = new Map();
          
          jobs.forEach((job: any) => {
            const categoryId = job.category?._id || job.category?.id || job.categoryId;
            const categoryName = job.category?.name || job.category?.label || 'Uncategorized';
            
            if (categoryId) {
              categoryCounts.set(categoryId, (categoryCounts.get(categoryId) || 0) + 1);
              categoryNames.set(categoryId, categoryName);
            }
          });
          
          // Convert to array of category objects
          const categories = Array.from(categoryCounts.entries()).map(([id, count]) => ({
            _id: id,
            id: id,
            name: categoryNames.get(id),
            label: categoryNames.get(id),
            jobCount: count
          }));
          
          if (categories.length > 0) {
            return { categories };
          }
        }
      } catch (jobsError) {
        console.error('Error extracting categories from jobs:', jobsError);
      }
      
      // If all attempts fail, return fallback categories with the updated structure
      console.log('Using fallback categories data');
      const fallbackCategories = [
        { _id: '1', id: '1', name: 'Call Center', label: 'Call Center', types: ['Outbound', 'Inbound', 'Back Office', 'Telemarketing', 'Appointment Setting'] },
        { _id: '2', id: '2', name: 'Support Multicanal', label: 'Support Multicanal', types: ['Live Chat', 'Email Handling', 'Social Media', 'Claims'] },
        { _id: '3', id: '3', name: 'Support Technique', label: 'Support Technique', types: ['Hotline', 'Level 1', 'Level 2', 'Diagnostics'] },
        { _id: '4', id: '4', name: 'Back Office', label: 'Back Office', types: ['Data Entry', 'File Processing', 'Verification'] },
        { _id: '5', id: '5', name: 'Télétravail & Freelance', label: 'Télétravail & Freelance', types: ['Remote Work', 'Hybrid', 'Freelance', 'Part-time'] },
        { _id: '6', id: '6', name: 'Gestion d\'Équipe', label: 'Gestion d\'Équipe', types: ['Team Leader', 'Supervisor', 'Floor Manager', 'Quality Manager'] },
        { _id: '7', id: '7', name: 'Formation & Qualité', label: 'Formation & Qualité', types: ['Trainer', 'Coach', 'Quality Analyst', 'Facilitator'] },
        { _id: '8', id: '8', name: 'Recrutement & RH', label: 'Recrutement & RH', types: ['Recruiter', 'HR Assistant', 'Admin & Payroll'] },
        { _id: '9', id: '9', name: 'Stages & Apprentissages', label: 'Stages & Apprentissages', types: ['Intern – Operations', 'Intern – HR', 'Apprentice'] }
      ];
      return { categories: fallbackCategories };
    } catch (error) {
      console.error('Error in categoriesAPI.getCategories:', error);
      // Return fallback categories with the updated structure
      const fallbackCategories = [
        { _id: '1', id: '1', name: 'Call Center', label: 'Call Center', types: ['Outbound', 'Inbound', 'Back Office', 'Telemarketing', 'Appointment Setting'] },
        { _id: '2', id: '2', name: 'Support Multicanal', label: 'Support Multicanal', types: ['Live Chat', 'Email Handling', 'Social Media', 'Claims'] },
        { _id: '3', id: '3', name: 'Support Technique', label: 'Support Technique', types: ['Hotline', 'Level 1', 'Level 2', 'Diagnostics'] },
        { _id: '4', id: '4', name: 'Back Office', label: 'Back Office', types: ['Data Entry', 'File Processing', 'Verification'] },
        { _id: '5', id: '5', name: 'Télétravail & Freelance', label: 'Télétravail & Freelance', types: ['Remote Work', 'Hybrid', 'Freelance', 'Part-time'] },
        { _id: '6', id: '6', name: 'Gestion d\'Équipe', label: 'Gestion d\'Équipe', types: ['Team Leader', 'Supervisor', 'Floor Manager', 'Quality Manager'] },
        { _id: '7', id: '7', name: 'Formation & Qualité', label: 'Formation & Qualité', types: ['Trainer', 'Coach', 'Quality Analyst', 'Facilitator'] },
        { _id: '8', id: '8', name: 'Recrutement & RH', label: 'Recrutement & RH', types: ['Recruiter', 'HR Assistant', 'Admin & Payroll'] },
        { _id: '9', id: '9', name: 'Stages & Apprentissages', label: 'Stages & Apprentissages', types: ['Intern – Operations', 'Intern – HR', 'Apprentice'] }
      ];
      return { categories: fallbackCategories };
    }
  },
  
  // Get types for a specific category
  getCategoryTypes: async (categoryId: string) => {
    try {
      console.log(`Fetching types for category ID: ${categoryId}`);
      
      // Try multiple endpoints to get types for a specific category
      const endpoints = [
        `/categories/${categoryId}/types`,
        `/jobs/categories/${categoryId}/types`,
        `/api/categories/${categoryId}/types`
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              console.log(`Found ${response.length} types via ${endpoint}`);
              return { types: response };
            } else if (response.types && Array.isArray(response.types)) {
              console.log(`Found ${response.types.length} types via ${endpoint}`);
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              console.log(`Found ${response.data.length} types via ${endpoint}`);
              return { types: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching types from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If dedicated endpoints fail, try to extract types from the categories list
      console.log('Falling back to extracting types from categories list');
      const categoriesResponse = await categoriesAPI.getCategories();
      
      if (categoriesResponse && categoriesResponse.categories) {
        const categories = categoriesResponse.categories;
        const category = categories.find((cat: any) => 
          cat._id === categoryId || cat.id === categoryId
        );
        
        if (category && category.types && Array.isArray(category.types)) {
          console.log(`Found ${category.types.length} types from category object`);
          return { types: category.types };
        }
      }
      
      // If all attempts fail, return fallback types for the specified category
      console.log('Using fallback types data for category');
      const fallbackCategories = [
        { _id: '1', id: '1', name: 'Call Center', types: ['Outbound', 'Inbound', 'Back Office', 'Telemarketing', 'Appointment Setting'] },
        { _id: '2', id: '2', name: 'Support Multicanal', types: ['Live Chat', 'Email Handling', 'Social Media', 'Claims'] },
        { _id: '3', id: '3', name: 'Support Technique', types: ['Hotline', 'Level 1', 'Level 2', 'Diagnostics'] },
        { _id: '4', id: '4', name: 'Back Office', types: ['Data Entry', 'File Processing', 'Verification'] },
        { _id: '5', id: '5', name: 'Télétravail & Freelance', types: ['Remote Work', 'Hybrid', 'Freelance', 'Part-time'] },
        { _id: '6', id: '6', name: 'Gestion d\'Équipe', types: ['Team Leader', 'Supervisor', 'Floor Manager', 'Quality Manager'] },
        { _id: '7', id: '7', name: 'Formation & Qualité', types: ['Trainer', 'Coach', 'Quality Analyst', 'Facilitator'] },
        { _id: '8', id: '8', name: 'Recrutement & RH', types: ['Recruiter', 'HR Assistant', 'Admin & Payroll'] },
        { _id: '9', id: '9', name: 'Stages & Apprentissages', types: ['Intern – Operations', 'Intern – HR', 'Apprentice'] }
      ];
      
      const fallbackCategory = fallbackCategories.find(cat => cat._id === categoryId || cat.id === categoryId);
      if (fallbackCategory) {
        console.log(`Using fallback types for category ${fallbackCategory.name}:`, fallbackCategory.types);
        return { types: fallbackCategory.types };
      }
      
      return { types: [] };
    } catch (error) {
      console.error('Error in categoriesAPI.getCategoryTypes:', error);
      return { types: [] };
    }
  },
  
  // Get all unique types from all categories
  getAllTypes: async () => {
    try {
      // Try multiple endpoints to get all types
      const endpoints = [
        '/types',
        '/jobs/types',
        '/categories/types',
        '/api/types',
        '/api/jobs/types',
        '/api/categories/types'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch all types from endpoint: ${endpoint}`);
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              console.log(`Found ${response.length} types via ${endpoint}`);
              return { types: response };
            } else if (response.types && Array.isArray(response.types)) {
              console.log(`Found ${response.types.length} types via ${endpoint}`);
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              console.log(`Found ${response.data.length} types via ${endpoint}`);
              return { types: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching all types from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If dedicated endpoints fail, try to extract types from all categories
      console.log('Falling back to extracting types from all categories');
      const categoriesResponse = await categoriesAPI.getCategories();
      
      if (categoriesResponse && categoriesResponse.categories) {
        const categories = categoriesResponse.categories;
        const allTypes = new Set<string>();
        
        // Extract types from each category
        categories.forEach((category: any) => {
          if (category.types && Array.isArray(category.types)) {
            category.types.forEach((type: string) => allTypes.add(type));
          }
        });
        
        const uniqueTypes = Array.from(allTypes);
        console.log(`Extracted ${uniqueTypes.length} unique types from categories`);
        return { types: uniqueTypes };
      }
      
      // If all attempts fail, return fallback types
      console.log('Using fallback types data');
      const fallbackTypes = [
        'Outbound', 'Inbound', 'Back Office', 'Telemarketing', 'Appointment Setting',
        'Live Chat', 'Email Handling', 'Social Media', 'Claims',
        'Hotline', 'Level 1', 'Level 2', 'Diagnostics',
        'Data Entry', 'File Processing', 'Verification',
        'Remote Work', 'Hybrid', 'Freelance', 'Part-time',
        'Team Leader', 'Supervisor', 'Floor Manager', 'Quality Manager',
        'Trainer', 'Coach', 'Quality Analyst', 'Facilitator',
        'Recruiter', 'HR Assistant', 'Admin & Payroll',
        'Intern – Operations', 'Intern – HR', 'Apprentice'
      ];
      return { types: fallbackTypes };
    } catch (error) {
      console.error('Error in categoriesAPI.getAllTypes:', error);
      return { types: [] };
    }
  },
  
  // Get popular categories
  getPopularCategories: async () => {
    try {
      // Try multiple endpoints to get popular categories, starting with the correct one
      const endpoints = [
        '/categories/with-counts',  // This is the correct endpoint from the backend
        '/categories/popular',
        '/jobs/categories/popular',
        '/api/categories/with-counts',
        '/api/categories/popular'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              return { categories: response };
            } else if (response.categories && Array.isArray(response.categories)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return { categories: response.data };
            } else if (response.success && response.data && Array.isArray(response.data)) {
              // This matches the backend format from getCategoriesWithCounts
              return { categories: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching popular categories from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If dedicated endpoints fail, fall back to getting all categories and sorting by job count
      console.log('Falling back to getting all categories and sorting by job count');
      const allCategoriesResponse = await categoriesAPI.getCategories();
      
      if (allCategoriesResponse) {
        let categories = [];
        
        // Handle different response formats
        if (Array.isArray(allCategoriesResponse)) {
          categories = allCategoriesResponse;
        } else if (allCategoriesResponse.categories && Array.isArray(allCategoriesResponse.categories)) {
          categories = allCategoriesResponse.categories;
        } else if (allCategoriesResponse.data && Array.isArray(allCategoriesResponse.data)) {
          categories = allCategoriesResponse.data;
        }
        
        if (categories.length > 0) {
          // Sort categories by job count
          const sortedCategories = [...categories]
            .sort((a, b) => (b.jobCount || b.count || 0) - (a.jobCount || a.count || 0));
            
          return { categories: sortedCategories };
        }
      }
      
      // Return empty array if all attempts fail
      return { categories: [] };
    } catch (error) {
      console.error('Error in categoriesAPI.getPopularCategories:', error);
      return { categories: [] };
    }
  }
};

/**
 * Cities API functions
 */
export const citiesAPI = {
  getCities: async () => {
    try {
      // Try multiple endpoints with fallback logic
      const endpoints = [
        '/cities',
        '/jobs/cities',
        '/api/cities',
        '/api/jobs/cities'
      ];
      
      // Try each endpoint in sequence
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              return { cities: response };
            } else if (response.cities && Array.isArray(response.cities)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return { cities: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching cities from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If all endpoints fail, try to extract cities from jobs
      try {
        const jobsResponse = await fetchAPI('/jobs');
        if (jobsResponse) {
          const jobs = Array.isArray(jobsResponse) ? jobsResponse : 
                     (jobsResponse.jobs && Array.isArray(jobsResponse.jobs)) ? jobsResponse.jobs :
                     (jobsResponse.data && Array.isArray(jobsResponse.data)) ? jobsResponse.data : [];
          
          // Extract unique cities from jobs
          const cityValues = jobs
            .map((job: any) => job.location?.city || job.city)
            .filter(Boolean);
          const cities = Array.from(new Set<string>(cityValues));
          
          if (cities.length > 0) {
            return { cities };
          }
        }
      } catch (jobsError) {
        console.error('Error extracting cities from jobs:', jobsError);
      }
      
      // Return empty array if all attempts fail
      return { cities: [] };
    } catch (error) {
      console.error('Error in citiesAPI.getCities:', error);
      return { cities: [] };
    }
  }
};

/**
 * User API functions (for authentication)
 */
export const userAPI = {
  // Register a new user
  register: async (userData: any) => {
    return fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    return fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

/**
 * Newsletter API functions
 */
export const newsletterAPI = {
  // Subscribe to newsletter
  subscribe: async (email: string) => {
    try {
      // First check if email already exists
      try {
        const checkEndpoints = [
          `/newsletter/check?email=${encodeURIComponent(email)}`,
          `/api/newsletter/check?email=${encodeURIComponent(email)}`,
          `/subscribers/check?email=${encodeURIComponent(email)}`,
          `/api/subscribers/check?email=${encodeURIComponent(email)}`
        ];
        
        for (const endpoint of checkEndpoints) {
          try {
            console.log(`Checking if email already exists: ${endpoint}`);
            const response = await fetchAPI(endpoint);
            
            // If we get a response and it indicates the email exists
            if (response) {
              if (response.exists || response.isSubscribed || 
                  (response.subscriber && response.subscriber.email === email)) {
                throw new Error('Cet email est déjà inscrit à notre newsletter.');
              }
            }
          } catch (checkError) {
            if (checkError instanceof Error && 
                checkError.message === 'Cet email est déjà inscrit à notre newsletter.') {
              throw checkError; // Re-throw our custom error
            }
            console.error(`Error checking email existence via ${endpoint}:`, checkError);
            // Continue to next endpoint
          }
        }
      } catch (existsError) {
        if (existsError instanceof Error && 
            existsError.message === 'Cet email est déjà inscrit à notre newsletter.') {
          throw existsError; // Re-throw our custom error
        }
        // If it's another error, we'll continue with subscription attempt
        console.warn('Could not verify if email exists, proceeding with subscription:', existsError);
      }
      
      // Try multiple endpoints for newsletter subscription
      const endpoints = [
        '/newsletter/subscribe',
        '/api/newsletter/subscribe',
        '/subscribers/add',
        '/api/subscribers/add',
        '/newsletter',
        '/api/newsletter'
      ];
      
      const data = { 
        email,
        subscriptionDate: new Date().toISOString(),
        status: 'active',
        source: 'website'
      };
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to subscribe to newsletter via endpoint: ${endpoint}`);
          const response = await fetchAPI(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
          });
          
          if (response) {
            // Check if response indicates duplicate email
            if (response.error && (
                response.error.includes('already exists') ||
                response.error.includes('duplicate') ||
                response.error.includes('already subscribed')
              )) {
              throw new Error('Cet email est déjà inscrit à notre newsletter.');
            }
            
            console.log('Newsletter subscription successful:', response);
            return response;
          }
        } catch (endpointError) {
          // Check if error message indicates duplicate email
          if (endpointError instanceof Error && endpointError.message && (
              endpointError.message.includes('already exists') ||
              endpointError.message.includes('duplicate') ||
              endpointError.message.includes('already subscribed')
            )) {
            throw new Error('Cet email est déjà inscrit à notre newsletter.');
          }
          
          console.error(`Error subscribing to newsletter via ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      // If all API endpoints fail, we can't proceed with the subscription
      console.error('All newsletter subscription endpoints failed');
      throw new Error('Impossible de se connecter au serveur. Veuillez réessayer plus tard.');
    } catch (error) {
      console.error('Error in newsletterAPI.subscribe:', error);
      throw error;
    }
  },
  
  // Get all newsletter subscribers (admin function)
  getSubscribers: async () => {
    try {
      const endpoints = [
        '/newsletter/subscribers',
        '/api/newsletter/subscribers',
        '/subscribers',
        '/api/subscribers'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetchAPI(endpoint);
          if (response) {
            // Handle different response formats
            if (Array.isArray(response)) {
              return { subscribers: response };
            } else if (response.subscribers && Array.isArray(response.subscribers)) {
              return response;
            } else if (response.data && Array.isArray(response.data)) {
              return { subscribers: response.data };
            }
          }
        } catch (endpointError) {
          console.error(`Error fetching subscribers from ${endpoint}:`, endpointError);
          // Continue to next endpoint
        }
      }
      
      return { subscribers: [] };
    } catch (error) {
      console.error('Error in newsletterAPI.getSubscribers:', error);
      return { subscribers: [] };
    }
  }
};

/**
 * Notification API functions
 */
export const notificationsAPI = {
  // Get all notifications
  getNotifications: async () => {
    return fetchAPI('/candidat/notifications');
  },

  // Mark notification as read
  markAsRead: async (id: string) => {
    return fetchAPI(`/candidat/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    return fetchAPI('/candidat/notifications/read-all', {
      method: 'PUT'
    });
  },

  // Delete notification
  deleteNotification: async (id: string) => {
    return fetchAPI(`/candidat/notifications/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * Dashboard API functions
 */
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await fetchAPI('/candidat/dashboard/stats')
      console.log('Dashboard stats API response:', response)
      return response.data || response
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return { success: false, error: 'Failed to fetch dashboard statistics' }
    }
  },
  getRecentActivities: async () => {
    try {
      const response = await fetchAPI('/candidat/dashboard/recent-activities')
      return response.data
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      return { success: false, error: 'Failed to fetch recent activities' }
    }
  }
};

/**
 * Interview API functions
 */
export const interviewsAPI = {
  // Get upcoming interviews
  getUpcomingInterviews: async () => {
    return fetchAPI('/candidat/interviews/upcoming');
  },

  // Get interview details
  getInterview: async (id: string) => {
    return fetchAPI(`/candidat/interviews/${id}`);
  }
};

/**
 * Admin API functions
 */
export const adminAPI = {
  // Admin login
  login: async (credentials: { email: string; password: string }) => {
    return fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  // Get all users
  getUsers: async () => {
    try {
      return await fetchAPI('/admin/users');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Toggle user status (active/inactive)
  toggleUserStatus: async (userId: string) => {
    return fetchAPI(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT'
    });
  },
  
  // Reset user password
  resetUserPassword: async (userId: string) => {
    return fetchAPI(`/admin/users/${userId}/reset-password`, {
      method: 'POST'
    });
  },
  
  // Send notification to user
  sendUserNotification: async (userId: string, message: string) => {
    return fetchAPI(`/admin/users/${userId}/send-notification`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },
  
  // Get all applications
  getApplications: async () => {
    try {
      return await fetchAPI('/admin/applications');
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },
  
  // Update application status
  updateApplicationStatus: async (appId: string, status: string) => {
    return fetchAPI(`/admin/applications/${appId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },
  
  // Get dashboard stats
  getDashboardStats: async () => {
    return fetchAPI('/admin/dashboard');
  }
};

export default {
  jobs: jobsAPI,
  companies: companiesAPI,
  categories: categoriesAPI,
  cities: citiesAPI,
  user: userAPI,
  newsletter: newsletterAPI,
  notifications: notificationsAPI,
  interviews: interviewsAPI,
  admin: adminAPI
};
