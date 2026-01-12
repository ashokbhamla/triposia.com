/**
 * Content processor for optimizing blog post HTML for SEO
 */

import { addHeadingIds } from '@/lib/tableOfContents';

/**
 * Process HTML content to ensure SEO optimization:
 * - Add alt text to images without alt attributes
 * - Ensure proper heading hierarchy
 * - Optimize links (add rel attributes, ensure proper structure)
 * - Add structured data hints
 * - Ensure semantic HTML structure
 */
export function processContentForSEO(
  html: string,
  options: {
    title?: string;
    slug?: string;
    defaultAltText?: string;
  } = {}
): string {
  if (!html) return '';

  const { title, slug, defaultAltText } = options;

  // Create a temporary container to parse HTML
  // Note: This is server-side, so we'll use string manipulation
  let processed = html;

  // 1. Ensure images have alt text
  processed = processed.replace(
    /<img([^>]*?)(?:\s+alt\s*=\s*["'][^"']*["'])?([^>]*?)>/gi,
    (match, before, after) => {
      // Check if alt attribute already exists
      if (/alt\s*=/i.test(match)) {
        return match; // Keep as is if alt exists
      }

      // Add alt text based on title or default
      const altText = title || defaultAltText || 'Blog post image';
      // Insert alt attribute before the closing >
      const insertPosition = match.lastIndexOf('>');
      const beforeClose = match.substring(0, insertPosition);
      const afterClose = match.substring(insertPosition);
      
      return `${beforeClose} alt="${altText}"${afterClose}`;
    }
  );

  // 2. Ensure images have loading="lazy" for performance (except first image)
  let imageCount = 0;
  processed = processed.replace(/<img([^>]*?)>/gi, (match) => {
    imageCount++;
    if (imageCount === 1) {
      // First image should load eagerly
      if (!/loading\s*=/i.test(match)) {
        return match.replace('>', ' loading="eager">');
      }
      return match;
    }
    // Subsequent images should lazy load
    if (!/loading\s*=/i.test(match)) {
      return match.replace('>', ' loading="lazy">');
    }
    return match;
  });

  // 3. Add dimensions hint for images (will be handled by CSS, but ensure width/height if available)
  // Note: This would require actual image dimensions, which we'll skip for now

  // 4. Optimize external links with proper attributes
  processed = processed.replace(
    /<a\s+([^>]*?href\s*=\s*["'](https?:\/\/[^"']+)["'][^>]*?)>/gi,
    (match) => {
      // Check if it's an external link (not our domain)
      const hrefMatch = match.match(/href\s*=\s*["']([^"']+)["']/i);
      if (hrefMatch && hrefMatch[1]) {
        const href = hrefMatch[1];
        const isExternal = /^https?:\/\//i.test(href) && 
          !href.includes('triposia.com');
        
        if (isExternal) {
          // Add rel="noopener noreferrer" for external links
          if (!/rel\s*=/i.test(match)) {
            return match.replace('>', ' rel="noopener noreferrer" target="_blank">');
          } else if (!/noopener/i.test(match)) {
            return match.replace(/rel\s*=\s*["']([^"']*)["']/i, 
              (relMatch, relValue) => `rel="${relValue} noopener noreferrer" target="_blank"`);
          } else if (!/target\s*=/i.test(match)) {
            return match.replace('>', ' target="_blank">');
          }
        }
      }
      return match;
    }
  );

  // 5. Ensure proper heading hierarchy (h2, h3, h4 - avoid h1 in content as page already has one)
  // Convert h1 tags in content to h2
  processed = processed.replace(/<h1([^>]*?)>/gi, '<h2$1>');
  processed = processed.replace(/<\/h1>/gi, '</h2>');

  // 6. Add schema.org microdata hints where appropriate
  // This is handled by JSON-LD, but we can add itemscope hints if needed

  // 7. Ensure proper semantic structure - wrap content in sections if needed
  // This is already handled by the page structure

  // 8. Add proper spacing and formatting
  // This is handled by CSS

  // 9. Add IDs to headings for table of contents
  processed = addHeadingIds(processed);

  return processed;
}

/**
 * Extract all images from HTML content
 */
export function extractImagesFromContent(html: string): Array<{
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}> {
  if (!html) return [];

  const images: Array<{ src: string; alt?: string; width?: number; height?: number }> = [];
  const imgRegex = /<img([^>]*?)>/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const imgTag = match[1];
    const srcMatch = imgTag.match(/src\s*=\s*["']([^"']+)["']/i);
    const altMatch = imgTag.match(/alt\s*=\s*["']([^"']*)["']/i);
    const widthMatch = imgTag.match(/width\s*=\s*["']?(\d+)["']?/i);
    const heightMatch = imgTag.match(/height\s*=\s*["']?(\d+)["']?/i);

    if (srcMatch) {
      images.push({
        src: srcMatch[1],
        alt: altMatch ? altMatch[1] : undefined,
        width: widthMatch ? parseInt(widthMatch[1], 10) : undefined,
        height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
      });
    }
  }

  return images;
}

/**
 * Extract text content from HTML (for SEO purposes)
 */
export function extractTextContent(html: string): string {
  if (!html) return '';

  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode HTML entities (basic ones)
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Generate image schema for blog post images
 */
export function generateImageSchema(images: Array<{ src: string; alt?: string }>): Array<{
  '@type': 'ImageObject';
  url: string;
  caption?: string;
}> {
  return images.map(img => ({
    '@type': 'ImageObject' as const,
    url: img.src,
    ...(img.alt && { caption: img.alt }),
  }));
}

