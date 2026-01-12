import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { validateBlogEntityLinks, BlogEntityLinks } from '@/lib/blogValidation';

/**
 * GET /api/admin/blogs
 * List all blogs
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const blogs = await db.collection('blogs').find({}).toArray();

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blogs
 * Create a new blog (with validation)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('admin_token')?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      slug,
      title,
      excerpt,
      content_html,
      author_id,
      status,
      linked_entities,
    } = body;

    // Validate required fields
    if (!slug || !title || !content_html || !author_id) {
      return NextResponse.json(
        { error: 'Missing required fields: slug, title, content_html, author_id' },
        { status: 400 }
      );
    }

    // Validate entity links
    const entityLinks: BlogEntityLinks = linked_entities || {};
    const validation = validateBlogEntityLinks(entityLinks);

    // If trying to publish, enforce entity link requirement
    if (status === 'published' && !validation.canPublish) {
      return NextResponse.json(
        {
          error: 'Cannot publish blog without entity links',
          validation: {
            errors: validation.errors,
            warnings: validation.warnings,
          },
        },
        { status: 400 }
      );
    }

    // If validation has errors, prevent creation
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Blog entity links validation failed',
          validation: {
            errors: validation.errors,
            warnings: validation.warnings,
          },
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const now = new Date();

    // Check if slug already exists
    const existingBlog = await db.collection('blogs').findOne({ slug });
    if (existingBlog) {
      return NextResponse.json(
        { error: 'Blog with this slug already exists' },
        { status: 400 }
      );
    }

    // Create blog document
    const blogDoc = {
      slug,
      title,
      excerpt: excerpt || '',
      content_html,
      author_id,
      status: status || 'draft',
      linked_entities: entityLinks,
      published_at: status === 'published' ? now : null,
      created_at: now,
      updated_at: now,
    };

    const result = await db.collection('blogs').insertOne(blogDoc);

    return NextResponse.json({
      id: result.insertedId,
      ...blogDoc,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

