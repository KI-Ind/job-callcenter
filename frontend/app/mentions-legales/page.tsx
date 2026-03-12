import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions Légales | JobCallCenter',
  description: 'Mentions légales et informations juridiques concernant le site JobCallCenter.ma',
}

export default function MentionsLegales() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">MENTIONS LÉGALES</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Éditeur du site</h2>
          <p className="mb-2">Le site JobCallCenter.ma est édité par :</p>
          <ul className="list-none space-y-2 text-gray-600 ml-1">
            <li><strong>Raison sociale :</strong> Marketing-Online</li>
            <li><strong>Forme juridique :</strong> SARL</li>
            <li><strong>Siège social :</strong> 68 Avenue Fal Ouled Oumeir, Rabat Agdal, Maroc</li>
            <li><strong>Email :</strong> <a href="mailto:contact@jobcallcenter.ma" className="text-blue-600 hover:underline">contact@jobcallcenter.ma</a></li>
            <li><strong>Téléphone :</strong> +212 (0) 5 37 77 19 56</li>
            <li><strong>Directeur de publication :</strong> Youssef HAMMOUMI</li>
            <li><strong>Identifiants légaux :</strong> RC 114491</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Hébergement</h2>
          <p className="mb-2">Le site est hébergé par la société Amazon Web Services (AWS), dont le siège social est situé au 67 Boulevard du Général Leclerc, 92110 Clichy, France.</p>
          <p className="text-gray-600">Téléphone : 0 800 94 77 15</p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Délégué à la protection des données (DPO)</h2>
          <p className="text-gray-600">Email de contact : <a href="mailto:dpo@jobcallcenter.ma" className="text-blue-600 hover:underline">dpo@jobcallcenter.ma</a></p>
        </section>
      </div>
    </div>
  )
}
