// Mock data for job listings
export const mockJobs = [
  {
    _id: '1',
    title: 'Téléconseiller Francophone',
    company: {
      name: 'CallCenter Pro',
      logo: '/images/companies/company1.png'
    },
    location: {
      city: 'Casablanca',
      address: '123 Avenue Hassan II'
    },
    contractType: 'CDI',
    salary: {
      min: 4500,
      max: 6000,
      currency: 'MAD'
    },
    description: "Nous recherchons un téléconseiller francophone pour rejoindre notre équipe à Casablanca. Vous serez chargé de répondre aux appels des clients, de les conseiller et de résoudre leurs problèmes.",
    requirements: "Français courant (écrit et oral), Bac+2, Expérience en centre d'appel souhaitée",
    skills: ['Service client', 'Communication', 'Français'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Conseiller Client Espagnol',
    company: {
      name: 'Global Services',
      logo: '/images/companies/company2.png'
    },
    location: {
      city: 'Rabat',
      address: '45 Avenue Mohammed V'
    },
    contractType: 'CDI',
    salary: {
      min: 5000,
      max: 7000,
      currency: 'MAD'
    },
    description: "Nous recherchons un conseiller client parlant espagnol pour notre centre d'appel à Rabat. Vous serez responsable de la gestion des appels entrants et sortants pour nos clients espagnols.",
    requirements: "Espagnol courant (écrit et oral), Français intermédiaire, Bac+2, 1 an d'expérience minimum",
    skills: ['Espagnol', 'Service client', 'Vente'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Superviseur Centre d\'Appel',
    company: {
      name: 'Maroc Teleservices',
      logo: '/images/companies/company3.png'
    },
    location: {
      city: 'Tanger',
      address: '78 Zone Industrielle'
    },
    contractType: 'CDI',
    salary: {
      min: 8000,
      max: 12000,
      currency: 'MAD'
    },
    description: "Nous recherchons un superviseur de centre d'appel expérimenté pour gérer une équipe de 15 téléconseillers. Vous serez responsable du suivi des performances, de la formation et du coaching de l'équipe.",
    requirements: "Français et Arabe courants, 3 ans d'expérience en centre d'appel dont 1 an en supervision, Bac+3",
    skills: ['Management', 'Coaching', 'Reporting', 'Centre d\'appel'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    title: 'Chargé de Recrutement',
    company: {
      name: 'CallCenter Pro',
      logo: '/images/companies/company1.png'
    },
    location: {
      city: 'Casablanca',
      address: '123 Avenue Hassan II'
    },
    contractType: 'CDI',
    salary: {
      min: 6000,
      max: 8000,
      currency: 'MAD'
    },
    description: "Nous recherchons un chargé de recrutement pour notre centre d'appel à Casablanca. Vous serez responsable du recrutement des téléconseillers et de la gestion des entretiens.",
    requirements: "Français courant, Expérience en recrutement, Bac+3 en RH ou équivalent",
    skills: ['Recrutement', 'Ressources Humaines', 'Entretiens'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '5',
    title: 'Téléconseiller Anglophone',
    company: {
      name: 'Global Services',
      logo: '/images/companies/company2.png'
    },
    location: {
      city: 'Marrakech',
      address: '22 Avenue Mohammed VI'
    },
    contractType: 'CDD',
    salary: {
      min: 5500,
      max: 7500,
      currency: 'MAD'
    },
    description: "Nous recherchons un téléconseiller anglophone pour notre centre d'appel à Marrakech. Vous serez chargé de répondre aux appels des clients anglophones et de les assister dans leurs démarches.",
    requirements: "Anglais courant (écrit et oral), Bac+2, Expérience en centre d'appel souhaitée",
    skills: ['Anglais', 'Service client', 'Communication'],
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: '6',
    title: 'Formateur Centre d\'Appel',
    company: {
      name: 'Maroc Teleservices',
      logo: '/images/companies/company3.png'
    },
    location: {
      city: 'Casablanca',
      address: '56 Boulevard Zerktouni'
    },
    contractType: 'CDI',
    salary: {
      min: 7000,
      max: 9000,
      currency: 'MAD'
    },
    description: "Nous recherchons un formateur pour notre centre d'appel à Casablanca. Vous serez responsable de la formation des nouveaux téléconseillers et de la mise à jour des supports de formation.",
    requirements: "Français courant, 3 ans d'expérience en centre d'appel, Expérience en formation, Bac+3",
    skills: ['Formation', 'Pédagogie', 'Centre d\'appel'],
    isActive: true,
    createdAt: new Date().toISOString()
  }
];
