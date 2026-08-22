import { tool } from 'ai';
import { z } from 'zod';

// Fetches the title and description meta tags from a given URL.
// Used when a visitor asks the chat about a specific page or link
// (e.g. "what does this page say?" or "check my HireIQ page").
export const fetchMetaTags = tool({
  description:
    'Fetch the page title and meta description from a given URL. Use this when the user asks about a specific webpage or shares a link.',
  inputSchema: z.object({
    url: z
      .string()
      .describe('The full URL to fetch meta tags from, including https://'),
  }),
  execute: async ({ url }) => {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PortfolioBot/1.0)' },
      });

      if (!response.ok) {
        return {
          success: false as const,
          error: `Request failed with status ${response.status}`,
        };
      }

      const html = await response.text();

      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const descMatch = html.match(
        /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
      );

      const title = titleMatch ? titleMatch[1].trim() : null;
      const description = descMatch ? descMatch[1].trim() : null;

      if (!title && !description) {
        return {
          success: false as const,
          error: 'No title or description meta tags found on this page.',
        };
      }

      return {
        success: true as const,
        url,
        title: title ?? 'Untitled',
        description: description ?? 'No description available.',
      };
    } catch (err) {
      return {
        success: false as const,
        error: err instanceof Error ? err.message : 'Failed to fetch the URL.',
      };
    }
  },
});