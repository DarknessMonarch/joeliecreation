export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/saloon',
          '/portfolio',
          '/sitemap.xml', 
        ],
        disallow: [
          '/api/*',
          '/not-found',
          '/*.json$', 
          '/private/',
        ],
        crawlDelay: 2
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'] 
      },
      {
        userAgent: 'CCBot',
        disallow: ['/']
      }
    ],
    sitemap: 'https://joeliescreation.swiftsyn.com/sitemap.xml',
    host: 'https://joeliescreation.swiftsyn.com'
  }
}