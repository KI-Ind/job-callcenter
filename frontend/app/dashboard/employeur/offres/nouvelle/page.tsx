'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../../contexts/AuthContext'
import employerAPI from '../../../../../app/lib/employerApi'
import cityService from '@/services/cityService'

export default function NouvelleOffre() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [categories, setCategories] = useState<Array<{ _id: string, name: string, slug: string, description: string, icon: string, types?: Array<string | {name: string, _id?: string}> }>>([])
  const [cities, setCities] = useState<Array<{ _id: string, name: string, postalCode: string }>>([])
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [userCompany, setUserCompany] = useState<any>(null);

  type JobFormData = {
    title: string
    description: string
    requirements: string
    responsibilities: string
    benefits: string
    location: string
    jobType: string
    contractType: string
    category: string
    experience: string
    education: string
    contactEmail: string
    contactPhone: string
    tags: string[]
    status: string
    salary: {
      min: string
      max: string
      currency: string
      period: string
      isDisplayed: boolean
    }
    applicationDeadline: string
    applicationEmail: string
    applicationUrl: string
    applicationPhone: string
    applicationFormUrl: string
    applicationInstructions: string
    isRemote: boolean
    hasFlexibleHours: boolean
    experienceYears: number
    educationLevel: string
    skills: string[]
    languages: string[]
    companyDescription: string
    companyLogo: string
    companyWebsite: string
    companyIndustry: string
    companySize: string
    companyLocation: string
    companyName: string
    customQuestions: Array<{ question: string; required: boolean }>
  }

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    location: '',
    jobType: '',
    contractType: '',
    category: '',
    experience: 'Débutant',
    education: 'Bac',
    contactEmail: '',
    contactPhone: '',
    tags: [],
    status: 'draft',
    salary: {
      min: '',
      max: '',
      currency: 'MAD',
      period: 'month',
      isDisplayed: true
    },
    applicationDeadline: '',
    applicationEmail: '',
    applicationUrl: '',
    applicationPhone: '',
    applicationFormUrl: '',
    applicationInstructions: '',
    isRemote: false,
    hasFlexibleHours: false,
    experienceYears: 0,
    educationLevel: '',
    skills: [],
    languages: [],
    companyDescription: '',
    companyLogo: '',
    companyWebsite: '',
    companyIndustry: '',
    companySize: '',
    companyLocation: '',
    companyName: '',
    customQuestions: []
  })

  const fetchCategories = async () => {
    try {
      let response;
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/categories`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }).then(res => res.json());
      } catch (error) {
        response = null;
      }
      
      if (response && response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        const staticCategories = [
          {
            _id: "call-center",
            name: "Centre d'appels",
            slug: "centre-appels",
            description: "Emplois dans les centres d'appels et services client",
            icon: "call",
            types: ["Outbound", "Inbound", "Back Office", "Telemarketing", "Appointment Setting"]
          },
          {
            _id: "support-multicanal",
            name: "Support Multicanal",
            slug: "support-multicanal",
            description: "Emplois dans le support client multicanal",
            icon: "support",
            types: ["Live Chat", "Email Handling", "Social Media", "Claims"]
          },
          {
            _id: "support-technique",
            name: "Support Technique",
            slug: "support-technique",
            description: "Emplois dans le support technique",
            icon: "computer",
            types: ["Hotline", "Level 1", "Level 2", "Diagnostics"]
          },
          {
            _id: "back-office",
            name: "Back Office",
            slug: "back-office",
            description: "Emplois administratifs et de traitement de données",
            icon: "work",
            types: ["Data Entry", "File Processing", "Verification"]
          },
          {
            _id: "teletravail-freelance",
            name: "Télétravail & Freelance",
            slug: "teletravail-freelance",
            description: "Emplois à distance et freelance",
            icon: "home",
            types: ["Remote Work", "Hybrid", "Freelance", "Part-time"]
          },
          {
            _id: "gestion-equipe",
            name: "Gestion d'Équipe",
            slug: "gestion-equipe",
            description: "Emplois de supervision et gestion d'équipe",
            icon: "people",
            types: ["Team Leader", "Supervisor", "Floor Manager", "Quality Manager"]
          },
          {
            _id: "formation-qualite",
            name: "Formation & Qualité",
            slug: "formation-qualite",
            description: "Emplois dans la formation et l'assurance qualité",
            icon: "school",
            types: ["Trainer", "Coach", "Quality Analyst", "Facilitator"]
          },
          {
            _id: "recrutement-rh",
            name: "Recrutement & RH",
            slug: "recrutement-rh",
            description: "Emplois dans les ressources humaines",
            icon: "person",
            types: ["Recruiter", "HR Assistant", "Admin & Payroll"]
          },
          {
            _id: "stages-apprentissages",
            name: "Stages & Apprentissages",
            slug: "stages-apprentissages",
            description: "Opportunités pour les stagiaires et apprentis",
            icon: "school",
            types: ["Intern – Operations", "Intern – HR", "Apprentice"]
          },
          {
            _id: "other",
            name: "Autres",
            slug: "autres",
            description: "Autres types d'emplois qui ne correspondent pas aux catégories existantes",
            icon: "more_horiz"
          }
        ];
        setCategories(staticCategories);
        console.log('Using fallback categories data with types');
      }
    } catch (err) {
      console.error('Error in fetchCategories:', err);
      // Final fallback if everything fails
      const basicCategories = [
        {
          _id: "call-center",
          name: "Centre d'appels",
          slug: "centre-appels",
          description: "Emplois dans les centres d'appels et services client",
          icon: "call",
          types: ["Outbound", "Inbound", "Back Office"]
        },
        {
          _id: "other",
          name: "Autres",
          slug: "autres",
          description: "Autres types d'emplois qui ne correspondent pas aux catégories existantes",
          icon: "more_horiz"
        }
      ];
      setCategories(basicCategories);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        await fetchCategories();
        
        // Fetch cities
        try {
          console.log('Fetching cities for job posting form...');
          const citiesResponse = await cityService.getAllCities();
          console.log('Cities API response:', citiesResponse);
          
          if (citiesResponse && citiesResponse.data && citiesResponse.data.success) {
            console.log('Cities loaded successfully:', citiesResponse.data.data);
            setCities(citiesResponse.data.data);
          } else {
            console.error('Failed to fetch cities:', citiesResponse);
            // Fallback to static cities if needed
            import('../../../../../data/moroccanCities').then(module => {
              const moroccanCities = module.default;
              const formattedCities = moroccanCities.map(city => ({
                _id: city.city,
                name: city.city,
                postalCode: city.postalCode
              }));
              setCities(formattedCities);
              console.log('Using fallback cities data');
            });
          }
        } catch (error) {
          console.error('Error fetching cities:', error);
        }
        
        // Fetch user company profile
        try {
          console.log('Fetching company profile...');
          const token = localStorage.getItem('token');
          console.log('Auth token available:', !!token);
          
          // Fix the API endpoint URL to match the backend route
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/employeur/company`;
          console.log('Fetching from URL:', apiUrl);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('API response status:', response.status);
          const userCompanyResponse = await response.json();
          console.log('Full company profile response:', userCompanyResponse);
          
          if (userCompanyResponse.success) {
            console.log('Company profile loaded successfully');
            const companyData = userCompanyResponse.data;
            console.log('Company data structure:', Object.keys(companyData));
            setUserCompany(companyData);
            
            // Check for contact information fields - prioritize contactEmail and contactPhone fields
            const email = companyData.contactEmail || companyData.email || '';
            const phone = companyData.contactPhone || companyData.phone || '';
            
            console.log('Found contact info:', { email, phone });
            
            // Always auto-populate contact information from company profile
            setFormData(prevData => {
              const updatedData = {
                ...prevData,
                contactEmail: email || '',
                contactPhone: phone || ''
              };
              console.log('Updated form data with contact info:', updatedData);
              return updatedData;
            });
            
            // Double-check that the form data was updated
            setTimeout(() => {
              console.log('Form data after update:', formData);
            }, 100);
          } else {
            console.error('Failed to fetch company profile:', userCompanyResponse);
            
            // Try to use a fallback approach
            console.log('Using fallback approach for contact info');
            const defaultEmail = 'contact@example.com';
            const defaultPhone = '+212 5XX XXX XXX';
            
            setFormData(prevData => ({
              ...prevData,
              contactEmail: defaultEmail,
              contactPhone: defaultPhone
            }));
          }
        } catch (error) {
          console.error('Error fetching user company:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle nested fields like salary.min
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      const parentKey = parent as keyof typeof formData;
      const parentValue = formData[parentKey];
      
      if (parentValue && typeof parentValue === 'object') {
        setFormData({
          ...formData,
          [parent]: {
            ...parentValue,
            [child]: value
          }
        });
      }
      return;
    }
    
    // Special handling for category to update available types
    if (name === 'category') {
      if (value) {
        console.log(`Category selected: ${value}`);
        updateAvailableTypes(value);
      } else {
        // If category is cleared, also clear job type and available types
        console.log('Category cleared, resetting job type and available types');
        setAvailableTypes([]);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          jobType: ''
        }));
        return;
      }
    }
    
    // Handle normal fields
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.tags.includes(value)) {
        setFormData({
          ...formData,
          tags: formData.tags ? [...formData.tags, value] : [value]
        });
        e.currentTarget.value = '';
      }
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const addCustomQuestion = () => {
    setFormData(prev => ({
      ...prev,
      customQuestions: [...prev.customQuestions, { question: '', required: false }]
    }));
  };

  const updateCustomQuestion = (index: number, field: string, value: string | boolean) => {
    const updatedQuestions = [...formData.customQuestions];
    const currentQuestion = updatedQuestions[index] || { question: '', required: false };
    updatedQuestions[index] = { ...currentQuestion, [field]: value };
    setFormData(prev => ({
      ...prev,
      customQuestions: updatedQuestions
    }));
  };

  const removeCustomQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index)
    }));
  };

  const updateAvailableTypes = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    if (selectedCategory && selectedCategory.types && Array.isArray(selectedCategory.types)) {
      // Handle both string arrays and object arrays for types
      const typesList = selectedCategory.types.map(type => {
        if (typeof type === 'string') {
          return type;
        } else if (typeof type === 'object' && type !== null && 'name' in type) {
          return type.name;
        }
        return '';
      }).filter(Boolean);
      
      setAvailableTypes(typesList);
      
      // Reset jobType if it's not in the new available types list
      // We check against the new typesList instead of the current state which hasn't updated yet
      if (formData.jobType && !typesList.includes(formData.jobType)) {
        setFormData(prev => ({
          ...prev,
          jobType: ''
        }));
      }
    } else {
      setAvailableTypes([]);
      // Clear job type when no types are available
      if (formData.jobType) {
        setFormData(prev => ({
          ...prev,
          jobType: ''
        }));
      }
    }
  };
  
  // Function to populate form with job data when in edit mode
  const populateFormWithJobData = (jobData: any) => {
    if (!jobData) return;
    
    // First update the category to ensure types are available
    const categoryId = jobData.category?._id || jobData.category || '';
    if (categoryId) {
      // Update available types first to ensure they're loaded before setting jobType
      updateAvailableTypes(categoryId);
    }
    
    // Then set all form data including jobType and contractType
    setFormData({
      title: jobData.title || '',
      description: jobData.description || '',
      requirements: jobData.requirements || '',
      responsibilities: jobData.responsibilities || '',
      benefits: jobData.benefits || '',
      location: jobData.location?.city || '',
      jobType: jobData.jobType || '',
      contractType: jobData.contractType || '',
      category: categoryId,
      experience: jobData.experience || 'Débutant',
      education: jobData.education || 'Bac',
      contactEmail: jobData.contactEmail || userCompany?.email || '',
      contactPhone: jobData.contactPhone || userCompany?.phone || '',
      tags: jobData.tags || [],
      status: jobData.isActive ? 'active' : 'draft',
      salary: {
        min: jobData.salary?.min?.toString() || '',
        max: jobData.salary?.max?.toString() || '',
        currency: jobData.salary?.currency || 'MAD',
        period: jobData.salary?.period || 'month',
        isDisplayed: jobData.salary?.isDisplayed !== undefined ? jobData.salary.isDisplayed : true
      },
      applicationDeadline: jobData.applicationDeadline ? new Date(jobData.applicationDeadline).toISOString().split('T')[0] : '',
      applicationEmail: jobData.applicationEmail || '',
      applicationUrl: jobData.applicationUrl || '',
      applicationPhone: jobData.applicationPhone || '',
      applicationFormUrl: jobData.applicationFormUrl || '',
      applicationInstructions: jobData.applicationInstructions || '',
      isRemote: jobData.isRemote || false,
      hasFlexibleHours: jobData.hasFlexibleHours || false,
      experienceYears: jobData.experienceYears || 0,
      educationLevel: jobData.educationLevel || '',
      skills: jobData.skills || [],
      languages: jobData.languages || [],
      companyDescription: jobData.companyDescription || '',
      companyLogo: jobData.companyLogo || '',
      companyWebsite: jobData.companyWebsite || '',
      companyIndustry: jobData.companyIndustry || '',
      companySize: jobData.companySize || '',
      companyLocation: jobData.companyLocation || '',
      companyName: jobData.companyName || '',
      customQuestions: jobData.customQuestions || []
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Title validation
    if (!formData.title) {
      errors.title = "Le titre du poste est requis";
    } else if (formData.title.length < 5) {
      errors.title = "Le titre doit contenir au moins 5 caractères";
    }
    
    // Description validation
    if (!formData.description) {
      errors.description = "La description du poste est requise";
    } else if (formData.description.length < 50) {
      errors.description = "La description doit contenir au moins 50 caractères";
    }
    
    // Requirements validation
    if (!formData.requirements) {
      errors.requirements = "Les exigences du poste sont requises";
    } else if (formData.requirements.length < 50) {
      errors.requirements = "Les exigences doivent contenir au moins 50 caractères";
    }
    
    // Responsibilities validation
    if (!formData.responsibilities) {
      errors.responsibilities = "Les responsabilités du poste sont requises";
    } else if (formData.responsibilities.length < 50) {
      errors.responsibilities = "Les responsabilités doivent contenir au moins 50 caractères";
    }
    
    // Location validation
    if (!formData.location) {
      errors.location = "La ville est requise";
    }
    
    // Job type validation
    if (formData.category) {
      // Only validate job type if a category is selected
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      const hasJobTypes = selectedCategory?.types && Array.isArray(selectedCategory.types) && selectedCategory.types.length > 0;
      
      if (hasJobTypes && !formData.jobType) {
        errors.jobType = "Le type de poste est requis";
      }
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = "La catégorie est requise";
    }
    
    // Contract type validation
    if (!formData.contractType) {
      errors.contractType = "Le type de contrat est requis";
    }
    
    // Experience validation
    if (!formData.experience) {
      errors.experience = "L'expérience requise est nécessaire";
    }
    
    // Education validation
    if (!formData.education) {
      errors.education = "Le niveau d'éducation requis est nécessaire";
    }
    
    // Contact email validation
    if (!formData.contactEmail) {
      errors.contactEmail = "L'email de contact est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = "Veuillez entrer une adresse email valide";
    }
    
    // Contact phone validation
    if (!formData.contactPhone) {
      errors.contactPhone = "Le téléphone de contact est requis";
    } else if (!/^[0-9+\s()-]{8,15}$/.test(formData.contactPhone)) {
      errors.contactPhone = "Veuillez entrer un numéro de téléphone valide";
    }
    
    // Tags validation
    if (!formData.tags.length) {
      errors.tags = "Au moins un mot-clé est requis";
    }
    
    // Check if the company ID is available
    if (!userCompany || (!userCompany._id && !userCompany.id)) {
      errors.company = "Impossible de récupérer les informations de l'entreprise. Veuillez rafraîchir la page.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    // Check if user is logged in
    if (!user) {
      setError("Vous devez être connecté pour publier une offre d'emploi");
      setIsSubmitting(false);
      return;
    }

    // Check if user has a company profile
    if (!userCompany) {
      setError("Vous devez avoir un profil d'entreprise pour publier une offre d'emploi");
      setIsSubmitting(false);
      return;
    }
    
    // Validate form fields
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Veuillez corriger les erreurs dans le formulaire");
      setIsSubmitting(false);
      return;
    }

    // Add company ID to the form data and ensure all required fields are present
    const selectedCity = cities.find(city => city.name === formData.location);
    
    try {
      // Prepare the job data with company ID
      const companyId = userCompany?._id || userCompany?.id;
      if (!companyId) {
        setError("Impossible de récupérer l'ID de l'entreprise. Veuillez rafraîchir la page.");
        setIsSubmitting(false);
        return;
      }

      // Create a clean job data object aligned with MongoDB schema
      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        jobType: formData.jobType,
        contractType: formData.contractType,
        category: formData.category, // This should be a valid MongoDB ObjectId (24 characters)
        experience: formData.experience,
        education: formData.education,
        // Rename tags to skills as per backend schema
        skills: formData.tags,
        status: formData.status, // 'draft' or 'active'
        isActive: formData.status === 'active', // false for draft, true for active
        // Convert salary to numbers
        salary: {
          min: typeof formData.salary?.min === 'string' ? parseInt(formData.salary.min, 10) : formData.salary?.min,
          max: typeof formData.salary?.max === 'string' ? parseInt(formData.salary.max, 10) : formData.salary?.max,
          currency: formData.salary?.currency || 'MAD',
          period: formData.salary?.period || 'monthly'
        },
        // Format date properly
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : undefined,
        isRemote: formData.isRemote,
        hasFlexibleHours: formData.hasFlexibleHours,
        customQuestions: formData.customQuestions,
        company: companyId, // This should be a valid MongoDB ObjectId (24 characters)
        location: {
          city: formData.location,
          // Remove postalCode as it's not in the schema
          country: 'Maroc'
        }
      };
      
      console.log('Submitting job data:', jobData);
      
      // Submit the job data using employerAPI
      const response = await employerAPI.createJob(jobData);
      
      console.log('Job creation response:', response);
      
      // Handle different API response formats
      if (
        (response.data && response.data.success) || // Standard format
        (response.success) || // Direct success property
        (response._id) || // MongoDB document with ID returned
        (response.id) || // Alternative ID format
        (response.data && response.data._id) // Nested document
      ) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard/employeur/offres');
        }, 2000);
      } else {
        // Handle different error response formats
        const errorMessage = 
          (response.data?.message) || 
          (response.message) || 
          (response.error) || 
          (response.data?.error) || 
          "Une erreur s'est produite lors de la création de l'offre d'emploi";
          
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error('Error creating job:', err);
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        
        // Handle validation errors
        if (err.response.status === 400 && err.response.data.errors) {
          const validationErrors: Record<string, string> = {};
          err.response.data.errors.forEach((error: {param: string, msg: string}) => {
            validationErrors[error.param] = error.msg;
          });
          setFieldErrors(validationErrors);
          setError("Veuillez corriger les erreurs dans le formulaire");
        } else {
          setError(err.response.data.message || "Une erreur s'est produite lors de la création de l'offre d'emploi");
        }
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError("Erreur de connexion au serveur" as any);
      } else {
        setError((err.message || "Erreur lors de la création de l'offre d'emploi") as any);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Publier une nouvelle offre d'emploi</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-medium">Erreur de validation</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded-md">
          L'offre d'emploi a été créée avec succès. Vous allez être redirigé vers la liste des offres.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h2>
          <div className="grid grid-cols-1 gap-6">
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'offre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de poste <span className="text-red-500">*</span>
              </label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                required
                disabled={!formData.category || availableTypes.length === 0}
                className={`w-full px-3 py-2 border ${fieldErrors.jobType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${!formData.category || availableTypes.length === 0 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">{!formData.category ? "Sélectionnez d'abord une catégorie" : 'Sélectionnez un type de poste'}</option>
                {availableTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {!formData.category && (
                <p className="text-xs text-gray-500 mt-1">Veuillez d'abord sélectionner une catégorie</p>
              )}
              {formData.category && availableTypes.length === 0 && (
                <p className="text-xs text-amber-500 mt-1">Cette catégorie n'a pas de types de postes définis</p>
              )}
              {fieldErrors.jobType && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.jobType}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                Type de contrat <span className="text-red-500">*</span>
              </label>
              <select
                id="contractType"
                name="contractType"
                value={formData.contractType}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.contractType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Sélectionnez un type de contrat</option>
                <option value="CDI">CDI (Contrat à Durée Indéterminée)</option>
                <option value="CDD">CDD (Contrat à Durée Déterminée)</option>
                <option value="Intérim">Intérim</option>
                <option value="Stage">Stage</option>
                <option value="Alternance / Apprentissage">Alternance / Apprentissage</option>
                <option value="Freelance / Indépendant">Freelance / Indépendant</option>
                <option value="Temps partiel">Temps partiel</option>
                <option value="Autre">Autre</option>
              </select>
              {fieldErrors.contractType && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.contractType}</p>
              )}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ville <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Sélectionnez une ville</option>
                {cities.map((city) => (
                  <option key={city._id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {fieldErrors.location && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.location}</p>
              )}
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Niveau d'expérience <span className="text-red-500">*</span>
              </label>
              <select
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.experience ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="Débutant">Débutant</option>
                <option value="1-2 ans">1-2 ans</option>
                <option value="3-5 ans">3-5 ans</option>
                <option value="5-10 ans">5-10 ans</option>
                <option value="10+ ans">10+ ans</option>
              </select>
              {fieldErrors.experience && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.experience}</p>
              )}
            </div>

            <div>
              <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                Niveau d'éducation <span className="text-red-500">*</span>
              </label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.education ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="Bac">Baccalauréat</option>
                <option value="Bac+2">Bac+2 / DUT / BTS</option>
                <option value="Bac+3/Licence">Bac+3 / Licence</option>
                <option value="Bac+5/Master">Bac+5 / Master</option>
                <option value="Doctorat">Doctorat</option>
                <option value="Autre">Autre</option>
              </select>
              {fieldErrors.education && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.education}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salary.min" className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire minimum
                </label>
                <input
                  type="number"
                  id="salary.min"
                  name="salary.min"
                  value={formData.salary.min}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.salary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ex: 5000"
                />
                {fieldErrors.salary && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary.max" className="block text-sm font-medium text-gray-700 mb-1">
                  Salaire maximum
                </label>
                <input
                  type="number"
                  id="salary.max"
                  name="salary.max"
                  value={formData.salary.max}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.salary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Ex: 8000"
                />
                {fieldErrors.salary && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="salary.currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Devise
                </label>
                <select
                  id="salary.currency"
                  name="salary.currency"
                  value={formData.salary.currency}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.salary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="MAD">MAD - Dirham marocain</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dollar américain</option>
                </select>
                {fieldErrors.salary && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>
                )}
              </div>

              <div>
                <label htmlFor="salary.period" className="block text-sm font-medium text-gray-700 mb-1">
                  Période
                </label>
                <select
                  id="salary.period"
                  name="salary.period"
                  value={formData.salary.period}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${fieldErrors.salary ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="hourly">Par heure</option>
                  <option value="daily">Par jour</option>
                  <option value="weekly">Par semaine</option>
                  <option value="monthly">Par mois</option>
                  <option value="yearly">Par an</option>
                </select>
                {fieldErrors.salary && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                Date limite de candidature
              </label>
              <input
                type="date"
                id="applicationDeadline"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${fieldErrors.applicationDeadline ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                min={new Date().toISOString().split('T')[0]}
              />
              {fieldErrors.applicationDeadline && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.applicationDeadline}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Description du poste</h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description du poste <span className="text-red-500">*</span> (minimum 50 caractères)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className={`w-full px-3 py-2 border ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Décrivez le poste en détail"
              ></textarea>
              {fieldErrors.description && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700 mb-1">
                Responsabilités <span className="text-red-500">*</span> (minimum 50 caractères)
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                required
                rows={4}
                className={`w-full px-3 py-2 border ${fieldErrors.responsibilities ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Principales tâches et responsabilités du poste"
              ></textarea>
              {fieldErrors.responsibilities && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.responsibilities}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Conseil: Utilisez des tirets (-) pour créer une liste à puces</p>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">
                Exigences du poste <span className="text-red-500">*</span> (minimum 50 caractères)
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={4}
                className={`w-full px-3 py-2 border ${fieldErrors.requirements ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Compétences, qualifications et expérience requises"
              ></textarea>
              {fieldErrors.requirements && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.requirements}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Conseil: Utilisez des tirets (-) pour créer une liste à puces</p>
            </div>

            <div>
              <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 mb-1">
                Avantages
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Listez les avantages offerts (salaire, horaires, avantages sociaux, etc.)..."
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Conseil: Utilisez des tirets (-) pour créer une liste à puces</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Mots-clés</h2>
          <div className="grid grid-cols-1 gap-6">
            
            <div className="space-y-1">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Mots-clés <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  id="tags"
                  className={`w-full px-3 py-2 border ${fieldErrors.tags ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Tapez un mot-clé et appuyez sur Entrée"
                  onKeyDown={handleTagInput}
                />
              </div>
              <p className="text-xs text-gray-500">Appuyez sur Entrée ou virgule pour ajouter un mot-clé</p>
              {fieldErrors.tags && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.tags}</p>
              )}
              
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            

          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de contact</h2>
          <p className="text-sm text-gray-600 mb-3">Ces informations sont automatiquement remplies à partir de votre profil d'entreprise, mais vous pouvez les modifier pour cette offre spécifique.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email de contact <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.contactEmail ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ex: recrutement@entreprise.com"
              />
              {fieldErrors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.contactEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone de contact <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${fieldErrors.contactPhone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Ex: +212 5 22 XX XX XX"
              />
              {fieldErrors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.contactPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Custom Questions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Questions personnalisées</h2>
            <button
              type="button"
              onClick={addCustomQuestion}
              className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Ajouter une question
            </button>
          </div>

          {formData.customQuestions.length === 0 ? (
            <p className="text-sm text-gray-600">Ajoutez des questions personnalisées pour les candidats (facultatif)</p>
          ) : (
            <div className="space-y-4">
              {formData.customQuestions.map((question, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Question {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCustomQuestion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Saisissez votre question ici..."
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={question.required}
                        onChange={(e) => updateCustomQuestion(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`required-${index}`} className="ml-2 block text-sm text-gray-700">
                        Réponse obligatoire
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Publication Options */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Options de publication</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut de l'offre
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Brouillon - Enregistrer sans publier</option>
                <option value="active">Actif - Publier immédiatement</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Les brouillons ne sont pas visibles par les candidats et peuvent être publiés ultérieurement
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/employeur/offres')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Création en cours...' : formData.status === 'draft' ? 'Enregistrer comme brouillon' : 'Publier l\'offre'}
          </button>
        </div>
      </form>
    </div>
  )
}
