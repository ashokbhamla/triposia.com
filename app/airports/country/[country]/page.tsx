import { Metadata } from 'next';
import { Container, Typography, Box, Grid, Paper } from '@mui/material';
import { getAirportsByCountry } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import { formatAirportDisplay } from '@/lib/formatting';
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
    title: `Airports in ${countryName} - Airport Directory`,
    description: `Browse airports in ${countryName}. Find airport information, flight schedules, departures, arrivals, and destinations.`,
    canonical: `/airports/country/${country}`,
  });
}

export async function generateStaticParams() {
  // Efficiently get unique countries directly from database
  const { getDatabase } = await import('@/lib/mongodb');
  const db = await getDatabase();
  const collection = db.collection<any>('airports');
  
  // Get distinct countries with at least one active airport
  const countries = await collection.distinct('country', {
    $or: [
      { departure_count: { $gt: 0 } },
      { arrival_count: { $gt: 0 } }
    ]
  });
  
  // Limit to top 30 countries to prevent timeout
  const limitedCountries = countries.filter(Boolean).slice(0, 30);
  
  return limitedCountries.map(country => ({
    country: country!.replace(/\s+/g, '-').toLowerCase(),
  }));
}

export default async function CountryAirportsPage({ params }: PageProps) {
  const { country } = await params;
  const countryName = decodeURIComponent(country.replace(/-/g, ' '));
  const airportsByCountry = await getAirportsByCountry();
  
  // Find matching country (case-insensitive)
  const matchingCountry = Object.keys(airportsByCountry).find(
    c => c?.toLowerCase().replace(/\s+/g, '-') === country.toLowerCase()
  );
  
  if (!matchingCountry || !airportsByCountry[matchingCountry]) {
    notFound();
  }
  
  const airports = airportsByCountry[matchingCountry];
  const activeAirports = airports.filter(a => a.departure_count > 0 || a.arrival_count > 0);
  
  // Use pre-computed displayName from getAirportsByCountry, or format synchronously
  const airportsWithDisplay = activeAirports.map((airport) => {
    const displayName = airport.displayName || formatAirportDisplay(airport.iata_from, airport.city);
    return { ...airport, displayName };
  });
  
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Airports', url: `${siteUrl}/airports` },
    { name: `Airports in ${matchingCountry}`, url: `${siteUrl}/airports/country/${country}` },
  ]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Airports', href: '/airports' },
          { label: matchingCountry, href: `/airports/country/${country}` },
        ]}
      />
      <JsonLd data={breadcrumbData} />
      
      <Typography variant="h1" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>
        Airports in {matchingCountry}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        Browse {airportsWithDisplay.length} airports in {matchingCountry}. Each airport page includes flight information, departures, arrivals, destinations, and nearby attractions.
      </Typography>

      <Grid container spacing={2}>
        {airportsWithDisplay.map((airport) => (
          <Grid item xs={12} sm={6} md={4} key={airport.iata_from}>
            <Paper
              component={Link}
              href={`/airports/${airport.iata_from.toLowerCase()}`}
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
                  {airport.displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {airport.destinations_count} destinations • {airport.departure_count} daily departures
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

