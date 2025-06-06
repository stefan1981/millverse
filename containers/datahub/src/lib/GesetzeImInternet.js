import { Postgres } from './postgres.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export class GesetzeImInternet {
  constructor() {
    this.postgres = new Postgres();
    this.postgres.connect();
  }
  // ************************************************************************************************
  async getLawTextLinksOnly(keywords) {
    
    const formattedKeywords = Array.isArray(keywords) ? keywords.join('+') : keywords.replace(/\s+/g, '+');
    const url = `https://www.gesetze-im-internet.de/cgi-bin/htsearch?config=Gesamt_bmjhome2005&method=or&words=${formattedKeywords}&suche=Suchen`;

    try {
        const response = await fetch(url);
        const html = await response.text();

        // Load HTML into Cheerio
        const $ = cheerio.load(html);

        // Extract links inside <dt> elements within #container
        const links = [];
        $('#container dt a').each((index, element) => {
          console.log(element)
            const href = $(element).attr('href');
            if (href) {
                links.push(`https://www.gesetze-im-internet.de${href}`); // Ensure absolute URL
            }
        });

        return links.length ? links : ['No links found'];
    } catch (error) {
        console.error('Error:', error);
        return ['Error fetching data'];
    }
}

// ************************************************************************************************
async getLawText(keywords, limit=5) {
  const formattedKeywords = Array.isArray(keywords) ? keywords.join('+') : keywords.replace(/\s+/g, '+');
  const url = `https://www.gesetze-im-internet.de/cgi-bin/htsearch?config=Gesamt_bmjhome2005&method=or&words=${formattedKeywords}&suche=Suchen`;

  try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      const results = [];
      let i = 0;
      $('#container dl').each((index, element) => {
          const linkElement = $(element).find('dt a');
          const textElement = $(element).find('dd');
          
          if (linkElement.length) {
              let href = linkElement.attr('href');
              const linkText = linkElement.text().trim();
              const lawText = textElement.text().trim().replace(/\s+/g, ' ');

              // Fix: Ensure the link is absolute
              if (!href.startsWith('http')) {
                  href = `https://www.gesetze-im-internet.de${href}`;
              }
              
              i = i + 1;
              if (i <= limit) {
                results.push({
                    title: linkText,
                    link: href,
                    text: lawText
                });
              }
          }
      });

      return results.length ? results : ['No relevant laws found'];
  } catch (error) {
      console.error('Error:', error);
      return ['Error fetching data'];
  }
}
  // ************************************************************************************************
}
