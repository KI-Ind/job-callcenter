// Mock data for candidates
export const mockCandidats = [
  {
    _id: '1',
    name: 'Ahmed Benali',
    profilePicture: '/images/candidates/candidate1.jpg',
    title: 'Téléconseiller Francophone',
    skills: ['Service client', 'Communication', 'Français', 'CRM'],
    location: {
      city: 'Casablanca',
    },
    experience: [
      {
        title: 'Téléconseiller',
        company: 'CallCenter Pro',
        startDate: '2020-05-01',
        endDate: '2022-06-30',
        description: 'Gestion des appels entrants pour un service client français'
      },
      {
        title: 'Agent de service client',
        company: 'Maroc Telecom',
        startDate: '2018-03-01',
        endDate: '2020-04-30',
        description: 'Support technique pour les clients particuliers'
      }
    ],
    education: [
      {
        degree: 'Licence en Commerce',
        institution: 'Université Hassan II',
        year: '2018'
      }
    ],
    languages: [
      { name: 'Arabe', level: 'Natif' },
      { name: 'Français', level: 'Courant' },
      { name: 'Anglais', level: 'Intermédiaire' }
    ],
    availableForWork: true
  },
  {
    _id: '2',
    name: 'Fatima Zahra',
    profilePicture: '/images/candidates/candidate2.jpg',
    title: 'Superviseur Centre d\'Appel',
    skills: ['Management', 'Formation', 'Reporting', 'Français', 'Espagnol'],
    location: {
      city: 'Rabat',
    },
    experience: [
      {
        title: 'Team Leader',
        company: 'Global Services',
        startDate: '2019-01-01',
        endDate: '2023-04-30',
        description: 'Supervision d\'une équipe de 15 téléconseillers'
      },
      {
        title: 'Téléconseiller Senior',
        company: 'Comdata Maroc',
        startDate: '2016-06-01',
        endDate: '2018-12-31',
        description: 'Gestion des appels complexes et formation des nouveaux agents'
      }
    ],
    education: [
      {
        degree: 'Master en Management',
        institution: 'ENCG Rabat',
        year: '2016'
      }
    ],
    languages: [
      { name: 'Arabe', level: 'Natif' },
      { name: 'Français', level: 'Courant' },
      { name: 'Espagnol', level: 'Courant' },
      { name: 'Anglais', level: 'Intermédiaire' }
    ],
    availableForWork: true
  },
  {
    _id: '3',
    name: 'Karim Tazi',
    profilePicture: '/images/candidates/candidate3.jpg',
    title: 'Conseiller Client Anglophone',
    skills: ['Service client', 'Communication', 'Anglais', 'Support technique'],
    location: {
      city: 'Tanger',
    },
    experience: [
      {
        title: 'Agent de support technique',
        company: 'Phone Excellence',
        startDate: '2021-03-01',
        endDate: '2023-05-31',
        description: 'Support technique en anglais pour une entreprise américaine'
      }
    ],
    education: [
      {
        degree: 'Licence en Informatique',
        institution: 'Université Abdelmalek Essaâdi',
        year: '2020'
      }
    ],
    languages: [
      { name: 'Arabe', level: 'Natif' },
      { name: 'Français', level: 'Courant' },
      { name: 'Anglais', level: 'Courant' }
    ],
    availableForWork: true
  },
  {
    _id: '4',
    name: 'Samira Alaoui',
    profilePicture: '/images/candidates/candidate4.jpg',
    title: 'Chargée de Recrutement',
    skills: ['Recrutement', 'Ressources Humaines', 'Entretiens', 'Français'],
    location: {
      city: 'Casablanca',
    },
    experience: [
      {
        title: 'Assistante RH',
        company: 'Maroc Teleservices',
        startDate: '2019-09-01',
        endDate: '2022-08-31',
        description: 'Gestion des recrutements et de l\'administration du personnel'
      },
      {
        title: 'Stagiaire RH',
        company: 'Atlas Call',
        startDate: '2019-02-01',
        endDate: '2019-08-31',
        description: 'Participation au processus de recrutement'
      }
    ],
    education: [
      {
        degree: 'Master en Ressources Humaines',
        institution: 'ISCAE Casablanca',
        year: '2019'
      }
    ],
    languages: [
      { name: 'Arabe', level: 'Natif' },
      { name: 'Français', level: 'Courant' },
      { name: 'Anglais', level: 'Intermédiaire' }
    ],
    availableForWork: false
  },
  {
    _id: '5',
    name: 'Youssef Amrani',
    profilePicture: '/images/candidates/candidate5.jpg',
    title: 'Téléconseiller Espagnol',
    skills: ['Service client', 'Communication', 'Espagnol', 'Vente'],
    location: {
      city: 'Marrakech',
    },
    experience: [
      {
        title: 'Conseiller commercial',
        company: 'Global Services',
        startDate: '2020-01-01',
        endDate: '2022-12-31',
        description: 'Vente de produits et services pour le marché espagnol'
      }
    ],
    education: [
      {
        degree: 'Licence en Langues Étrangères',
        institution: 'Université Cadi Ayyad',
        year: '2019'
      }
    ],
    languages: [
      { name: 'Arabe', level: 'Natif' },
      { name: 'Français', level: 'Courant' },
      { name: 'Espagnol', level: 'Courant' },
      { name: 'Anglais', level: 'Débutant' }
    ],
    availableForWork: true
  }
];
