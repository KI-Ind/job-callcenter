import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function GuidesCarriere() {
  const careerGuides = [
    {
      id: 1,
      title: "Comment débuter dans les centres d'appels",
      description: "Découvrez les compétences nécessaires et les étapes pour commencer une carrière réussie dans un centre d'appels.",
      image: "/images/career/getting-started.jpg",
      slug: "debuter-centres-appels",
      category: "Débutants",
      readTime: "8 min"
    },
    {
      id: 2,
      title: "Les certifications utiles pour évoluer dans les centres d'appels",
      description: "Explorez les certifications qui peuvent vous aider à progresser dans votre carrière et augmenter votre valeur sur le marché du travail.",
      image: "/images/career/certifications.jpg",
      slug: "certifications-centres-appels",
      category: "Développement professionnel",
      readTime: "10 min"
    },
    {
      id: 3,
      title: "Du conseiller client au superviseur : parcours d'évolution",
      description: "Découvrez le parcours type pour évoluer d'un poste de conseiller client à un poste de superviseur dans un centre d'appels.",
      image: "/images/career/career-path.jpg",
      slug: "evolution-conseiller-superviseur",
      category: "Évolution de carrière",
      readTime: "12 min"
    },
    {
      id: 4,
      title: "Maîtriser les outils CRM des centres d'appels",
      description: "Guide complet sur les principaux outils CRM utilisés dans les centres d'appels et comment les maîtriser.",
      image: "/images/career/crm-tools.jpg",
      slug: "maitriser-outils-crm",
      category: "Compétences techniques",
      readTime: "15 min"
    },
    {
      id: 5,
      title: "Développer ses compétences linguistiques pour les centres d'appels internationaux",
      description: "Stratégies et ressources pour améliorer vos compétences linguistiques et accéder à des postes mieux rémunérés.",
      image: "/images/career/language-skills.jpg",
      slug: "competences-linguistiques",
      category: "Langues étrangères",
      readTime: "9 min"
    },
    {
      id: 6,
      title: "Gérer le stress et éviter l'épuisement professionnel en centre d'appels",
      description: "Techniques et conseils pratiques pour gérer efficacement le stress et maintenir un équilibre sain dans un environnement exigeant.",
      image: "/images/career/stress-management.jpg",
      slug: "gestion-stress-centre-appels",
      category: "Bien-être au travail",
      readTime: "11 min"
    }
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Guides de Carrière</h1>
          <p className="text-lg text-gray-600">
            Découvrez nos guides pratiques pour développer votre carrière dans le secteur des centres d'appels au Maroc.
            Des conseils d'experts pour tous les niveaux, du débutant au professionnel expérimenté.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {careerGuides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:-translate-y-1">
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gray-200">
                  {/* Placeholder for image - in production, use actual images */}
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                    <span className="text-sm">Image: {guide.title}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    {guide.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {guide.readTime} de lecture
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{guide.title}</h2>
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <Link 
                  href={`/guides-carriere/${guide.slug}`}
                  className="inline-block text-blue-600 font-medium hover:text-blue-800 hover:underline"
                >
                  Lire le guide →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Besoin de conseils personnalisés ?</h2>
          <p className="text-gray-600 mb-6">
            Nos experts en recrutement et développement de carrière sont disponibles pour vous aider à atteindre vos objectifs professionnels.
            Prenez rendez-vous pour une consultation gratuite de 30 minutes.
          </p>
          <Link 
            href="/contact"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Demander un rendez-vous
          </Link>
        </div>
      </div>
    </div>
  )
}
