import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Breadcrumb from '../../../components/Breadcrumb'
import DetailPageHeader from '../../../components/layout/DetailPageHeader'
import DetailPageFooter from '../../../components/layout/DetailPageFooter'
import { generateSEOMetadata, generateJobPostingSchema } from '../../../lib/seo'
import { generateGeoContent, GeoContent } from '../../../lib/geo'

// Types pour les paramètres de la page
interface PageProps {
  params: {
    ville: string
    poste: string
  }
}

// Fonction pour générer les métadonnées dynamiques
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ville, poste } = params
  
  // Formater les paramètres pour l'affichage
  const villeFormatted = decodeURIComponent(ville).replace(/-/g, ' ')
  const posteFormatted = decodeURIComponent(poste).replace(/-/g, ' ')
  
  return generateSEOMetadata({
    title: `Offres d'emploi ${posteFormatted} à ${villeFormatted} | JobCallCenter.ma`,
    description: `Trouvez les meilleures offres d'emploi de ${posteFormatted} à ${villeFormatted}. Postulez maintenant et rejoignez les meilleurs centres d'appel au Maroc.`,
    keywords: [posteFormatted, villeFormatted, 'emploi', 'centre d\'appel', 'Maroc', 'recrutement'],
    canonical: `/emploi/${ville}/${poste}`,
    ogType: 'website',
    ogImage: '/images/og-job-listings.jpg',
  })
}

// Fonction pour récupérer le contenu GEO (à remplacer par une vraie API)
async function getGeoContent(ville: string, poste: string): Promise<GeoContent> {
  // Dans un environnement de production, cette fonction appellerait l'API ou la base de données
  // Pour l'instant, nous utilisons directement la fonction de génération
  // Note: En production, il faudrait implémenter un système de cache
  
  try {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Contenu statique pour la démo (à remplacer par generateGeoContent en production)
    return {
      intro: `Découvrez les meilleures opportunités d'emploi de ${poste} à ${ville}. JobCallCenter.ma vous propose une sélection d'offres d'emploi dans le secteur des centres d'appel à ${ville}.`,
      description: `Le poste de ${poste} à ${ville} implique généralement la gestion des appels clients, la résolution de problèmes et la fourniture d'un service client de qualité. Les candidats doivent posséder d'excellentes compétences en communication et une bonne maîtrise des outils informatiques.`,
      salaire: `Le salaire moyen pour un poste de ${poste} à ${ville} varie généralement entre 4000 et 8000 MAD par mois, selon l'expérience et les compétences linguistiques.`,
      faq: [
        {
          question: `Quelles sont les compétences requises pour devenir ${poste} à ${ville}?`,
          reponse: `Pour devenir ${poste} à ${ville}, vous devez avoir d'excellentes compétences en communication, une bonne maîtrise du français et/ou d'autres langues étrangères, des compétences informatiques de base et une capacité à travailler sous pression.`
        },
        {
          question: `Quels sont les horaires de travail typiques pour un ${poste} à ${ville}?`,
          reponse: `Les horaires de travail pour un ${poste} à ${ville} varient selon l'entreprise, mais incluent souvent des shifts de jour, de nuit ou en rotation pour assurer un service 24/7, particulièrement pour les clients internationaux.`
        },
        {
          question: `Faut-il un diplôme pour travailler comme ${poste} à ${ville}?`,
          reponse: `La plupart des entreprises à ${ville} demandent au minimum un baccalauréat pour les postes de ${poste}, bien que certaines puissent accepter des candidats sans diplôme mais avec une bonne maîtrise des langues requises.`
        }
      ],
      marche: `Le marché de l'emploi pour les ${poste}s à ${ville} est actuellement dynamique, avec une demande constante de la part des entreprises nationales et internationales. Les compétences linguistiques, particulièrement en français et en anglais, sont très valorisées.`
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu GEO:', error)
    return {
      intro: '',
      description: '',
      salaire: '',
      faq: [],
      marche: ''
    }
  }
}

// Fonction pour récupérer les offres d'emploi (à remplacer par une vraie API)
async function getJobOffers(ville: string, poste: string) {
  // Simuler un délai d'API
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Données statiques pour la démo
  return [
    {
      id: '1',
      title: `${poste} Francophone`,
      company: 'IntelliCall Center',
      location: ville,
      salary: '4500 - 6000 MAD',
      contractType: 'CDI',
      logo: '/images/company-logo-1.png',
      postedDate: '2025-05-20',
      slug: `${ville.toLowerCase()}-${poste.toLowerCase()}-1`,
      description: `Nous recherchons un(e) ${poste} francophone pour rejoindre notre équipe à ${ville}. Vous serez responsable de la gestion des appels clients et de la résolution des problèmes.`,
    },
    {
      id: '2',
      title: `${poste} Bilingue Français/Anglais`,
      company: 'Global Contact Solutions',
      location: ville,
      salary: '6000 - 8000 MAD',
      contractType: 'CDI',
      logo: '/images/company-logo-2.png',
      postedDate: '2025-05-18',
      slug: `${ville.toLowerCase()}-${poste.toLowerCase()}-2`,
      description: `Nous recherchons un(e) ${poste} bilingue français/anglais pour rejoindre notre équipe à ${ville}. Vous serez responsable de la gestion des appels clients internationaux.`,
    },
    {
      id: '3',
      title: `${poste} Débutant(e)`,
      company: 'MarocCall',
      location: ville,
      salary: '3500 - 4500 MAD',
      contractType: 'CDD',
      logo: '/images/company-logo-3.png',
      postedDate: '2025-05-15',
      slug: `${ville.toLowerCase()}-${poste.toLowerCase()}-3`,
      description: `Nous recherchons un(e) ${poste} débutant(e) pour rejoindre notre équipe à ${ville}. Formation assurée.`,
    }
  ]
}

export default async function JobListingPage({ params }: PageProps) {
  const { ville, poste } = params
  
  // Formater les paramètres pour l'affichage
  const villeFormatted = decodeURIComponent(ville).replace(/-/g, ' ')
  const posteFormatted = decodeURIComponent(poste).replace(/-/g, ' ')
  
  // Récupérer le contenu GEO et les offres d'emploi en parallèle
  const [geoContent, jobOffers] = await Promise.all([
    getGeoContent(villeFormatted, posteFormatted),
    getJobOffers(villeFormatted, posteFormatted)
  ])
  
  // Si aucune offre n'est trouvée, afficher la page 404
  if (jobOffers.length === 0) {
    notFound()
  }
  
  // Générer le schéma JSON-LD pour la première offre d'emploi
  const jobSchema = generateJobPostingSchema(jobOffers[0])
  
  return (
    <>
      <DetailPageHeader 
        title={`Offres d'emploi ${posteFormatted} à ${villeFormatted}`}
        backLink="/emploi"
        backText="Retour aux offres d'emploi"
      />
      <main className="bg-gray-50 min-h-screen pb-12">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb 
            customItems={[
              { name: 'Accueil', url: '/' },
              { name: 'Offres d\'emploi', url: '/emploi' },
              { name: villeFormatted, url: `/emploi/${ville}` },
              { name: posteFormatted, url: `/emploi/${ville}/${poste}` },
            ]}
          />
        
        {/* En-tête de la page */}
        <header className="mt-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Offres d&apos;emploi {posteFormatted} à {villeFormatted}
          </h1>
          <p className="text-lg text-gray-600">
            {jobOffers.length} offres disponibles
          </p>
        </header>
        
        {/* Contenu GEO - Introduction */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Travailler comme {posteFormatted} à {villeFormatted}
          </h2>
          <div className="prose max-w-none">
            <p>{geoContent.intro}</p>
          </div>
        </section>
        
        {/* Filtres de recherche */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Affiner votre recherche</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type-contrat" className="block text-sm font-medium text-gray-700 mb-1">
                Type de contrat
              </label>
              <select
                id="type-contrat"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Tous les contrats</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Expérience
              </label>
              <select
                id="experience"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Tous niveaux</option>
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="experimente">Expérimenté</option>
              </select>
            </div>
            <div>
              <label htmlFor="langue" className="block text-sm font-medium text-gray-700 mb-1">
                Langue
              </label>
              <select
                id="langue"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Toutes les langues</option>
                <option value="francais">Français</option>
                <option value="anglais">Anglais</option>
                <option value="espagnol">Espagnol</option>
                <option value="arabe">Arabe</option>
              </select>
            </div>
          </div>
        </section>
        
        {/* Liste des offres d'emploi */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Offres d&apos;emploi disponibles
          </h2>
          <div className="space-y-4">
            {jobOffers.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Image
                      src={job.logo || '/images/default-company-logo.png'}
                      alt={`${job.company} logo`}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">
                          <Link href={`/emploi/${job.slug}`} className="hover:text-blue-600 transition-colors">
                            {job.title}
                          </Link>
                        </h3>
                        <p className="text-gray-700 mb-1">{job.company}</p>
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                          </svg>
                          {job.location}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        job.contractType === 'CDI' 
                          ? 'bg-blue-100 text-blue-800' 
                          : job.contractType === 'CDD' 
                          ? 'bg-green-100 text-green-800'
                          : job.contractType === 'Stage' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {job.contractType}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{job.description}</p>
                    
                    <div className="mt-3 flex flex-wrap justify-between items-center">
                      {job.salary && (
                        <div className="text-gray-700 font-medium mb-2 md:mb-0">
                          <span className="text-sm text-gray-500 mr-1">Salaire:</span> {job.salary}
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        Publié le {new Date(job.postedDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Link 
                        href={`/emploi/${job.slug}`}
                        className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                      >
                        Voir l&apos;offre
                      </Link>
                      <button 
                        className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                        aria-label="Sauvegarder cette offre"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                        </svg>
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Contenu GEO - Description du poste */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Description du poste de {posteFormatted}
          </h2>
          <div className="prose max-w-none">
            <p>{geoContent.description}</p>
          </div>
        </section>
        
        {/* Contenu GEO - Informations salariales */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Salaire moyen pour un poste de {posteFormatted} à {villeFormatted}
          </h2>
          <div className="prose max-w-none">
            <p>{geoContent.salaire}</p>
          </div>
        </section>
        
        {/* Contenu GEO - FAQ */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Questions fréquentes sur le poste de {posteFormatted} à {villeFormatted}
          </h2>
          <div className="space-y-4">
            {geoContent.faq.map((item, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <h3 className="text-lg font-medium mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.reponse}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Contenu GEO - Marché de l'emploi */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Marché de l&apos;emploi pour {posteFormatted} à {villeFormatted}
          </h2>
          <div className="prose max-w-none">
            <p>{geoContent.marche}</p>
          </div>
        </section>
        
        {/* Appel à l'action - WhatsApp */}
        <section className="bg-green-50 rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-2xl font-semibold mb-2">
                Besoin d&apos;aide pour postuler?
              </h2>
              <p className="text-gray-600 mb-4">
                Contactez-nous directement via WhatsApp pour obtenir des conseils personnalisés sur les offres de {posteFormatted} à {villeFormatted}.
              </p>
              <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full flex items-center">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Discuter sur WhatsApp
              </button>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <Image 
                src="/images/whatsapp-support.jpg" 
                alt="Support WhatsApp" 
                width={200} 
                height={200}
                className="rounded-full"
              />
            </div>
          </div>
        </section>
        
        {/* JSON-LD pour l'offre d'emploi */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jobSchema }}
        />
      </div>
      </main>
      <DetailPageFooter />
    </>
  )
}
