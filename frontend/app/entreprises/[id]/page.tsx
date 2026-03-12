import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaBuilding, FaUsers } from 'react-icons/fa'
import Breadcrumb from '../../components/Breadcrumb'
import DetailPageHeader from '../../components/layout/DetailPageHeader'
import DetailPageFooter from '../../components/layout/DetailPageFooter'
import { generateSEOMetadata } from '../../lib/seo'

// Types pour les paramètres de la page
interface PageProps {
  params: {
    id: string
  }
}

// Fonction pour générer les métadonnées dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params
  
  // Récupérer les données de l'entreprise
  const company = await getCompanyDetails(id)
  
  if (!company) {
    return {
      title: 'Entreprise non trouvée | JobCallCenter.ma',
    }
  }
  
  return generateSEOMetadata({
    title: `${company.name} - Offres d'emploi et profil | JobCallCenter.ma`,
    description: `Découvrez le profil de ${company.name}, leurs offres d'emploi actuelles et les opportunités de carrière dans ce centre d'appel au Maroc.`,
    keywords: [company.name, 'centre d\'appel', 'recrutement', 'emploi', 'Maroc'],
    canonical: `/entreprises/${id}`,
    ogType: 'website',
    ogImage: company.logoUrl || '/images/og-company.jpg',
  })
}

// Fonction pour récupérer les détails de l'entreprise (à remplacer par une vraie API)
async function getCompanyDetails(id: string) {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Données statiques pour la démo
  const companies = {
    'globalcall': {
      id: 'globalcall',
      name: 'GlobalCall Services',
      description: 'GlobalCall Services est un centre d\'appels international spécialisé dans le service client et le support technique pour de grandes marques européennes. Avec plus de 500 positions, nous offrons un environnement de travail moderne et dynamique.',
      logoUrl: '/images/companies/globalcall.jpg',
      coverUrl: '/images/companies/globalcall-cover.jpg',
      location: 'Casablanca, Quartier d\'affaires Sidi Maârouf',
      phone: '+212 522 123 456',
      email: 'recrutement@globalcall-services.ma',
      website: 'www.globalcall-services.ma',
      founded: 2010,
      employees: '500-1000',
      specialties: ['Service client', 'Support technique', 'Télémarketing', 'Recouvrement'],
      benefits: [
        'Salaire compétitif avec primes de performance',
        'Transport assuré',
        'Couverture médicale complète',
        'Formation continue',
        'Possibilités d\'évolution rapide'
      ],
      jobCount: 12
    },
    'techsupport': {
      id: 'techsupport',
      name: 'TechSupport International',
      description: 'TechSupport International est un leader dans le domaine du support technique externalisé. Nous travaillons avec des entreprises technologiques du monde entier pour offrir un support de qualité à leurs clients.',
      logoUrl: '/images/companies/techsupport.jpg',
      coverUrl: '/images/companies/techsupport-cover.jpg',
      location: 'Rabat, Technopolis',
      phone: '+212 537 789 012',
      email: 'careers@techsupport-int.com',
      website: 'www.techsupport-int.com',
      founded: 2015,
      employees: '200-500',
      specialties: ['Support technique', 'Assistance informatique', 'Helpdesk', 'Formation'],
      benefits: [
        'Horaires flexibles',
        'Environnement de travail moderne',
        'Assurance maladie',
        'Tickets restaurant',
        'Activités team building'
      ],
      jobCount: 8
    },
    'financetel': {
      id: 'financetel',
      name: 'FinanceTel',
      description: 'FinanceTel est spécialisé dans les services de télémarketing et de conseil pour le secteur bancaire et financier. Nous recrutons régulièrement des profils commerciaux avec une bonne connaissance des produits financiers.',
      logoUrl: '/images/companies/financetel.jpg',
      coverUrl: '/images/companies/financetel-cover.jpg',
      location: 'Marrakech, Guéliz',
      phone: '+212 524 345 678',
      email: 'recrutement@financetel.ma',
      website: 'www.financetel.ma',
      founded: 2012,
      employees: '100-200',
      specialties: ['Télémarketing bancaire', 'Conseil financier', 'Vente de produits bancaires'],
      benefits: [
        'Commissions attractives',
        'Formation aux produits financiers',
        'Mutuelle d\'entreprise',
        'Prime de transport',
        'Bonus trimestriels'
      ],
      jobCount: 5
    },
    'multicontact': {
      id: 'multicontact',
      name: 'MultiContact Center',
      description: 'MultiContact Center est un centre d\'appels multilingue offrant des services dans plus de 10 langues. Nous recherchons constamment des profils internationaux pour rejoindre nos équipes.',
      logoUrl: '/images/companies/multicontact.jpg',
      coverUrl: '/images/companies/multicontact-cover.jpg',
      location: 'Tanger, Free Zone',
      phone: '+212 539 456 789',
      email: 'jobs@multicontact-center.com',
      website: 'www.multicontact-center.com',
      founded: 2008,
      employees: '300-500',
      specialties: ['Service client multilingue', 'Relation client', 'BPO'],
      benefits: [
        'Primes linguistiques',
        'Cadre de travail international',
        'Possibilités de voyages professionnels',
        'Assurance santé internationale',
        'Activités culturelles'
      ],
      jobCount: 15
    }
  }
  
  return companies[id as keyof typeof companies] || null
}

// Fonction pour récupérer les offres d'emploi de l'entreprise (à remplacer par une vraie API)
async function getCompanyJobs(companyId: string) {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Données statiques pour la démo
  const jobs = [
    {
      id: 'job1',
      title: 'Téléconseiller service client (Français/Arabe)',
      location: 'Casablanca',
      salary: '5000 - 7000 MAD',
      contractType: 'CDI',
      publishedDays: 2,
      company: 'GlobalCall Services'
    },
    {
      id: 'job2',
      title: 'Chargé de support technique (Bilingue)',
      location: 'Rabat',
      salary: '6000 - 9000 MAD',
      contractType: 'CDI',
      publishedDays: 3,
      company: 'TechSupport International'
    },
    {
      id: 'job3',
      title: 'Télévendeur produits bancaires',
      location: 'Marrakech',
      salary: '4500 - 6500 MAD + commissions',
      contractType: 'CDD',
      publishedDays: 5,
      company: 'FinanceTel'
    }
  ]
  
  // Filtrer les offres par entreprise
  return jobs.filter(job => {
    const companyMapping = {
      'globalcall': 'GlobalCall Services',
      'techsupport': 'TechSupport International',
      'financetel': 'FinanceTel',
      'multicontact': 'MultiContact Center'
    }
    
    return job.company === companyMapping[companyId as keyof typeof companyMapping]
  })
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = params
  
  // Récupérer les détails de l'entreprise
  const company = await getCompanyDetails(id)
  
  // Si l'entreprise n'existe pas, retourner une page 404
  if (!company) {
    notFound()
  }
  
  // Récupérer les offres d'emploi de l'entreprise
  const jobs = await getCompanyJobs(id)
  
  return (
    <>
      <DetailPageHeader 
        title={company.name}
        backLink="/entreprises"
        backText="Retour aux entreprises"
      />
      <main className="bg-gray-50 min-h-screen pb-12">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb 
            customItems={[
              { name: 'Accueil', url: '/' },
              { name: 'Entreprises', url: '/entreprises' },
              { name: company.name, url: `/entreprises/${id}` },
            ]}
          />
          
          {/* Bannière de l'entreprise */}
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6 mt-4 bg-gray-300">
            {company.coverUrl ? (
              <Image
                src={company.coverUrl}
                alt={`Bannière de ${company.name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <FaBuilding className="text-blue-300 text-5xl" />
              </div>
            )}
          </div>
          
          {/* Informations de l'entreprise */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row">
                {/* Logo et informations principales */}
                <div className="md:w-1/4 flex flex-col items-center md:items-start mb-6 md:mb-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 mb-4 relative">
                    {company.logoUrl ? (
                      <Image
                        src={company.logoUrl}
                        alt={`Logo de ${company.name}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-500 font-bold text-xl">{company.name.substring(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 w-full">
                    <li className="flex items-start">
                      <FaMapMarkerAlt className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{company.location}</span>
                    </li>
                    <li className="flex items-start">
                      <FaPhone className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{company.phone}</span>
                    </li>
                    <li className="flex items-start">
                      <FaEnvelope className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                      <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline text-sm">
                        {company.email}
                      </a>
                    </li>
                    <li className="flex items-start">
                      <FaGlobe className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                      <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        {company.website}
                      </a>
                    </li>
                    <li className="flex items-start">
                      <FaUsers className="text-gray-500 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{company.employees} employés</span>
                    </li>
                  </ul>
                </div>
                
                {/* Description et spécialités */}
                <div className="md:w-3/4 md:pl-8 md:border-l border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">{company.name}</h1>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">À propos de l'entreprise</h2>
                    <p className="text-gray-700">{company.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Spécialités</h2>
                    <div className="flex flex-wrap gap-2">
                      {company.specialties.map((specialty, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Avantages</h2>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {company.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Offres d'emploi de l'entreprise */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Offres d'emploi chez {company.name}</h2>
            
            {jobs.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {jobs.map((job) => (
                    <li key={job.id} className="p-4 hover:bg-gray-50">
                      <Link href={`/emploi/${job.id}`} className="block">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800">{job.title}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <FaMapMarkerAlt className="mr-1 text-gray-400" />
                              {job.location}
                              <span className="mx-2">•</span>
                              {job.salary}
                            </div>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.contractType === 'CDI' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {job.contractType}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600">Aucune offre d'emploi disponible actuellement.</p>
                <p className="mt-2">
                  <Link href="/contact" className="text-blue-600 hover:underline">
                    Contactez-nous pour plus d'informations
                  </Link>
                </p>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link 
                href="/emploi" 
                className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-sm"
              >
                Voir toutes les offres d'emploi
                <svg className="ml-2 w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <DetailPageFooter />
    </>
  )
}
