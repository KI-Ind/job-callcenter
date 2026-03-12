/**
 * API service for employer dashboard
 */

// Direct backend URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Fetch wrapper with error handling and automatic JSON parsing
 */
async function fetchAPI(endpoint: string, options: RequestInit & { queryParams?: Record<string, any> } = {}) {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add authentication token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Handle query parameters if provided
  let url = `${API_URL}${endpoint}`;
  if (options.queryParams) {
    const queryString = new URLSearchParams();
    Object.entries(options.queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });
    const queryStr = queryString.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }
    // Remove queryParams from options to avoid fetch errors
    const { queryParams, ...fetchOptions } = options;
    options = fetchOptions;
  }

  const res = await fetch(url, {
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
 * Employer API service
 */
export const employerAPI = {
  // Dashboard
  getDashboardStats: async () => {
    return fetchAPI('/employeur/dashboard/stats');
  },
  
  // Applications
  getRecentApplications: async () => {
    return fetchAPI('/employeur/applications/recent');
  },
  
  // Interviews
  getUpcomingInterviews: async () => {
    return fetchAPI('/employeur/interviews/upcoming');
  },
  
  // Jobs
  getEmployerJobs: async (status?: string) => {
    const queryParams = status ? `?status=${status}` : '';
    return fetchAPI(`/employeur/jobs${queryParams}`);
  },
  
  // This createJob method has been moved to the Job listings section
  
  updateJob: async (id: string, jobData: any) => {
    return fetchAPI(`/employeur/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },
  
  // Profile management
  updateProfile: async (profileData: any) => {
    return fetchAPI('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  updatePassword: async (passwordData: any) => {
    return fetchAPI('/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
  
  // Job listings
  getJobs: async (params: any) => {
    try {
      // Try the main jobs endpoint with company filter for employer
      return await fetchAPI('/jobs', {
        method: 'GET',
        queryParams: {
          ...params,
          company: 'current' // This will be replaced with the actual company ID on the backend
        },
      });
    } catch (error) {
      // Fallback to employer-specific endpoint if it exists
      return fetchAPI('/employeur/jobs', {
        method: 'GET',
        queryParams: params,
      });
    }
  },
  
  createJob: async (jobData: Record<string, any>) => {
    console.log('Creating job with data:', jobData);
    
    try {
      // Create a clean copy of job data for submission
      const cleanJobData = { ...jobData };
      
      // Handle contractType and jobType - backend only expects jobType
      if (cleanJobData.contractType) {
        // Always use contractType as jobType if it exists
        cleanJobData.jobType = cleanJobData.contractType;
        // Remove contractType as backend doesn't expect it
        delete cleanJobData.contractType;
      }
      
      console.log('After contractType handling:', { jobType: cleanJobData.jobType });
      
      // Validate all required fields according to backend validation
      const validationErrors = [];
      
      // Required string fields with minimum length
      if (!cleanJobData.title || cleanJobData.title.length < 3) {
        validationErrors.push('Title must be at least 3 characters');
      }
      
      if (!cleanJobData.company) {
        validationErrors.push('Company ID is required');
      }
      
      if (!cleanJobData.location || !cleanJobData.location.city || cleanJobData.location.city.length < 2) {
        validationErrors.push('Location city is required and must be at least 2 characters');
      }
      
      const validJobTypes = [
        'CDI', 'CDD', 'Freelance', 'Stage', 'Temps partiel',
        'Intérim', 'Alternance / Apprentissage', 'Freelance / Indépendant', 'Autre'
      ];
      
      if (!cleanJobData.jobType || !validJobTypes.includes(cleanJobData.jobType)) {
        validationErrors.push(`Valid job type is required: ${validJobTypes.join(', ')}`);
      }
      
      if (!cleanJobData.category) {
        validationErrors.push('Category ID is required');
      }
      
      if (!cleanJobData.description || cleanJobData.description.length < 50) {
        validationErrors.push('Description is required and must be at least 50 characters');
      }
      
      if (!cleanJobData.requirements || cleanJobData.requirements.length < 50) {
        validationErrors.push('Requirements are required and must be at least 50 characters');
      }
      
      if (!cleanJobData.responsibilities || cleanJobData.responsibilities.length < 50) {
        validationErrors.push('Responsibilities are required and must be at least 50 characters');
      }
      
      if (!cleanJobData.experience || !['Débutant', '1-2 ans', '3-5 ans', '5-10 ans', '10+ ans'].includes(cleanJobData.experience)) {
        validationErrors.push('Valid experience level is required');
      }
      
      if (!cleanJobData.education || !['Bac', 'Bac+2', 'Bac+3/Licence', 'Bac+5/Master', 'Doctorat', 'Autre'].includes(cleanJobData.education)) {
        validationErrors.push('Valid education level is required');
      }
      
      // If validation errors, throw them
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Get the authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Use the API_URL from environment variable
      console.log('Creating job at backend API:', `${API_URL}/jobs`);
      console.log('Sending job data:', cleanJobData);
      
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cleanJobData),
      });
      
      // Handle non-200 responses
      if (!response.ok) {
        let errorMessage = `Job creation failed: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData && errorData.errors && errorData.errors.length > 0) {
            errorMessage = errorData.errors.map((e: any) => e.msg).join(', ');
          }
        } catch (e) {
          // If we can't parse the error as JSON, try to get it as text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage += ` - ${errorText}`;
          } catch (textError) {
            // Ignore text parsing errors
          }
        }
        
        console.error('Job creation error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Job creation successful:', data);
      return data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },
  
  deleteJob: async (jobId: string) => {
    return fetchAPI(`/employeur/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },
  
  // Company profile
  getCompanyProfile: async () => {
    try {
      // First try the main endpoint
      return await fetchAPI('/employeur/company', {
        method: 'GET',
      });
    } catch (error) {
      console.log('Error fetching from /employeur/company, trying alternative endpoint', error);
      try {
        // Try alternative endpoint
        return await fetchAPI('/company/profile', {
          method: 'GET',
        });
      } catch (secondError) {
        console.log('Error fetching from /company/profile, trying last fallback', secondError);
        // Last fallback - try to get user profile which might contain company info
        return await fetchAPI('/employeur/profile', {
          method: 'GET',
        });
      }
    }
  },
  
  updateCompanyProfile: async (companyData: any) => {
    try {
      // First try the main endpoint
      return await fetchAPI('/employeur/company', {
        method: 'PUT',
        body: JSON.stringify(companyData),
      });
    } catch (error) {
      console.log('Error updating at /employeur/company, trying alternative endpoint', error);
      try {
        // Try alternative endpoint
        return await fetchAPI('/company/profile', {
          method: 'PUT',
          body: JSON.stringify(companyData),
        });
      } catch (secondError) {
        console.log('Error updating at /company/profile, trying POST method', secondError);
        // Last fallback - try POST instead of PUT
        return await fetchAPI('/employeur/company', {
          method: 'POST',
          body: JSON.stringify(companyData),
        });
      }
    }
  },
  
  uploadCompanyLogo: async (formData: FormData) => {
    console.log('Uploading company logo to API...');
    // For file uploads, we need to remove the Content-Type header
    // so that the browser can set it with the correct boundary for the multipart/form-data
    try {
      // Try the correct upload endpoint first
      const response = await fetch(`${API_URL}/upload/company-logo`, {
        method: 'POST',
        body: formData,
        headers: {
          // We only need the Authorization header for file uploads
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Logo upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Logo upload successful:', data);
      return data;
    } catch (error) {
      console.error('Error in primary logo upload endpoint:', error);
      
      // Try alternative endpoints if the first one fails
      try {
        console.log('Trying alternative logo upload endpoint...');
        // Try the employer-specific endpoint
        const altResponse = await fetch(`${API_URL}/employeur/company/logo`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!altResponse.ok) {
          const errorText = await altResponse.text();
          console.error('Alternative logo upload failed:', altResponse.status, errorText);
          
          // Try one more alternative endpoint
          console.log('Trying second alternative logo upload endpoint...');
          const secondAltResponse = await fetch(`${API_URL}/company/logo`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (!secondAltResponse.ok) {
            const secondErrorText = await secondAltResponse.text();
            console.error('Second alternative logo upload failed:', secondAltResponse.status, secondErrorText);
            throw new Error(`Upload failed: ${secondAltResponse.status} ${secondErrorText || secondAltResponse.statusText}`);
          }
          
          const secondData = await secondAltResponse.json();
          console.log('Second alternative logo upload successful:', secondData);
          return secondData;
        }
        
        const data = await altResponse.json();
        console.log('Alternative logo upload successful:', data);
        return data;
      } catch (secondError) {
        console.error('Error in all logo upload endpoints:', secondError);
        throw secondError;
      }
    }
  },
  
  // CV Library
  getCandidates: async (params?: Record<string, any>) => {
    return fetchAPI('/candidates/search', {
      method: 'GET',
      queryParams: params,
    });
  },
  
  // Applications
  getApplications: async (params?: Record<string, any>) => {
    return fetchAPI('/employeur/applications', {
      method: 'GET',
      queryParams: params,
    });
  },
  
  getApplicationById: async (applicationId: string) => {
    try {
      console.log(`Fetching application details for ID: ${applicationId}`);
      // Try the main endpoint first
      return await fetchAPI(`/employeur/applications/${applicationId}`, {
        method: 'GET',
      });
    } catch (error) {
      console.log('Error fetching from /employeur/applications, trying alternative endpoint', error);
      try {
        // Try alternative endpoint - applications without employer prefix
        return await fetchAPI(`/applications/${applicationId}`, {
          method: 'GET',
        });
      } catch (secondError) {
        console.log('Error fetching from /applications, trying job applications endpoint', secondError);
        // Try job applications endpoint as last resort
        return await fetchAPI(`/jobs/applications/${applicationId}`, {
          method: 'GET',
        });
      }
    }
  },
  
  updateApplicationStatus: async (applicationId: string, payload: any) => {
    try {
      console.log(`Updating application status for ID: ${applicationId}`, payload);
      // Try the main endpoint first
      return await fetchAPI(`/employeur/applications/${applicationId}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.log('Error updating at /employeur/applications/status, trying alternative endpoint', error);
      try {
        // Try alternative endpoint - applications without employer prefix
        return await fetchAPI(`/applications/${applicationId}/status`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } catch (secondError) {
        console.log('Error updating at /applications/status, trying direct update endpoint', secondError);
        // Try direct update endpoint as last resort
        return await fetchAPI(`/applications/${applicationId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
    }
  },
};

export default employerAPI;
