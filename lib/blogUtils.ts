/**
 * Utility functions for blog posts
 */

/**
 * Calculate reading time in minutes based on word count
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 0;
  
  // Remove HTML tags and get plain text
  const text = content.replace(/<[^>]*>/g, '');
  // Count words
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Average reading speed: 225 words per minute
  const readingSpeed = 225;
  const minutes = Math.ceil(wordCount / readingSpeed);
  
  return Math.max(1, minutes); // At least 1 minute
}

/**
 * Count words in HTML content
 */
export function countWords(content: string): number {
  if (!content) return 0;
  
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Count words
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Extract keywords from content (simple implementation)
 * Extracts potential keywords from title and content
 */
export function extractKeywords(
  title: string,
  content: string,
  category?: string,
  tags?: string[]
): string[] {
  const keywords = new Set<string>();
  
  // Add category if available
  if (category) {
    keywords.add(category.toLowerCase());
  }
  
  // Add tags if available
  if (tags && tags.length > 0) {
    tags.forEach(tag => keywords.add(tag.toLowerCase()));
  }
  
  // Extract keywords from title (common travel/aviation terms)
  const titleWords = title.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3) // Only words longer than 3 chars
    .filter(word => !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'your'].includes(word));
  
  titleWords.forEach(word => keywords.add(word));
  
  // Add common travel-related keywords based on content analysis
  const contentLower = content.toLowerCase();
  const travelTerms = [
    'travel', 'flight', 'airport', 'airline', 'destination', 'trip', 'journey',
    'booking', 'ticket', 'luggage', 'passport', 'visa', 'hotel', 'accommodation',
    'vacation', 'holiday', 'tourist', 'traveler', 'tour', 'itinerary'
  ];
  
  travelTerms.forEach(term => {
    if (contentLower.includes(term)) {
      keywords.add(term);
    }
  });
  
  return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
}

/**
 * Extract first image URL from HTML content
 */
export function extractFirstImage(content: string): string | null {
  if (!content) return null;
  
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return null;
}

/**
 * Extract meta description from content if not provided
 */
export function generateMetaDescription(
  excerpt?: string,
  content?: string,
  maxLength: number = 160
): string {
  if (excerpt) {
    return excerpt.length > maxLength ? excerpt.substring(0, maxLength - 3) + '...' : excerpt;
  }
  
  if (content) {
    // Remove HTML tags and get first paragraph
    const text = content.replace(/<[^>]*>/g, ' ').trim();
    const firstSentence = text.split(/[.!?]/)[0];
    
    if (firstSentence.length <= maxLength) {
      return firstSentence;
    }
    
    return firstSentence.substring(0, maxLength - 3) + '...';
  }
  
  return '';
}

