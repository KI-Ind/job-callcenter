// Data fetching functions
useEffect(() => {
  const fetchProfileData = async () => {
    try {
      setIsLoading(true)
      setError('')
      // Using the correct API endpoint for user profile
      const response = await api.get('/users/profile')
      
      if (response.data && response.data.success) {
        // Map API response to our profile data structure
        const userData = response.data.data;
        console.log('User profile data received:', userData);
        
        // Safely parse and set profile data
        setProfileData(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          title: userData.title || '',
          summary: userData.summary || '',
          experience: Array.isArray(userData.experience) ? userData.experience : [],
          education: Array.isArray(userData.education) ? userData.education : [],
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          languages: Array.isArray(userData.languages) ? userData.languages : [],
          // Ensure address fields are properly populated
          address: {
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            postalCode: userData.address?.postalCode || '',
            country: userData.address?.country || 'Maroc'
          },
          socialLinks: userData.socialLinks ? {
            linkedin: userData.socialLinks.linkedin || '',
            github: userData.socialLinks.github || '',
            website: userData.socialLinks.website || ''
          } : {
            linkedin: '',
            github: '',
            website: ''
          },
          resume: userData.resume || null
        }))
        
        // If we have a postal code, fetch the city data
        if (userData.address && userData.address.postalCode) {
          fetchCityByPostalCode(userData.address.postalCode)
        }
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err)
      setError(err.response?.data?.message || "Une erreur s'est produite lors du chargement de votre profil")
      
      // Set default values if profile fetch fails
      setProfileData(prev => ({
        ...prev,
        firstName: prev.firstName || '',
        lastName: prev.lastName || '',
        email: prev.email || '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'Maroc'
        }
      }))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Fetch cities for dropdown
  const fetchCities = async () => {
    try {
      setIsCitiesLoading(true)
      const response = await api.get('/cities')
      if (response.data && response.data.success) {
        setCities(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching cities:', err)
      // If we can't fetch cities, set some default ones
      setCities([
        { _id: '1', name: 'Casablanca', postalCode: '20000', region: 'Casablanca-Settat' },
        { _id: '2', name: 'Rabat', postalCode: '10000', region: 'Rabat-Salé-Kénitra' },
        { _id: '3', name: 'Marrakech', postalCode: '40000', region: 'Marrakech-Safi' },
        { _id: '4', name: 'Fès', postalCode: '30000', region: 'Fès-Meknès' },
        { _id: '5', name: 'Tanger', postalCode: '90000', region: 'Tanger-Tétouan-Al Hoceima' },
        { _id: '6', name: 'Agadir', postalCode: '80000', region: 'Souss-Massa' }
      ])
    } finally {
      setIsCitiesLoading(false)
    }
  }
  
  // Fetch city by postal code
  const fetchCityByPostalCode = async (postalCode: string) => {
    if (!postalCode) return
    
    try {
      const response = await api.get(`/cities/${postalCode}`)
      if (response.data && response.data.success) {
        const cityData = response.data.data
        setProfileData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            city: cityData.name,
            postalCode: cityData.postalCode
          }
        }))
      }
    } catch (err) {
      console.error('Error fetching city by postal code:', err)
    }
  }
  
  fetchProfileData()
  fetchCities()
}, [])

// Form handling functions
const handleSaveSection = async (section: string, data: any) => {
  try {
    setError('')
    setSuccess(false)
    
    console.log(`Updating ${section} with data:`, data)
    
    // Create a copy of the current profile data
    const updatedProfile = { ...profileData };
    
    // Update the specific section
    updatedProfile[section] = data;
    
    // Send the update to the API
    const response = await axios.put('/api/users/profile', updatedProfile, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 200) {
      // Update the local state with the response data
      setProfileData(response.data);
      setCurrentSection(null); // Close the form
      setIsEditing(false); // Exit edit mode
      setSuccess(true)
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } else {
      setError(response.data?.message || "Une erreur s'est produite lors de la mise à jour de votre profil")
    }
  } catch (err: any) {
    console.error(`Error updating ${section}:`, err)
    console.error('Error details:', err.response?.data || err.message)
    setError(err.response?.data?.message || "Une erreur s'est produite lors de la mise à jour de votre profil")
  }
}

const handlePersonalInfoSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  
  const form = e.currentTarget;
  
  // Get form data with null checks
  const firstName = form.elements.namedItem('firstName') as HTMLInputElement | null;
  const lastName = form.elements.namedItem('lastName') as HTMLInputElement | null;
  const email = form.elements.namedItem('email') as HTMLInputElement | null;
  const phone = form.elements.namedItem('phone') as HTMLInputElement | null;
  const street = form.elements.namedItem('street') as HTMLInputElement | null;
  const city = form.elements.namedItem('city') as HTMLInputElement | null;
  const postalCode = form.elements.namedItem('postalCode') as HTMLInputElement | null;
  const country = form.elements.namedItem('country') as HTMLInputElement | null;
  
  const formData = {
    firstName: firstName?.value || '',
    lastName: lastName?.value || '',
    email: email?.value || '',
    phone: phone?.value || '',
    address: {
      street: street?.value || '',
      city: city?.value || '',
      postalCode: postalCode?.value || '',
      country: country?.value || 'Maroc'
    }
  }
  
  // Update profile data
  handleSaveSection('personal', formData)
}

const handleSummarySubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const summaryElement = e.currentTarget.elements.namedItem('summary') as HTMLTextAreaElement | null;
  const summary = summaryElement?.value || '';
  handleSaveSection('summary', summary)
}

const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    // Check file size (5MB max)
    if (file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file)
    } else {
      setError('Le fichier est trop volumineux. Taille maximale: 5MB')
    }
  }
}

const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  if (!selectedFile) {
    setError('Veuillez sélectionner un fichier')
    return
  }
  
  try {
    setIsUploading(true)
    setError('')
    
    // Create FormData object
    const formData = new FormData()
    formData.append('resume', selectedFile)
    
    // Upload the file
    console.log('Uploading resume file...')
    const uploadResponse = await api.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const total = progressEvent.total || 1; // Ensure we don't divide by zero
        const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
        setUploadProgress(percentCompleted);
      }
    })
    
    if (uploadResponse.data && uploadResponse.data.success) {
      // Update profile with the new resume info
      const resumeData = {
        filename: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        uploadDate: new Date().toISOString(),
        url: uploadResponse.data.data.url,
        key: uploadResponse.data.data.key
      }
      
      // Update the user profile with the resume info
      const updateResponse = await api.put('/users/profile', { resume: resumeData })
      
      if (updateResponse.data && updateResponse.data.success) {
        setProfileData(prev => ({
          ...prev,
          resume: resumeData
        }))
        setSuccess(true)
        setCurrentSection(null)
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(false)
        }, 3000)
      } else {
        setError(updateResponse.data?.message || "Une erreur s'est produite lors de la mise à jour de votre profil")
      }
    } else {
      setError(uploadResponse.data?.message || "Une erreur s'est produite lors du téléversement du fichier")
    }
  } catch (err: any) {
    console.error('Error uploading resume:', err)
    setError(err.response?.data?.message || "Une erreur s'est produite lors du téléversement du fichier")
  } finally {
    setIsUploading(false)
    setUploadProgress(0)
    setSelectedFile(null)
  }
}
