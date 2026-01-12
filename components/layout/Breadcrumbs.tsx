'use client';

import { Breadcrumbs as MuiBreadcrumbs, Link, Typography } from '@mui/material';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const paths = pathname.split('/').filter(Boolean);
    const result: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
    
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      const label = path
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      result.push({ label, href: currentPath });
    });
    
    return result;
  })();

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        return isLast ? (
          <Typography key={item.href} color="text.primary">
            {item.label}
          </Typography>
        ) : (
          <Link
            key={item.href}
            component={NextLink}
            href={item.href}
            color="inherit"
            underline="hover"
          >
            {item.label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
}

