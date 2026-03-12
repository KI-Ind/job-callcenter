'use client'

import Image from 'next/image'

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Lahlou',
      role: 'Téléconseillère recrutée via JobCallCenter',
      company: 'GlobalCall Services',
      initials: 'SL',
      image: '/images/testimonial-1.jpg',
      quote: "Grâce à JobCallCenter, j'ai pu trouver un emploi stable en moins de deux semaines. Le processus était simple et l'équipe très réactive pour répondre à mes questions."
    },
    {
      id: 2,
      name: 'Karim Benjelloun',
      role: 'Responsable RH',
      company: 'TechSupport International',
      initials: 'KB',
      image: '/images/testimonial-2.jpg',
      quote: "En tant qu'employeur, JobCallCenter nous a permis de trouver rapidement des candidats qualifiés pour nos postes en centre d'appels. Une vraie valeur ajoutée pour notre processus de recrutement."
    },
    {
      id: 3,
      name: 'Amina Tazi',
      role: 'Superviseure d\'équipe',
      company: 'MultiContact Center',
      initials: 'AT',
      image: '/images/testimonial-3.jpg',
      quote: "J'ai commencé comme téléconseillère et j'ai évolué vers un poste de supervision. JobCallCenter m'a accompagnée tout au long de cette évolution professionnelle avec des conseils pertinents."
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Ce qu&apos;ils disent de nous</h2>
        <p className="text-center text-gray-600 mb-10">
          Découvrez les témoignages de candidats et d&apos;employeurs qui ont utilisé notre plateforme
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  {testimonial.initials}
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
              
              <blockquote className="text-gray-700 mb-4">
                <span className="text-blue-500 text-4xl leading-none">"</span>
                <p className="italic">{testimonial.quote}</p>
              </blockquote>
              
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
