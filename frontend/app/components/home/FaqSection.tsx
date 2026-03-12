'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openItem, setOpenItem] = useState<string | null>(null)
  
  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id)
  }
  
  const faqItems: FaqItem[] = [
    {
      id: 'competences',
      question: "Quelles sont les compétences requises pour travailler en centre d'appel ?",
      answer: "Les compétences essentielles pour travailler en centre d'appel incluent d'excellentes capacités de communication, la maîtrise du français et souvent d'autres langues étrangères (anglais, espagnol), une bonne élocution, des compétences en service client, la capacité à travailler sous pression, et des connaissances de base en informatique. Selon le poste, des compétences techniques spécifiques peuvent également être requises."
    },
    {
      id: 'recrutement',
      question: "Comment se déroule le processus de recrutement ?",
      answer: "Le processus de recrutement en centre d'appel comprend généralement plusieurs étapes : dépôt de candidature, présélection téléphonique, tests linguistiques et/ou techniques, entretien individuel ou collectif, et parfois une mise en situation. La durée du processus varie entre quelques jours et deux semaines selon l'entreprise."
    },
    {
      id: 'contrats',
      question: "Quels sont les types de contrats proposés ?",
      answer: "Les centres d'appel au Maroc proposent différents types de contrats : CDI (Contrat à Durée Indéterminée), CDD (Contrat à Durée Déterminée), contrat d'insertion, et parfois des contrats de prestation pour les freelances. La période d'essai est généralement de 1 à 3 mois selon le type de contrat."
    },
    {
      id: 'salaire',
      question: "Quelle est la fourchette de salaire habituelle ?",
      answer: "Les salaires en centre d'appel au Maroc varient selon le poste, l'expérience et les compétences linguistiques. Pour un téléconseiller débutant, le salaire mensuel se situe généralement entre 3500 et 5000 MAD. Pour les postes bilingues ou spécialisés, il peut atteindre 6000 à 8000 MAD. Les superviseurs et managers peuvent gagner entre 8000 et 15000 MAD."
    },
    {
      id: 'evolution',
      question: "Quelles sont les perspectives d'évolution ?",
      answer: "Les centres d'appel offrent de réelles opportunités d'évolution. Un téléconseiller peut évoluer vers des postes de formateur, coach qualité, superviseur, puis responsable d'équipe ou manager. Avec de l'expérience, des postes en ressources humaines, formation ou direction des opérations sont également accessibles."
    },
    {
      id: 'preparation',
      question: "Comment puis-je me préparer pour un entretien ?",
      answer: "Pour réussir un entretien en centre d'appel, renseignez-vous sur l'entreprise et ses clients, préparez des exemples concrets de vos expériences en service client, entraînez-vous aux tests linguistiques, préparez des réponses aux questions fréquentes (gestion du stress, travail d'équipe), et venez avec des questions pertinentes à poser au recruteur."
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Questions Fréquentes</h2>
        <p className="text-center text-gray-600 mb-10">
          Tout ce que vous devez savoir sur le travail en centre d&apos;appel
        </p>
        
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <button
                className="w-full px-6 py-4 text-left font-medium flex justify-between items-center focus:outline-none hover:bg-gray-50"
                onClick={() => toggleItem(item.id)}
              >
                <span className="text-gray-800 text-lg">{item.question}</span>
                <svg 
                  className={`w-5 h-5 text-blue-600 transition-transform ${openItem === item.id ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {openItem === item.id && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Vous ne trouvez pas la réponse à votre question ?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
