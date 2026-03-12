import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation | TonCallCenter.ma',
  description: 'Conditions générales d\'utilisation du site TonCallCenter.ma',
}

export default function ConditionsGenerales() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">CONDITIONS GÉNÉRALES D'UTILISATION (CGU)</h1>

        <section className="mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">1. Objet</h3>
            <p className="text-gray-600">Les présentes CGU régissent les conditions d'utilisation du site TonCallCenter.ma par tout utilisateur.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">2. Accès et services</h3>
            <p className="text-gray-600">L'accès au site est libre. Certaines fonctionnalités sont réservées aux utilisateurs enregistrés (candidats ou recruteurs).</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">3. Engagements de l'utilisateur</h3>
            <p className="mb-2">L'utilisateur s'engage à :</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Ne fournir que des informations exactes et à jour</li>
              <li>Utiliser le site dans un cadre légal</li>
              <li>Ne pas publier de contenus illicites ou contraires à l'ordre public</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">4. Responsabilités</h3>
            <p className="text-gray-600">Marketing-Online décline toute responsabilité concernant le contenu publié par les utilisateurs, ainsi que les décisions prises dans le cadre de la relation entre candidats et recruteurs.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">5. Propriété intellectuelle</h3>
            <p className="text-gray-600">L'ensemble des contenus du site (textes, images, logo, charte graphique) est protégé par le droit de la propriété intellectuelle. Toute reproduction est interdite sans autorisation écrite préalable.</p>
          </div>
        </section>
      </div>
    </div>
  )
}
