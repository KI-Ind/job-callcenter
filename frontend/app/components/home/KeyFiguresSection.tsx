'use client'

import { FaBriefcase, FaBuilding, FaUsers, FaSmile } from 'react-icons/fa'

export default function KeyFiguresSection() {
  const figures = [
    {
      id: 'jobs',
      icon: <FaBriefcase className="text-blue-500 w-6 h-6" />,
      number: '5000+',
      label: 'Offres d\'emploi'
    },
    {
      id: 'centers',
      icon: <FaBuilding className="text-blue-500 w-6 h-6" />,
      number: '250+',
      label: 'Centres d\'appels'
    },
    {
      id: 'candidates',
      icon: <FaUsers className="text-blue-500 w-6 h-6" />,
      number: '15 000+',
      label: 'Candidats inscrits'
    },
    {
      id: 'satisfaction',
      icon: <FaSmile className="text-blue-500 w-6 h-6" />,
      number: '98%',
      label: 'Taux de satisfaction'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Chiffres clés</h2>
        <p className="text-center text-gray-600 mb-10">
          Découvrez l'impact de notre plateforme dans le secteur des centres d'appels
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {figures.map((figure) => (
            <div 
              key={figure.id}
              className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center"
            >
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                {figure.icon}
              </div>
              <h3 className="text-3xl font-bold mb-2">{figure.number}</h3>
              <p className="text-gray-600">{figure.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
