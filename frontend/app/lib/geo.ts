import OpenAI from 'openai'

// Initialiser le client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Interface pour les paramètres de génération de contenu
interface GeoContentParams {
  ville: string
  poste: string
  langue?: 'fr' | 'ar' | 'en'
  sections?: ('intro' | 'description' | 'salaire' | 'faq' | 'marche')[]
}

// Interface pour le contenu généré
export interface GeoContent {
  intro: string
  description: string
  salaire: string
  faq: {
    question: string
    reponse: string
  }[]
  marche: string
}

/**
 * Génère du contenu optimisé pour le SEO via OpenAI pour une combinaison ville/poste
 */
export async function generateGeoContent({
  ville,
  poste,
  langue = 'fr',
  sections = ['intro', 'description', 'salaire', 'faq', 'marche'],
}: GeoContentParams): Promise<GeoContent> {
  try {
    // Construire le prompt en fonction des sections demandées
    let prompt = `Génère du contenu SEO optimisé en français pour une page d'emploi de "${poste}" à "${ville}" au Maroc. `
    
    if (sections.includes('intro')) {
      prompt += `
      1. INTRODUCTION: Un paragraphe d'introduction attrayant sur les opportunités d'emploi de ${poste} à ${ville}, avec des mots-clés naturellement intégrés.
      `
    }
    
    if (sections.includes('description')) {
      prompt += `
      2. DESCRIPTION DU POSTE: Une description détaillée du rôle de ${poste}, les responsabilités typiques et les compétences requises dans le contexte de ${ville}.
      `
    }
    
    if (sections.includes('salaire')) {
      prompt += `
      3. INFORMATIONS SALARIALES: Une analyse des salaires moyens pour ${poste} à ${ville}, avec des fourchettes réalistes basées sur l'expérience.
      `
    }
    
    if (sections.includes('faq')) {
      prompt += `
      4. FAQ: 3-5 questions et réponses fréquentes sur le poste de ${poste} à ${ville} (format: Q: Question / R: Réponse).
      `
    }
    
    if (sections.includes('marche')) {
      prompt += `
      5. MARCHÉ DE L'EMPLOI: Un aperçu du marché de l'emploi actuel pour ${poste} à ${ville}, mentionnant les tendances, la demande et les perspectives.
      `
    }
    
    prompt += `
    Assure-toi que le contenu est informatif, optimisé pour le SEO, et spécifique à ${ville} et au poste de ${poste}. Utilise un ton professionnel mais accessible.
    `

    // Appel à l'API OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en rédaction de contenu SEO pour le secteur de l\'emploi au Maroc, spécialisé dans les centres d\'appel.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    // Extraire et formater la réponse
    const content = response.choices[0].message.content || ''
    
    // Analyser et structurer le contenu généré
    return parseGeoContent(content)
  } catch (error) {
    console.error('Erreur lors de la génération du contenu GEO:', error)
    // Retourner du contenu par défaut en cas d'erreur
    return getDefaultGeoContent(ville, poste)
  }
}

/**
 * Analyse le texte généré par l'IA et le structure en sections
 */
function parseGeoContent(content: string): GeoContent {
  // Structure par défaut
  const result: GeoContent = {
    intro: '',
    description: '',
    salaire: '',
    faq: [],
    marche: ''
  }

  // Extraire l'introduction
  const introMatch = content.match(/INTRODUCTION:?\s*(.*?)(?=DESCRIPTION|$)/s)
  if (introMatch && introMatch[1]) {
    result.intro = introMatch[1].trim()
  }

  // Extraire la description
  const descriptionMatch = content.match(/DESCRIPTION DU POSTE:?\s*(.*?)(?=INFORMATIONS|$)/s)
  if (descriptionMatch && descriptionMatch[1]) {
    result.description = descriptionMatch[1].trim()
  }

  // Extraire les informations salariales
  const salaireMatch = content.match(/INFORMATIONS SALARIALES:?\s*(.*?)(?=FAQ|$)/s)
  if (salaireMatch && salaireMatch[1]) {
    result.salaire = salaireMatch[1].trim()
  }

  // Extraire les FAQ
  const faqMatch = content.match(/FAQ:?\s*(.*?)(?=MARCHÉ|$)/s)
  if (faqMatch && faqMatch[1]) {
    const faqContent = faqMatch[1].trim()
    const faqItems = faqContent.split(/Q:|Question:/)
      .filter(item => item.trim().length > 0)
      .map(item => {
        const parts = item.split(/R:|Réponse:/)
        if (parts.length >= 2) {
          return {
            question: parts[0].trim(),
            reponse: parts[1].trim()
          }
        }
        return null
      })
      .filter((item): item is { question: string, reponse: string } => item !== null)
    
    result.faq = faqItems
  }

  // Extraire les informations sur le marché
  const marcheMatch = content.match(/MARCHÉ DE L'EMPLOI:?\s*(.*?)(?=$)/s)
  if (marcheMatch && marcheMatch[1]) {
    result.marche = marcheMatch[1].trim()
  }

  return result
}

/**
 * Fournit du contenu par défaut en cas d'échec de la génération
 */
function getDefaultGeoContent(ville: string, poste: string): GeoContent {
  return {
    intro: `Découvrez les meilleures opportunités d'emploi de ${poste} à ${ville}. JobCallCenter.ma vous propose une sélection d'offres d'emploi dans le secteur des centres d'appel à ${ville}.`,
    description: `Le poste de ${poste} à ${ville} implique généralement la gestion des appels clients, la résolution de problèmes et la fourniture d'un service client de qualité. Les candidats doivent posséder d'excellentes compétences en communication et une bonne maîtrise des outils informatiques.`,
    salaire: `Le salaire moyen pour un poste de ${poste} à ${ville} varie généralement entre 4000 et 8000 MAD par mois, selon l'expérience et les compétences linguistiques.`,
    faq: [
      {
        question: `Quelles sont les compétences requises pour devenir ${poste} à ${ville}?`,
        reponse: `Pour devenir ${poste} à ${ville}, vous devez avoir d'excellentes compétences en communication, une bonne maîtrise du français et/ou d'autres langues étrangères, des compétences informatiques de base et une capacité à travailler sous pression.`
      },
      {
        question: `Quels sont les horaires de travail typiques pour un ${poste} à ${ville}?`,
        reponse: `Les horaires de travail pour un ${poste} à ${ville} varient selon l'entreprise, mais incluent souvent des shifts de jour, de nuit ou en rotation pour assurer un service 24/7, particulièrement pour les clients internationaux.`
      },
      {
        question: `Faut-il un diplôme pour travailler comme ${poste} à ${ville}?`,
        reponse: `La plupart des entreprises à ${ville} demandent au minimum un baccalauréat pour les postes de ${poste}, bien que certaines puissent accepter des candidats sans diplôme mais avec une bonne maîtrise des langues requises.`
      }
    ],
    marche: `Le marché de l'emploi pour les ${poste}s à ${ville} est actuellement dynamique, avec une demande constante de la part des entreprises nationales et internationales. Les compétences linguistiques, particulièrement en français et en anglais, sont très valorisées.`
  }
}

/**
 * Cache le contenu généré dans MongoDB ou le système de fichiers
 * Note: Cette fonction est un placeholder et devrait être implémentée selon les besoins
 */
export async function cacheGeoContent(key: string, content: GeoContent): Promise<void> {
  // Implémenter la logique de cache ici (MongoDB, Redis, système de fichiers, etc.)
  console.log(`Contenu GEO mis en cache pour: ${key}`)
}

/**
 * Récupère le contenu généré depuis le cache
 * Note: Cette fonction est un placeholder et devrait être implémentée selon les besoins
 */
export async function getCachedGeoContent(key: string): Promise<GeoContent | null> {
  // Implémenter la logique de récupération du cache ici
  return null
}
