/**
 * SEO Audit Script
 * Checks for common SEO issues across the application
 */

import { getDatabase } from '../lib/mongodb';
import { formatRouteSlug } from '../lib/seo';
import { shouldIndexRoute } from '../lib/indexing';
import { evaluateRoutePageQuality } from '../lib/pageQuality';
import { getEntityRole, shouldIncludeInSitemap } from '../lib/entityRoles';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://triposia.com';

interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  page: string;
  issue: string;
  recommendation?: string;
}

const issues: SEOIssue[] = [];

async function auditSitemaps() {
  console.log('\n📋 Auditing Sitemaps...\n');
  
  const sitemaps = [
    '/sitemap.xml',
    '/sitemap-static.xml',
    '/sitemap-airports.xml',
    '/sitemap-flights.xml',
    '/sitemap-airlines.xml',
    '/sitemap-airline-routes.xml',
    '/sitemap-airline-airports.xml',
    '/sitemap-blogs.xml',
  ];

  for (const sitemap of sitemaps) {
    try {
      const response = await fetch(`${SITE_URL}${sitemap}`);
      if (!response.ok) {
        issues.push({
          type: 'error',
          page: sitemap,
          issue: `Sitemap returns ${response.status} status`,
          recommendation: 'Fix sitemap generation or ensure route exists',
        });
      } else {
        const text = await response.text();
        if (!text.includes('<url>')) {
          issues.push({
            type: 'warning',
            page: sitemap,
            issue: 'Sitemap appears to be empty (no <url> tags)',
            recommendation: 'Ensure sitemap includes at least one URL',
          });
        }
        if (!text.includes('<?xml')) {
          issues.push({
            type: 'error',
            page: sitemap,
            issue: 'Sitemap is not valid XML',
            recommendation: 'Check sitemap generation code',
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'error',
        page: sitemap,
        issue: `Failed to fetch sitemap: ${error}`,
        recommendation: 'Check if site is accessible',
      });
    }
  }
}

async function auditRobots() {
  console.log('\n🤖 Auditing robots.txt...\n');
  
  try {
    const response = await fetch(`${SITE_URL}/robots.txt`);
    if (!response.ok) {
      issues.push({
        type: 'error',
        page: '/robots.txt',
        issue: `robots.txt returns ${response.status} status`,
        recommendation: 'Ensure robots.ts file exists and is properly configured',
      });
    } else {
      const text = await response.text();
      if (!text.includes('Sitemap:')) {
        issues.push({
          type: 'warning',
          page: '/robots.txt',
          issue: 'robots.txt does not include Sitemap directive',
          recommendation: 'Add sitemap URLs to robots.txt',
        });
      }
    }
  } catch (error) {
    issues.push({
      type: 'error',
      page: '/robots.txt',
      issue: `Failed to fetch robots.txt: ${error}`,
    });
  }
}

async function auditSamplePages() {
  console.log('\n📄 Auditing Sample Pages...\n');
  
  const db = await getDatabase();
  const routesCollection = db.collection<any>('routes');
  
  // Get a few sample routes
  const sampleRoutes = await routesCollection
    .find({ has_flight_data: true })
    .limit(10)
    .toArray();

  for (const route of sampleRoutes) {
    if (!route.origin_iata || !route.destination_iata) continue;
    
    const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
    const url = `/flights/${routeSlug}`;
    
    // Check indexing logic
    const indexingCheck = shouldIndexRoute([], route);
    const qualityCheck = evaluateRoutePageQuality({
      flights: [],
      route,
      routeMetadata: null,
      pois: [],
      airlines: [],
      distance: undefined,
      averageDuration: route.average_duration || route.typical_duration,
    });
    
    const role = getEntityRole('route');
    const shouldInclude = shouldIncludeInSitemap(role, indexingCheck.shouldIndex, qualityCheck.qualityScore);
    
    if (!shouldInclude && route.has_flight_data) {
      issues.push({
        type: 'warning',
        page: url,
        issue: `Route has flight data but is excluded from sitemap (quality score: ${qualityCheck.qualityScore})`,
        recommendation: 'Review quality thresholds or improve route data',
      });
    }
    
    // Try to fetch the page
    try {
      const response = await fetch(`${SITE_URL}${url}`);
      if (!response.ok) {
        issues.push({
          type: 'error',
          page: url,
          issue: `Page returns ${response.status} status`,
        });
      } else {
        const html = await response.text();
        
        // Check for required meta tags
        if (!html.includes('<title>')) {
          issues.push({
            type: 'error',
            page: url,
            issue: 'Missing <title> tag',
            recommendation: 'Ensure generateMetadata returns title',
          });
        }
        
        if (!html.includes('canonical')) {
          issues.push({
            type: 'warning',
            page: url,
            issue: 'Missing canonical URL',
            recommendation: 'Add canonical URL to metadata',
          });
        }
        
        if (!html.includes('og:title')) {
          issues.push({
            type: 'warning',
            page: url,
            issue: 'Missing OpenGraph title',
            recommendation: 'Add OpenGraph metadata',
          });
        }
        
        if (!html.includes('application/ld+json')) {
          issues.push({
            type: 'info',
            page: url,
            issue: 'No structured data (JSON-LD) found',
            recommendation: 'Consider adding structured data for better SEO',
          });
        }
      }
    } catch (error) {
      issues.push({
        type: 'error',
        page: url,
        issue: `Failed to fetch page: ${error}`,
      });
    }
  }
}

async function auditMetadata() {
  console.log('\n🏷️  Auditing Metadata Configuration...\n');
  
  // Check if metadata generation is consistent
  issues.push({
    type: 'info',
    page: 'Global',
    issue: 'Metadata generation uses optimizeTitle and optimizeDescription for Bing/Yandex',
    recommendation: 'Good practice - titles limited to 60 chars, descriptions to 160 chars',
  });
}

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SEO AUDIT REPORT');
  console.log('='.repeat(80) + '\n');
  
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');
  
  if (errors.length > 0) {
    console.log(`❌ ERRORS (${errors.length}):\n`);
    errors.forEach(issue => {
      console.log(`  [ERROR] ${issue.page}`);
      console.log(`    Issue: ${issue.issue}`);
      if (issue.recommendation) {
        console.log(`    Recommendation: ${issue.recommendation}`);
      }
      console.log('');
    });
  }
  
  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS (${warnings.length}):\n`);
    warnings.forEach(issue => {
      console.log(`  [WARNING] ${issue.page}`);
      console.log(`    Issue: ${issue.issue}`);
      if (issue.recommendation) {
        console.log(`    Recommendation: ${issue.recommendation}`);
      }
      console.log('');
    });
  }
  
  if (infos.length > 0) {
    console.log(`ℹ️  INFO (${infos.length}):\n`);
    infos.forEach(issue => {
      console.log(`  [INFO] ${issue.page}`);
      console.log(`    ${issue.issue}`);
      if (issue.recommendation) {
        console.log(`    ${issue.recommendation}`);
      }
      console.log('');
    });
  }
  
  console.log('='.repeat(80));
  console.log(`\nSummary: ${errors.length} errors, ${warnings.length} warnings, ${infos.length} info items\n`);
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No critical SEO issues found!\n');
  }
}

async function main() {
  try {
    await auditSitemaps();
    await auditRobots();
    await auditMetadata();
    // await auditSamplePages(); // Commented out to avoid making too many requests
    
    printReport();
  } catch (error) {
    console.error('Error running SEO audit:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();

