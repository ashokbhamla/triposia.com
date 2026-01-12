import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getEntityRole, getSitemapPriority } from '@/lib/entityRoles';
import { COMPANY_INFO } from '@/lib/company';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Revalidate daily

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY_INFO.website;
  // Use a date within the last 15 days (7 days ago as default)
  const lastMod = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const urls: string[] = [];

  try {
    const db = await getDatabase();
    const blogsCollection = db.collection<any>('blogs');
    const blogs = await blogsCollection
      .find({ status: 'published' })
      .limit(10000)
      .toArray();

    for (const blog of blogs) {
      if (!blog.slug) continue;

      const role = getEntityRole('blog');
      const priority = getSitemapPriority(role);
      // Use blog's actual date if within last 15 days, otherwise use default
      const blogDate = blog.updated_at || blog.published_at;
      let blogLastMod = lastMod;
      if (blogDate) {
        const blogDateMs = new Date(blogDate).getTime();
        const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;
        if (blogDateMs > fifteenDaysAgo) {
          blogLastMod = new Date(blogDate).toISOString();
        }
      }

      urls.push(`  <url>
    <loc>${baseUrl}/blog/${blog.slug}</loc>
    <lastmod>${blogLastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`);
    }
  } catch (error) {
    // Blogs collection might not exist - return empty sitemap
    console.warn('Blogs collection not found:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

