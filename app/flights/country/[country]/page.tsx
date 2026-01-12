import { Metadata } from 'next';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { getRoutesByCountry } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList, formatRouteSlug } from '@/lib/seo';
import Link from 'next/link';
import FlightIcon from '@mui/icons-material/Flight';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/company';
import { notFound } from 'next/navigation';

export const revalidate = 86400; // ISR: 24 hours

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const countryName = decodeURIComponent(country.replace(/-/g, ' '));
  
  return genMeta({
    title: `Flight Routes in ${countryName} - Route Directory`,
    description: `Browse flight routes in ${countryName}. Find routes, schedules, airlines, and flight frequencies.`,
    canonical: `/flights/country/${country}`,
  });
}

export async function generateStaticParams() {
  // Efficiently get unique countries directly from database
  const { getDatabase } = await import('@/lib/mongodb');
  const db = await getDatabase();
  const routesCollection = db.collection<any>('routes');
  const airportsCollection = db.collection<any>('airports');
  
  // Get distinct origin IATA codes from routes
  const originIatas = await routesCollection.distinct('origin_iata', {
    has_flight_data: true
  });
  
  // Get countries for these origins
  const airports = await airportsCollection.find({
    iata_from: { $in: originIatas.slice(0, 1000) } // Limit to prevent timeout
  }).project({ country: 1 }).toArray();
  
  const countries = Array.from(new Set(airports.map(a => a.country).filter(Boolean)));
  
  // Limit to top 30 countries to prevent timeout
  const limitedCountries = countries.slice(0, 30);
  
  return limitedCountries.map(country => ({
    country: country!.replace(/\s+/g, '-').toLowerCase(),
  }));
}

export default async function CountryRoutesPage({ params }: PageProps) {
  const { country } = await params;
  const countryName = decodeURIComponent(country.replace(/-/g, ' '));
  const routesByCountry = await getRoutesByCountry();
  
  // Find matching country (case-insensitive)
  const matchingCountry = Object.keys(routesByCountry).find(
    c => c?.toLowerCase().replace(/\s+/g, '-') === country.toLowerCase()
  );
  
  if (!matchingCountry || !routesByCountry[matchingCountry]) {
    notFound();
  }
  
  const routes = routesByCountry[matchingCountry];
  
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Flights', url: `${siteUrl}/flights` },
    { name: `Routes in ${matchingCountry}`, url: `${siteUrl}/flights/country/${country}` },
  ]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Flights', href: '/flights' },
          { label: matchingCountry, href: `/flights/country/${country}` },
        ]}
      />
      <JsonLd data={breadcrumbData} />
      
      <Typography variant="h1" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>
        Flight Routes in {matchingCountry}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        Browse {routes.length} flight routes in {matchingCountry}. Each route page includes schedules, airlines, aircraft types, and flight frequencies.
      </Typography>

      <Grid container spacing={2}>
        {routes.map((route) => {
          const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
          return (
            <Grid item xs={12} sm={6} md={4} key={`${route.origin_iata}-${route.destination_iata}`}>
              <Paper
                component={Link}
                href={`/flights/${routeSlug}`}
                sx={{
                  p: 2,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    boxShadow: 2,
                  },
                }}
              >
                <FlightIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {route.origin_iata} → {route.destination_iata}
                  </Typography>
                  {route.destination_city && (
                    <Typography variant="body2" color="text.secondary">
                      {route.destination_city}
                    </Typography>
                  )}
                  {route.flights_per_day && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {route.flights_per_day} flights/day
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

