/**
 * SEO metadata utilities for Bing, Yandex, and Google optimization
 * 
 * Bing requirements:
 * - Title: 50-60 characters (preferred 50-55)
 * - Meta Description: 120-160 characters (preferred 120-155)
 * 
 * Yandex requirements:
 * - Title: 50-60 characters
 * - Meta Description: 120-160 characters
 */

const TITLE_MAX_LENGTH = 60;
const TITLE_PREFERRED_LENGTH = 55;
const DESCRIPTION_MIN_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 160;
const DESCRIPTION_PREFERRED_LENGTH = 155;

/**
 * Truncate title to optimal length for Bing/Yandex
 */
export function optimizeTitle(title: string): string {
  if (title.length <= TITLE_MAX_LENGTH) {
    return title;
  }
  
  // Try to truncate at word boundary
  const truncated = title.substring(0, TITLE_PREFERRED_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 40) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated.substring(0, TITLE_PREFERRED_LENGTH) + '...';
}

/**
 * Optimize description to optimal length for Bing/Yandex
 */
export function optimizeDescription(description: string): string {
  if (description.length >= DESCRIPTION_MIN_LENGTH && description.length <= DESCRIPTION_MAX_LENGTH) {
    return description;
  }
  
  // If too short, try to expand with context
  if (description.length < DESCRIPTION_MIN_LENGTH) {
    return description;
  }
  
  // If too long, truncate at word boundary
  const truncated = description.substring(0, DESCRIPTION_PREFERRED_LENGTH);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > DESCRIPTION_MIN_LENGTH) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated.substring(0, DESCRIPTION_PREFERRED_LENGTH) + '...';
}

/**
 * Generate SEO-friendly title with length optimization
 */
export function generateSEOTitle(
  primary: string,
  secondary?: string,
  suffix?: string
): string {
  const parts: string[] = [primary];
  
  if (secondary) {
    parts.push(secondary);
  }
  
  if (suffix) {
    parts.push(suffix);
  }
  
  let title = parts.join(' - ');
  
  // Add site name if space allows
  const siteName = ' | Triposia';
  const availableSpace = TITLE_MAX_LENGTH - siteName.length;
  
  if (title.length > availableSpace) {
    title = optimizeTitle(title);
  }
  
  return title + siteName;
}

/**
 * Generate SEO-friendly description with length optimization
 */
export function generateSEODescription(
  mainText: string,
  additionalInfo?: string
): string {
  let description = mainText;
  
  if (additionalInfo && description.length < DESCRIPTION_MIN_LENGTH) {
    description = `${mainText} ${additionalInfo}`;
  }
  
  return optimizeDescription(description);
}

