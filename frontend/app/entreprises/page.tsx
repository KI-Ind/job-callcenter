import Link from 'next/link'
import Image from 'next/image'
import { FaMapMarkerAlt, FaBuilding } from 'react-icons/fa'
import Breadcrumb from '../components/Breadcrumb'

// Fonction pour récupérer la liste des entreprises (à remplacer par une vraie API)
async function getCompanies() {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Données statiques pour la démo
  return [
    {
      id: 'globalcall',
      name: 'GlobalCall Services',
      description: 'Centre d\'appels international spécialisé dans le service client et le support technique pour de grandes marques européennes.',
      logoUrl: '/images/companies/globalcall.jpg',
      location: 'Casablanca',
      jobCount: 12,
      specialties: ['Service client', 'Support technique', 'Télémarketing']
    },
    {
      id: 'techsupport',
      name: 'TechSupport International',
      description: 'Leader dans le domaine du support technique externalisé pour des entreprises technologiques du monde entier.',
      logoUrl: '/images/companies/techsupport.jpg',
      location: 'Rabat',
      jobCount: 8,
      specialties: ['Support technique', 'Assistance informatique', 'Helpdesk']
    },
    {
      id: 'financetel',
      name: 'FinanceTel',
      description: 'Spécialisé dans les services de télémarketing et de conseil pour le secteur bancaire et financier.',
      logoUrl: '/images/companies/financetel.jpg',
      location: 'Marrakech',
      jobCount: 5,
      specialties: ['Télémarketing bancaire', 'Conseil financier', 'Vente de produits bancaires']
    },
    {
      id: 'multicontact',
      name: 'MultiContact Center',
      description: 'Centre d\'appels multilingue offrant des services dans plus de 10 langues pour des clients internationaux.',
      logoUrl: '/images/companies/multicontact.jpg',
      location: 'Tanger',
      jobCount: 15,
      specialties: ['Service client multilingue', 'Relation client', 'BPO']
    },
    {
      id: 'callmaster',
      name: 'CallMaster Pro',
      description: 'Centre d\'appels spécialisé dans les solutions de télémarketing et de gestion de la relation client.',
      logoUrl: '/images/companies/callmaster.jpg',
      location: 'Casablanca',
      jobCount: 7,
      specialties: ['Télémarketing', 'Relation client', 'Enquêtes de satisfaction']
    },
    {
      id: 'processingplus',
      name: 'ProcessingPlus',
      description: 'Entreprise de BPO spécialisée dans le traitement de données et le back-office pour divers secteurs.',
      logoUrl: '/images/companies/processingplus.jpg',
      location: 'Fès',
      jobCount: 4,
      specialties: ['Traitement de données', 'Back-office', 'Saisie de données']
    }
  ]
}

export default async function EntreprisesPage() {
  const companies = await getCompanies()
  
  return (
    <main className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb 
          customItems={[
            { name: 'Accueil', url: '/' },
            { name: 'Entreprises', url: '/entreprises' },
          ]}
        />
        
        {/* En-tête de la page */}
        <header className="mt-6 mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Centres d'appels qui recrutent</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les entreprises partenaires de JobCallCenter.ma qui proposent régulièrement des opportunités d'emploi dans le secteur des centres d'appels au Maroc.
          </p>
        </header>
        
        {/* Liste des entreprises */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {companies.map((company) => (
            <Link 
              key={company.id}
              href={`/entreprises/${company.id}`}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 mr-4 flex-shrink-0 relative">
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
                  <div>
                    <h2 className="font-semibold text-lg text-gray-800">{company.name}</h2>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <FaMapMarkerAlt className="mr-1 text-gray-400" />
                      {company.location}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{company.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {company.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <FaBuilding className="mr-1 text-gray-400" />
                    <span className="text-blue-600 font-medium">{company.jobCount} offres d'emploi</span>
                  </div>
                  <span className="text-blue-600 hover:text-blue-800">Voir le profil →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Appel à l'action */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Vous êtes un centre d'appels qui recrute ?</h2>
          <p className="text-gray-600 mb-4">
            Rejoignez JobCallCenter.ma et publiez vos offres d'emploi pour attirer les meilleurs talents.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </main>
  )
}
