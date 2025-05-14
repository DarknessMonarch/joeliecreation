export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/contact',
          '/home',
          '/portfolio',
          '/sitemap.xml', 
        ],
        disallow: [
          '/api/*',
          '/not-found',
          '/*.json$', 
          '/private/',
          '/[id]/', // Disallow dynamic ID routes
        ],
        crawlDelay: 2
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'] // This disallows GPTBot from crawling your site
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'] // This disallows CCBot from crawling your site
      }
    ],
    sitemap: 'https://joeliecreation.swiftsyn.com/sitemap.xml',
    host: 'https://joeliecreation.swiftsyn.com'
  }
}