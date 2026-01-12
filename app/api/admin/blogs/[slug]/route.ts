import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { validateBlogEntityLinks, BlogEntityLinks } from '@/lib/blogValidation';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/admin/blogs/[slug]
 * Get a specific blog
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
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
    const blog = await db.collection('blogs').findOne({ slug: params.slug });

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/blogs/[slug]
 * Update a blog (with validation)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
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
      title,
      excerpt,
      content_html,
      author_id,
      status,
      linked_entities,
    } = body;

    const db = await getDatabase();
    const existingBlog = await db.collection('blogs').findOne({ slug: params.slug });

    if (!existingBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Validate entity links
    const entityLinks: BlogEntityLinks = linked_entities || existingBlog.linked_entities || {};
    const validation = validateBlogEntityLinks(entityLinks);

    // Determine new status (use existing if not provided)
    const newStatus = status !== undefined ? status : existingBlog.status;

    // If trying to publish or update to published, enforce entity link requirement
    if (newStatus === 'published' && !validation.canPublish) {
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

    // If validation has errors, prevent update
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

    // Build update document
    const updateDoc: any = {
      updated_at: new Date(),
    };

    if (title !== undefined) updateDoc.title = title;
    if (excerpt !== undefined) updateDoc.excerpt = excerpt;
    if (content_html !== undefined) updateDoc.content_html = content_html;
    if (author_id !== undefined) updateDoc.author_id = author_id;
    if (linked_entities !== undefined) updateDoc.linked_entities = entityLinks;

    // Handle status changes
    if (newStatus !== existingBlog.status) {
      updateDoc.status = newStatus;
      
      // If publishing for the first time, set published_at
      if (newStatus === 'published' && !existingBlog.published_at) {
        updateDoc.published_at = new Date();
      }
    }

    const result = await db.collection('blogs').updateOne(
      { slug: params.slug },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Fetch updated blog
    const updatedBlog = await db.collection('blogs').findOne({ slug: params.slug });

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blogs/[slug]
 * Delete a blog
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
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
    const result = await db.collection('blogs').deleteOne({ slug: params.slug });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

