/**
 * Content Uniqueness Guard
 * 
 * Prevents repetitive content patterns across pages
 */

import crypto from 'crypto';

interface ContentPattern {
  hash: string;
  pageType: string;
  pattern: string;
  usageCount: number;
}

// In-memory store (in production, use Redis or database)
const contentPatterns = new Map<string, ContentPattern>();

/**
 * Generate content hash from text (normalized)
 */
function hashContent(text: string): string {
  const normalized = text
    .toLowerCase()
    .replace(/\d+/g, '[NUM]') // Replace numbers with placeholder
    .replace(/\s+/g, ' ')
    .trim();
  
  return crypto.createHash('sha256').update(normalized).digest('hex').substring(0, 16);
}

/**
 * Check if content pattern is unique
 * Returns false if pattern is overused
 */
export function isContentPatternUnique(
  content: string,
  pageType: string,
  maxUsage: number = 3
): boolean {
  const hash = hashContent(content);
  const key = `${pageType}:${hash}`;

  if (!contentPatterns.has(key)) {
    contentPatterns.set(key, {
      hash,
      pageType,
      pattern: content,
      usageCount: 1,
    });
    return true;
  }

  const pattern = contentPatterns.get(key)!;
  pattern.usageCount++;

  // Block if pattern is used too many times
  if (pattern.usageCount > maxUsage) {
    return false;
  }

  return true;
}

/**
 * Check if sentence structure is unique
 * Detects templated sentences like "There are X flights from Y to Z"
 */
export function isSentenceStructureUnique(
  sentence: string,
  pageType: string
): boolean {
  // Extract structure (remove actual values)
  const structure = sentence
    .replace(/\d+/g, '[NUM]')
    .replace(/[A-Z]{3}/g, '[IATA]') // Airport codes
    .replace(/[A-Z][a-z]+/g, '[NAME]') // City/airline names
    .toLowerCase()
    .trim();

  const hash = hashContent(structure);
  const key = `${pageType}:structure:${hash}`;

  if (!contentPatterns.has(key)) {
    contentPatterns.set(key, {
      hash,
      pageType,
      pattern: structure,
      usageCount: 1,
    });
    return true;
  }

  const pattern = contentPatterns.get(key)!;
  pattern.usageCount++;

  // Block templated structures after 2 uses
  if (pattern.usageCount > 2) {
    return false;
  }

  return true;
}

/**
 * Validate content before rendering
 * Returns false if content should be blocked
 */
export function validateContentUniqueness(
  content: string,
  pageType: 'airport' | 'route' | 'airline' | 'blog'
): { isUnique: boolean; reason?: string } {
  // Check sentence structure uniqueness
  if (!isSentenceStructureUnique(content, pageType)) {
    return {
      isUnique: false,
      reason: 'Sentence structure is overused across pages',
    };
  }

  // Check content pattern uniqueness
  if (!isContentPatternUnique(content, pageType, 3)) {
    return {
      isUnique: false,
      reason: 'Content pattern is overused',
    };
  }

  return { isUnique: true };
}

