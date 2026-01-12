// Note: In Next.js App Router, metadata is handled via generateMetadata function
// This component is kept for compatibility but metadata should be set in page files
interface SeoMetaProps {
  title: string;
  description: string;
  canonical?: string;
  noindex?: boolean;
}

export default function SeoMeta({ title, description, canonical, noindex }: SeoMetaProps) {
  // In App Router, metadata is handled via generateMetadata in page files
  // This component is a placeholder for any client-side SEO needs
  return null;
}

