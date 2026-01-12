/**
 * Entity Role Awareness
 * 
 * Each page type has a role that determines:
 * - Linking depth (how many links to include)
 * - Indexing priority (importance for search engines)
 * - Sitemap inclusion order
 */

export type EntityRole = 'hub' | 'leaf' | 'editorial';

export interface EntityRoleInfo {
  role: EntityRole;
  priority: number; // Higher = more important (for sitemap ordering)
  maxInternalLinks: number;
  maxExternalLinks: number;
  description: string;
}

/**
 * Role definitions
 */
export const ENTITY_ROLES: Record<EntityRole, EntityRoleInfo> = {
  hub: {
    role: 'hub',
    priority: 100,
    maxInternalLinks: 15, // Hubs can link to many related entities
    maxExternalLinks: 5,
    description: 'Authority hubs (airports, airlines) - high linking depth, high priority',
  },
  leaf: {
    role: 'leaf',
    priority: 50,
    maxInternalLinks: 8, // Leaves link less deeply
    maxExternalLinks: 2,
    description: 'Route pages - moderate linking, moderate priority',
  },
  editorial: {
    role: 'editorial',
    priority: 75,
    maxInternalLinks: 10, // Blogs link to related entities
    maxExternalLinks: 3,
    description: 'Editorial content (blogs) - contextual linking, high priority',
  },
};

/**
 * Determine entity role from page type
 */
export function getEntityRole(pageType: 'airport' | 'route' | 'airline' | 'blog'): EntityRole {
  switch (pageType) {
    case 'airport':
    case 'airline':
      return 'hub';
    case 'route':
      return 'leaf';
    case 'blog':
      return 'editorial';
    default:
      return 'leaf'; // Default to leaf for unknown types
  }
}

/**
 * Get role info for a page type
 */
export function getRoleInfo(pageType: 'airport' | 'route' | 'airline' | 'blog'): EntityRoleInfo {
  const role = getEntityRole(pageType);
  return ENTITY_ROLES[role];
}

/**
 * Determine if a page should be included in sitemap based on role and quality
 */
export function shouldIncludeInSitemap(
  role: EntityRole,
  shouldIndex: boolean,
  qualityScore: number = 0
): boolean {
  if (!shouldIndex) {
    return false;
  }

  // Hubs always included if indexable
  if (role === 'hub') {
    return true;
  }

  // Editorial included if indexable
  if (role === 'editorial') {
    return true;
  }

  // Leaves included if indexable and have minimum quality
  if (role === 'leaf') {
    return qualityScore >= 3; // Minimum 3 unique data blocks
  }

  return false;
}

/**
 * Get sitemap priority for a page based on role
 * Returns 0.0 to 1.0 (standard sitemap priority range)
 */
export function getSitemapPriority(role: EntityRole, qualityScore: number = 0): number {
  const roleInfo = ENTITY_ROLES[role];
  const basePriority = roleInfo.priority / 100; // Convert to 0.0-1.0

  // Adjust based on quality score (for leaves, boost high-quality pages)
  if (role === 'leaf') {
    const qualityBoost = Math.min(qualityScore / 10, 0.2); // Max 0.2 boost
    return Math.min(basePriority + qualityBoost, 1.0);
  }

  return basePriority;
}

/**
 * Get maximum internal links for a page based on role
 */
export function getMaxInternalLinks(role: EntityRole): number {
  return ENTITY_ROLES[role].maxInternalLinks;
}

/**
 * Get maximum external links for a page based on role
 */
export function getMaxExternalLinks(role: EntityRole): number {
  return ENTITY_ROLES[role].maxExternalLinks;
}

/**
 * Determine linking strategy based on role
 * 
 * - Hubs: Link broadly (many routes, airlines, airports)
 * - Leaves: Link to related hubs (origin/dest airports, operating airlines)
 * - Editorial: Link contextually (only to mentioned entities)
 */
export function getLinkingStrategy(role: EntityRole): {
  includeRoutes: boolean;
  includeAirports: boolean;
  includeAirlines: boolean;
  includeBlogs: boolean;
  maxPerCategory: number;
} {
  switch (role) {
    case 'hub':
      return {
        includeRoutes: true,
        includeAirports: true,
        includeAirlines: true,
        includeBlogs: true,
        maxPerCategory: 6, // Hubs can link to many
      };
    case 'leaf':
      return {
        includeRoutes: false, // Leaves don't link to other routes
        includeAirports: true, // Link to origin/dest airports
        includeAirlines: true, // Link to operating airlines
        includeBlogs: true,
        maxPerCategory: 4, // Moderate linking
      };
    case 'editorial':
      return {
        includeRoutes: true,
        includeAirports: true,
        includeAirlines: true,
        includeBlogs: true,
        maxPerCategory: 3, // Contextual linking
      };
    default:
      return {
        includeRoutes: false,
        includeAirports: false,
        includeAirlines: false,
        includeBlogs: false,
        maxPerCategory: 0,
      };
  }
}

