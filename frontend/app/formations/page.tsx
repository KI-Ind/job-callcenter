import React from 'react'
import Link from 'next/link'
import { FaStar, FaUsers, FaClock, FaCalendarAlt, FaGraduationCap, FaHeadset, FaChartLine } from 'react-icons/fa'

export default function Formations() {
  const trainingPrograms = [
    {
      id: 1,
      title: "Formation Téléconseiller Débutant",
      description: "Formation complète pour débutants souhaitant intégrer le secteur des centres d'appels. Maîtrisez les bases du métier de téléconseiller.",
      duration: "2 semaines (70 heures)",
      level: "Débutant",
      category: "Service client",
      rating: 4.8,
      reviewCount: 124,
      nextSession: "15 juin 2025",
      price: "2 500 MAD",
      features: [
        "Techniques de communication téléphonique",
        "Gestion des appels difficiles",
        "Bases de la relation client",
        "Utilisation des outils CRM",
        "Simulation d'appels réels"
      ]
    },
    {
      id: 2,
      title: "Perfectionnement en Service Client",
      description: "Améliorez vos compétences en service client et apprenez à gérer des situations complexes avec professionnalisme et efficacité.",
      duration: "1 semaine (35 heures)",
      level: "Intermédiaire",
      category: "Service client",
      rating: 4.7,
      reviewCount: 89,
      nextSession: "22 juin 2025",
      price: "1 800 MAD",
      features: [
        "Techniques avancées de résolution de problèmes",
        "Gestion de l'insatisfaction client",
        "Communication empathique",
        "Fidélisation client",
        "Analyse des besoins clients"
      ]
    },
    {
      id: 3,
      title: "Techniques de Vente par Téléphone",
      description: "Maîtrisez les techniques de vente par téléphone et augmentez votre taux de conversion avec des méthodes éprouvées.",
      duration: "3 jours (21 heures)",
      level: "Tous niveaux",
      category: "Vente",
      rating: 4.9,
      reviewCount: 156,
      nextSession: "10 juin 2025",
      price: "1 500 MAD",
      features: [
        "Techniques d'argumentation commerciale",
        "Traitement des objections",
        "Closing efficace",
        "Suivi commercial",
        "Psychologie de la vente"
      ]
    },
    {
      id: 4,
      title: "Formation Superviseur Centre d'Appels",
      description: "Développez les compétences nécessaires pour devenir un superviseur efficace et mener votre équipe vers l'excellence.",
      duration: "2 semaines (70 heures)",
      level: "Avancé",
      category: "Management",
      rating: 4.6,
      reviewCount: 72,
      nextSession: "5 juillet 2025",
      price: "3 200 MAD",
      features: [
        "Leadership et gestion d'équipe",
        "Coaching et feedback constructif",
        "Gestion de la performance",
        "Planification des ressources",
        "Gestion des conflits"
      ]
    },
    {
      id: 5,
      title: "Maîtrise des Outils CRM pour Centres d'Appels",
      description: "Formation pratique sur les principaux outils CRM utilisés dans les centres d'appels au Maroc.",
      duration: "3 jours (21 heures)",
      level: "Intermédiaire",
      category: "Technique",
      rating: 4.5,
      reviewCount: 63,
      nextSession: "18 juin 2025",
      price: "1 700 MAD",
      features: [
        "Prise en main des logiciels CRM populaires",
        "Gestion efficace des tickets",
        "Suivi client et historique",
        "Reporting et analyse de données",
        "Automatisation des tâches"
      ]
    },
    {
      id: 6,
      title: "Certification en Excellence de Service Client",
      description: "Obtenez une certification reconnue attestant de votre expertise en matière de service client de qualité.",
      duration: "4 jours (28 heures) + examen",
      level: "Avancé",
      category: "Certification",
      rating: 4.8,
      reviewCount: 91,
      nextSession: "25 juin 2025",
      price: "2 800 MAD",
      features: [
        "Standards internationaux de service client",
        "Gestion de l'expérience client",
        "Résolution avancée de problèmes",
        "Mesure de la satisfaction client",
        "Préparation à l'examen de certification"
      ]
    }
  ]

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Formations Professionnelles</h1>
          <p className="text-lg text-gray-600">
            Développez vos compétences et boostez votre carrière dans les centres d'appels avec nos formations 
            spécialisées, conçues et dispensées par des professionnels du secteur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {trainingPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {program.category}
                  </span>
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{formatRating(program.rating)}</span>
                    <span className="text-sm text-gray-500 ml-1">({program.reviewCount} avis)</span>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{program.title}</h2>
                <p className="text-gray-600 mb-5">{program.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="flex items-center">
                    <FaClock className="text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">{program.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Niveau: {program.level}</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">Prochaine session: {program.nextSession}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-800">{program.price}</span>
                  </div>
                </div>
                
                <h3 className="text-md font-medium text-gray-800 mb-2">Ce que vous apprendrez:</h3>
                <ul className="space-y-2 mb-5">
                  {program.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="flex justify-between items-center">
                  <Link 
                    href={`/formations/${program.id}`}
                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                  >
                    Voir les détails
                  </Link>
                  <Link 
                    href="/contact?subject=formation"
                    className="bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-600 text-white rounded-lg p-8 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FaGraduationCap className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Formations Certifiantes</h3>
              <p>Des certifications reconnues par les employeurs du secteur pour valoriser votre CV</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FaHeadset className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Formateurs Experts</h3>
              <p>Des professionnels en activité avec plus de 10 ans d'expérience en centre d'appels</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <FaChartLine className="text-4xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suivi Personnalisé</h3>
              <p>Un accompagnement individuel pour maximiser votre progression</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Formation sur mesure pour entreprises</h2>
          <p className="text-gray-600 mb-6">
            Nous proposons également des formations personnalisées pour les entreprises souhaitant former leurs équipes. 
            Nos programmes peuvent être adaptés à vos besoins spécifiques, à votre secteur d'activité et à vos objectifs.
          </p>
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">Analyse de vos besoins</h3>
                <p className="text-gray-600 mt-1">
                  Nous étudions vos objectifs, vos défis et votre contexte pour créer un programme adapté.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">2</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">Conception du programme</h3>
                <p className="text-gray-600 mt-1">
                  Nous élaborons un contenu pédagogique sur mesure avec des cas pratiques issus de votre activité.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">3</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-800">Formation et évaluation</h3>
                <p className="text-gray-600 mt-1">
                  Nous dispensons la formation dans vos locaux ou les nôtres et assurons un suivi des acquis.
                </p>
              </div>
            </div>
          </div>
          <Link 
            href="/contact?subject=formation-entreprise"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Demander un devis personnalisé
          </Link>
        </div>
      </div>
    </div>
  )
}
