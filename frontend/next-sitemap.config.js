/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://toncallcenter.ma',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://toncallcenter.ma/sitemap-emplois.xml', // Sitemap dynamique pour les emplois
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/connexion', '/inscription', '/dashboard'],
      },
    ],
  },
  exclude: ['/admin/*', '/api/*', '/connexion', '/inscription', '/dashboard/*'],
  // Priorité et fréquence de changement pour les pages principales
  transform: async (config, path) => {
    // Personnaliser la priorité et la fréquence de changement en fonction du chemin
    let priority = 0.7;
    let changefreq = 'weekly';

    // Page d'accueil
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Pages d'emploi
    else if (path.startsWith('/emploi')) {
      priority = 0.8;
      changefreq = 'daily';
    }
    // Pages de ville
    else if (path.match(/\/emploi\/[^\/]+$/)) {
      priority = 0.9;
      changefreq = 'daily';
    }
    // Pages de blog
    else if (path.startsWith('/blog')) {
      priority = 0.6;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
}
