import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Cookies | TonCallCenter.ma',
  description: 'Politique de gestion des cookies sur le site TonCallCenter.ma',
}

export default function PolitiqueCookies() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">POLITIQUE DE COOKIES</h1>

        <section className="mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">1. Qu'est-ce qu'un cookie ?</h3>
            <p className="text-gray-600 mb-3">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de votre visite sur notre site.
              Il nous permet de stocker des informations relatives à votre navigation et de vous reconnaître lors de vos visites ultérieures.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">2. Types de cookies utilisés</h3>
            <p className="text-gray-600 mb-2">Sur TonCallCenter.ma, we use different types of cookies :</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site</li>
              <li><strong>Cookies fonctionnels :</strong> permettant de mémoriser vos préférences</li>
              <li><strong>Cookies analytiques :</strong> mesurant l'audience et les performances du site</li>
              <li><strong>Cookies de ciblage :</strong> personnalisant les offres qui vous sont proposées</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">3. Finalités des cookies</h3>
            <p className="text-gray-600 mb-2">Les cookies nous permettent :</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>D'assurer le bon fonctionnement et la sécurité du site</li>
              <li>De mémoriser vos informations de connexion</li>
              <li>D'analyser l'utilisation du site pour l'améliorer</li>
              <li>De personnaliser votre expérience utilisateur</li>
              <li>De vous proposer des offres d'emploi pertinentes</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">4. Durée de conservation</h3>
            <p className="text-gray-600">
              Les cookies sont conservés pour une durée maximale de 13 mois. À l'expiration de ce délai, votre consentement sera à nouveau sollicité.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">5. Gestion des cookies</h3>
            <p className="text-gray-600 mb-3">
              Vous pouvez à tout moment modifier vos préférences en matière de cookies via le panneau de gestion des cookies accessible depuis notre site.
              Vous pouvez également configurer votre navigateur pour refuser certains ou tous les cookies :
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-pistage-firefox" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">6. Conséquences du refus des cookies</h3>
            <p className="text-gray-600">
              Le refus de certains cookies peut limiter votre expérience sur notre site et l'accès à certaines fonctionnalités.
              Les cookies essentiels ne peuvent pas être désactivés car ils sont nécessaires au fonctionnement du site.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">7. Mise à jour de la politique</h3>
            <p className="text-gray-600">
              Cette politique de cookies peut être mise à jour à tout moment. Nous vous invitons à la consulter régulièrement.
              Dernière mise à jour : 1 juin 2025.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
