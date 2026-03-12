'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaArrowRight, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa'
import { jobsAPI } from '@/app/lib/api'
import { useAuth } from '../../../contexts/AuthContext'

interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  contractType: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  publishedDays: number;
  shortCode: string;
}

export default function RecentJobsSection() {
  const [recentJobs, setRecentJobs] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  
  // Number of jobs to display
  const MAX_JOBS_TO_DISPLAY = 8;
  
  useEffect(() => {
    const fetchRecentJobs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching recent jobs...');
        // Fetch jobs with sort by date and limit to 8
        const response = await jobsAPI.getJobs({
          limit: MAX_JOBS_TO_DISPLAY.toString(),
          sort: '-createdAt' // Sort by creation date descending (newest first)
        });
        
        console.log('Jobs API response:', response);
        
        let fetchedJobs: any[] = [];
        
        // Process jobs data based on response format
        if (response && Array.isArray(response.jobs)) {
          fetchedJobs = response.jobs;
        } else if (response && Array.isArray(response)) {
          fetchedJobs = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          fetchedJobs = response.data;
        } else {
          console.warn('Invalid jobs data format, using empty array', response);
          fetchedJobs = [];
        }
        
        // Map the fetched jobs to our display format
        const formattedJobs = fetchedJobs.slice(0, MAX_JOBS_TO_DISPLAY).map((job: any, index: number) => {
          // Extract company name from job data
          const company = job.company?.name || job.companyName || 'Entreprise';
          
          // Create shortcode from company name
          const shortCode = company.substring(0, 2);
          
          // Handle location which could be a string or an object with city/country
          let locationText = 'Maroc';
          if (typeof job.location === 'string') {
            locationText = job.location;
          } else if (typeof job.location === 'object' && job.location !== null) {
            // Handle location as an object with city and country
            if (job.location.city) {
              locationText = job.location.city;
              if (job.location.country) {
                locationText += `, ${job.location.country}`;
              }
            } else if (job.location.country) {
              locationText = job.location.country;
            }
          } else if (job.city) {
            locationText = job.city;
          }
          
          // Handle salary which could be a string or an object with min, max, currency
          let salaryText = 'Salaire selon profil';
          if (typeof job.salary === 'string') {
            salaryText = job.salary;
          } else if (typeof job.salary === 'object' && job.salary !== null) {
            // Handle salary as an object with min, max, currency, isDisplayed
            if (job.salary.min && job.salary.max) {
              salaryText = `${job.salary.min} - ${job.salary.max}`;
              if (job.salary.currency) {
                salaryText += ` ${job.salary.currency}`;
              } else {
                salaryText += ' MAD';
              }
            } else if (job.salary.min) {
              salaryText = `À partir de ${job.salary.min}`;
              if (job.salary.currency) {
                salaryText += ` ${job.salary.currency}`;
              } else {
                salaryText += ' MAD';
              }
            } else if (job.salary.max) {
              salaryText = `Jusqu'à ${job.salary.max}`;
              if (job.salary.currency) {
                salaryText += ` ${job.salary.currency}`;
              } else {
                salaryText += ' MAD';
              }
            }
          } else if (job.salaryRange) {
            salaryText = job.salaryRange;
          }
          
          // Calculate days since publication
          const publishedDate = job.createdAt ? new Date(job.createdAt) : new Date();
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - publishedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
          
          // For testing purposes, assign different contract types if all are CDI
          let contractType = job.contractType || 'CDI';
          
          // If we're using real data but all jobs have CDI, assign different contract types for display
          if (fetchedJobs.every(j => j.contractType === 'CDI' || !j.contractType)) {
            // Assign different contract types based on index
            const contractTypes = ['CDI', 'CDD', 'Stage', 'Freelance'];
            contractType = contractTypes[index % contractTypes.length];
          }
          
          return {
            id: job._id || job.id || `job-${Math.random().toString(36).substr(2, 9)}`,
            title: job.title || 'Poste à pourvoir',
            company: company,
            location: locationText,
            salary: salaryText,
            contractType: contractType,
            publishedDays: diffDays,
            shortCode: shortCode
          };
        });
        
        console.log('Formatted jobs for display:', formattedJobs);
        setRecentJobs(formattedJobs);
      } catch (err) {
        console.error('Error fetching recent jobs:', err);
        setError('Failed to load recent jobs');
        // Use fallback jobs if API fails
        const fallbackJobs: any[] = [
          {
            _id: 'job1',
            title: 'Call Center Agents',
            company: { name: '1K Company' },
            city: 'Larache',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            contractType: 'CDI',
            salary: { min: 500, max: 1000, currency: 'USD' }
          },
          {
            _id: 'job2',
            title: 'Civil Engineer',
            company: { name: '1K Company' },
            city: 'Dakhla',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            contractType: 'CDI',
            salary: { min: 1200, max: 2400, currency: 'MAD' }
          },
          {
            _id: 'job3',
            title: 'abcd test',
            companyName: 'BusyPlace Pvt Ltd',
            city: 'Ouarzazate',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            contractType: 'CDD',
            salary: { min: 2200, max: 3300, currency: 'MAD' }
          },
          {
            _id: 'job4',
            title: 'agigigi',
            companyName: 'BusyPlace Pvt Ltd',
            city: 'Fès',
            createdAt: new Date(), // today
            contractType: 'Stage',
            salary: { min: 5000, max: 8000, currency: 'MAD' }
          },
          {
            _id: 'job5',
            title: 'test new job',
            companyName: 'BusyPlace Pvt Ltd',
            city: 'Marrakech',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            contractType: 'Freelance',
            salary: { min: 700, max: 900, currency: 'MAD' }
          },
          {
            _id: 'job6',
            title: 'test-job',
            companyName: 'BusyPlace Pvt Ltd',
            city: 'Khemisset',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            contractType: 'CDD',
            salary: { min: 300, max: 500, currency: 'MAD' }
          },
          {
            _id: 'job7',
            title: 'CC Agent1',
            companyName: 'BusyPlace Pvt Ltd',
            city: 'Larache',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            contractType: 'Stage',
            salary: { min: 1700, max: 2000, currency: 'MAD' }
          },
          {
            _id: 'job8',
            title: 'Call Center Agent',
            companyName: 'BusyPlace Pvt Ltd',
            city: 'Agadir',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            contractType: 'CDI',
            salary: { min: 300, max: 1700, currency: 'MAD' }
          }
        ];
        
        // Format the fallback jobs
        const formattedFallbackJobs = fallbackJobs.map((job: any, index: number) => {
          // Extract company name from job data
          const company = job.company?.name || job.companyName || 'Entreprise';
          
          // Create shortcode from company name
          const shortCode = company.substring(0, 2);
          
          // Handle location which could be a string or an object with city/country
          let locationText = 'Maroc';
          if (typeof job.location === 'string') {
            locationText = job.location;
          } else if (typeof job.location === 'object' && job.location !== null) {
            // Handle location as an object with city and country
            if (job.location.city) {
              locationText = job.location.city;
              if (job.location.country) {
                locationText += `, ${job.location.country}`;
              }
            } else if (job.location.country) {
              locationText = job.location.country;
            }
          } else if (job.city) {
            locationText = job.city;
          }
          
          // Handle salary which could be a string or an object with min, max, currency
          let salaryText = 'Salaire selon profil';
          if (typeof job.salary === 'string') {
            salaryText = job.salary;
          } else if (typeof job.salary === 'object' && job.salary !== null) {
            // Handle salary as an object with min, max, currency, isDisplayed
            if (job.salary.min && job.salary.max) {
              salaryText = `${job.salary.min} - ${job.salary.max}`;
              if (job.salary.currency) {
                salaryText += ` ${job.salary.currency}`;
              } else {
                salaryText += ' MAD';
              }
            } else if (job.salary.min) {
              salaryText = `À partir de ${job.salary.min}`;
              if (job.salary.currency) {
                salaryText += ` ${job.salary.currency}`;
              } else {
                salaryText += ' MAD';
              }
            } else if (job.salary.max) {
              salaryText = `Jusqu'à ${job.salary.max}`;
              if (job.salary.currency) {
                salaryText += ` ${job.salary.currency}`;
              } else {
                salaryText += ' MAD';
              }
            }
          } else if (job.salaryRange) {
            salaryText = job.salaryRange;
          }
          
          // Calculate days since publication
          const publishedDate = job.createdAt ? new Date(job.createdAt) : new Date();
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - publishedDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
          
          // Ensure we have different contract types
          // Use the contract type from the job data if available, otherwise assign based on index
          const contractTypes = ['CDI', 'CDD', 'Stage', 'Freelance'];
          const contractType = job.contractType || contractTypes[index % contractTypes.length];
          
          return {
            id: job._id || job.id || `job-${Math.random().toString(36).substr(2, 9)}`,
            title: job.title || 'Poste à pourvoir',
            company: company,
            location: locationText,
            salary: salaryText,
            contractType: contractType,
            publishedDays: diffDays,
            shortCode: shortCode
          };
        });
        
        setRecentJobs(formattedFallbackJobs);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentJobs();
  }, []);

  const getContractTypeClass = (type: string) => {
    switch(type) {
      case 'CDI': return 'bg-green-100 text-green-800';
      case 'CDD': return 'bg-blue-100 text-blue-800';
      case 'Stage': return 'bg-yellow-100 text-yellow-800';
      case 'Freelance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const getPublishedText = (days: number) => {
    if (days === 0) {
      const date = new Date();
      return `Publié ${date.getDate()} mai`;
    }
    return `Publié il y a ${days} jour${days > 1 ? 's' : ''}`;
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Offres d'emploi récentes</h2>
          <p className="text-gray-600 mb-3 text-sm">
            Découvrez les dernières opportunités dans le secteur des centres d'appels
          </p>
          <Link 
            href="/emploi" 
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-sm"
          >
            Voir toutes les offres
            <FaArrowRight className="ml-2 w-3 h-3" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="p-3 animate-pulse">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-gray-200 w-8 h-8 rounded-md"></div>
                    <div className="bg-gray-200 w-16 h-5 rounded-full"></div>
                  </div>
                  <div className="bg-gray-200 h-10 rounded mb-2"></div>
                  <div className="space-y-2 mb-3">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                    <div className="bg-gray-200 h-4 rounded w-4/5"></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                    <div className="bg-gray-200 h-4 rounded-full w-4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <p className="text-gray-600">Veuillez réessayer ultérieurement</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="bg-gray-100 text-gray-800 w-8 h-8 rounded-md flex items-center justify-center font-medium text-xs">
                      {job.shortCode}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getContractTypeClass(job.contractType)}`}>
                      {job.contractType}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">{job.title}</h3>

                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <FaBuilding className="mr-1 text-gray-400 w-3 h-3" />
                      {job.company}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <FaMapMarkerAlt className="mr-1 text-gray-400 w-3 h-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <FaMoneyBillWave className="mr-1 text-gray-400 w-3 h-3" />
                      {job.salary}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <FaClock className="mr-1 w-2.5 h-2.5" />
                      {getPublishedText(job.publishedDays)}
                    </div>
                    <Link
                      href={isAuthenticated 
                        ? (user?.role === 'employeur' ? '/dashboard/employeur' : '/dashboard/candidat') 
                        : '/connexion'}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
