/**
 * Table of Contents utilities for blog posts
 */

export interface TocItem {
  id: string;
  text: string;
  level: number; // 1 for h2, 2 for h3, etc.
}

/**
 * Generate a slug from heading text for use as an ID
 */
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extract headings from HTML content and generate table of contents
 */
export function extractHeadings(html: string): TocItem[] {
  if (!html) return [];

  const headings: TocItem[] = [];
  const headingRegex = /<h([2-6])[^>]*>(.*?)<\/h[2-6]>/gi;
  let match;
  const usedIds = new Set<string>();

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2]
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .trim();

    if (!text) continue;

    // Generate a unique ID
    let baseId = generateHeadingId(text);
    let id = baseId;
    let counter = 1;
    
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    usedIds.add(id);
    
    headings.push({
      id,
      text,
      level,
    });
  }

  return headings;
}

/**
 * Add IDs to headings in HTML content for anchor linking
 */
export function addHeadingIds(html: string): string {
  if (!html) return '';

  const usedIds = new Set<string>();
  let processed = html;

  // Process h2-h6 headings
  processed = processed.replace(/<h([2-6])([^>]*)>(.*?)<\/h[2-6]>/gi, (match, level, attrs, content) => {
    const text = content.replace(/<[^>]+>/g, '').trim();
    
    if (!text) return match;

    // Check if ID already exists
    const existingIdMatch = attrs.match(/id\s*=\s*["']([^"']+)["']/i);
    if (existingIdMatch) {
      return match; // Keep existing ID
    }

    // Generate a unique ID
    let baseId = generateHeadingId(text);
    let id = baseId;
    let counter = 1;
    
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    usedIds.add(id);

    // Add id attribute
    return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
  });

  return processed;
}

