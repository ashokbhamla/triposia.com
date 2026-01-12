import { Metadata } from 'next';
import { Container, Typography } from '@mui/material';
import { getAllAirlines } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AirlineFilters from '@/components/airlines/AirlineFilters';
import { getSiteUrl } from '@/lib/company';
import AirlinesList from '@/components/airlines/AirlinesList';

export const metadata: Metadata = genMeta({
  title: 'Airlines - Global Airline Directory',
  description: 'Browse airlines worldwide. Find airline information, routes, destinations, and flight schedules.',
  canonical: '/airlines',
});

export const revalidate = 86400; // Revalidate daily

export default async function AirlinesPage() {
  const airlines = await getAllAirlines();
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Airlines', url: `${siteUrl}/airlines` },
  ]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Airlines', href: '/airlines' },
        ]}
      />

      <JsonLd data={breadcrumbData} />

      <Typography variant="h1" gutterBottom sx={{ mb: 4, textAlign: 'left' }}>
        Airlines
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '800px', lineHeight: 1.8 }}>
        Browse airlines from around the world. Click on any airline to view their routes, destinations, fleet information, and policies.
      </Typography>

      <AirlinesList airlines={airlines} />
    </Container>
  );
}
