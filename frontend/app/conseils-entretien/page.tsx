import React from 'react'
import Link from 'next/link'
import { FaCheck, FaTimes, FaLightbulb, FaUserTie, FaComments, FaHeadset } from 'react-icons/fa'

export default function ConseilsEntretien() {
  const commonQuestions = [
    {
      question: "Parlez-moi de votre expérience dans le service client.",
      tips: "Mettez en avant vos compétences en communication, votre patience et votre capacité à résoudre des problèmes. Donnez des exemples concrets de situations difficiles que vous avez gérées avec succès."
    },
    {
      question: "Comment gérez-vous un client mécontent ou agressif ?",
      tips: "Expliquez votre approche : écoute active, empathie, ne pas prendre les critiques personnellement, recherche de solutions concrètes, et suivi pour s'assurer que le problème est résolu."
    },
    {
      question: "Quelles sont vos compétences linguistiques ?",
      tips: "Soyez honnête sur votre niveau. Précisez votre aisance à l'oral et à l'écrit dans chaque langue. Si l'entretien est en français ou en anglais, c'est le moment de démontrer votre fluidité."
    },
    {
      question: "Comment gérez-vous le stress dans un environnement de travail exigeant ?",
      tips: "Parlez de vos techniques personnelles de gestion du stress (organisation, priorisation, pauses courtes, activités post-travail). Donnez un exemple où vous avez maintenu votre calme sous pression."
    },
    {
      question: "Pourquoi souhaitez-vous travailler dans un centre d'appels ?",
      tips: "Évitez les réponses génériques. Parlez de votre intérêt pour la communication, la résolution de problèmes, ou le secteur spécifique (télécoms, banque, etc.). Montrez que vous comprenez les défis et les opportunités."
    }
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">Conseils d'Entretien</h1>
          <p className="text-lg text-gray-600 text-center mb-8">
            Préparez-vous efficacement pour vos entretiens d'embauche dans les centres d'appels 
            avec nos conseils d'experts et exemples pratiques.
          </p>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaHeadset className="mr-3 text-blue-600" />
              Avant l'entretien : Préparation essentielle
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">Recherchez l'entreprise</h3>
                  <p className="text-gray-600 mt-1">
                    Informez-vous sur l'entreprise, ses clients, ses valeurs et sa culture. Consultez leur site web, 
                    leurs réseaux sociaux et les avis des employés. Cela démontrera votre motivation et votre sérieux.
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
                  <h3 className="text-lg font-medium text-gray-800">Maîtrisez votre CV</h3>
                  <p className="text-gray-600 mt-1">
                    Connaissez parfaitement votre parcours et soyez prêt à détailler chaque expérience pertinente 
                    pour un poste en centre d'appels. Préparez des exemples concrets illustrant vos compétences.
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
                  <h3 className="text-lg font-medium text-gray-800">Préparez vos compétences linguistiques</h3>
                  <p className="text-gray-600 mt-1">
                    Entraînez-vous à parler dans la langue requise pour le poste. Les centres d'appels au Maroc 
                    recherchent souvent des candidats maîtrisant le français, l'anglais, l'espagnol ou l'arabe.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">4</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-800">Préparez des questions</h3>
                  <p className="text-gray-600 mt-1">
                    Prévoyez 2-3 questions pertinentes à poser à la fin de l'entretien sur l'environnement de travail, 
                    la formation, les opportunités d'évolution ou les défis du poste.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaUserTie className="mr-3 text-blue-600" />
              Pendant l'entretien : Faire bonne impression
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <FaCheck className="text-green-600 mr-2" /> À faire
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">Arriver 10-15 minutes en avance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">Adopter une posture droite et un contact visuel approprié</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">Parler clairement et à un rythme modéré</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">Démontrer votre capacité d'écoute active</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">Mettre en avant votre flexibilité horaire si applicable</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    <span className="text-gray-700">Montrer votre enthousiasme et votre motivation</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-red-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <FaTimes className="text-red-600 mr-2" /> À éviter
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-gray-700">Arriver en retard ou à la dernière minute</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-gray-700">Utiliser un langage familier ou des expressions inappropriées</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-gray-700">Critiquer vos anciens employeurs ou collègues</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-gray-700">Mentir sur vos compétences ou expériences</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-gray-700">Consulter votre téléphone pendant l'entretien</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">•</span>
                    <span className="text-gray-700">Poser des questions uniquement sur le salaire</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-8 mb-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaComments className="mr-3 text-blue-600" />
              Questions fréquentes et réponses conseillées
            </h2>
            
            <div className="space-y-6">
              {commonQuestions.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-5 last:border-0 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {item.question}
                  </h3>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaLightbulb className="text-yellow-500" />
                    </div>
                    <p className="text-gray-600 ml-3">
                      {item.tips}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Besoin d'une préparation personnalisée ?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nos experts en recrutement proposent des simulations d'entretien et des conseils personnalisés 
              pour maximiser vos chances de décrocher le poste de vos rêves dans un centre d'appels.
            </p>
            <Link 
              href="/contact"
              className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Demander un coaching d'entretien
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
