import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | JobCallCenter',
  description: 'Politique de confidentialité et protection des données personnelles sur JobCallCenter.ma',
}

export default function PolitiqueConfidentialite() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">POLITIQUE DE CONFIDENTIALITÉ</h1>
        
        <section className="mb-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">1. Responsable de traitement</h3>
            <p className="text-gray-600">Marketing-Online SARL, en tant qu'éditeur du site JobCallCenter.ma, est responsable du traitement des données collectées.</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">2. Données collectées</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Informations d'identité : nom, prénom, adresse email, numéro de téléphone</li>
              <li>Informations professionnelles : CV, expérience, statut recherché</li>
              <li>Données de navigation : adresse IP, cookies, pages consultées</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">3. Finalités du traitement</h3>
            <p className="mb-2">Les données sont collectées pour :</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>La gestion des comptes utilisateurs</li>
              <li>La mise en relation entre candidats et recruteurs</li>
              <li>L'envoi d'alertes emploi, de newsletters et d'informations professionnelles</li>
              <li>L'analyse de l'audience et l'amélioration des services</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">4. Durée de conservation</h3>
            <p className="text-gray-600">Les données sont conservées pendant une durée maximale de 3 ans après la dernière activité.</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">5. Destinataires des données</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Personnel autorisé de Marketing-Online</li>
              <li>Recruteurs partenaires</li>
              <li>Prestataires techniques intervenant dans la gestion du site</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">6. Sécurité</h3>
            <p className="text-gray-600">Des mesures de sécurité adaptées sont mises en œuvre pour protéger les données contre tout accès non autorisé, perte ou altération.</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">7. Droits des utilisateurs</h3>
            <p className="text-gray-600">Conformément à la loi 09-08, toute personne peut accéder à ses données, les faire rectifier, s'opposer à leur traitement ou demander leur suppression en adressant une demande à : <a href="mailto:dpo@jobcallcenter.ma" className="text-blue-600 hover:underline">dpo@jobcallcenter.ma</a></p>
          </div>
        </section>
      </div>
    </div>
  )
}
