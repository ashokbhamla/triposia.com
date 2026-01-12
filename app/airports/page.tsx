import { Metadata } from 'next';
import { Container, Typography, Box, Grid, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import { getAirportsByCountry } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import { formatAirportDisplay } from '@/lib/formatting';
import Link from 'next/link';
import FlightIcon from '@mui/icons-material/Flight';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/company';

// Use dynamic rendering to prevent build timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = genMeta({
  title: 'Airports - Global Airport Directory',
  description: 'Browse airports worldwide with flight information, departures, arrivals, and destinations. Complete airport directory with IATA codes.',
  canonical: '/airports',
});

export default async function AirportsPage() {
  // Only call getAirportsByCountry to avoid duplicate queries
  const airportsByCountry = await getAirportsByCountry();
  
  // Flatten all airports from country groups
  const allAirports = Object.values(airportsByCountry).flat();
  
  // Filter airports with at least some activity
  const activeAirports = allAirports.filter(a => a.departure_count > 0 || a.arrival_count > 0);
  
  // Sort by departure count (busiest first) and limit to top 500 for performance
  const sortedAirports = activeAirports
    .sort((a, b) => b.departure_count - a.departure_count)
    .slice(0, 500);

  // Use pre-computed displayName from getAirportsByCountry
  const airportsWithDisplay = sortedAirports.map((airport) => {
    const displayName = airport.displayName || formatAirportDisplay(airport.iata_from, airport.city);
    return { ...airport, displayName };
  });
  
  // Get countries sorted by airport count (limit to top 30 for performance)
  const countries = Object.keys(airportsByCountry)
    .filter(c => c && airportsByCountry[c].some(a => a.departure_count > 0 || a.arrival_count > 0))
    .sort((a, b) => airportsByCountry[b].length - airportsByCountry[a].length)
    .slice(0, 30);
  
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Airports', url: `${siteUrl}/airports` },
  ]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Airports', href: '/airports' },
        ]}
      />
      <JsonLd data={breadcrumbData} />
      
      <Typography variant="h1" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>
        Airports Directory
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '800px' }}>
        Browse {airportsWithDisplay.length} airports worldwide. Each airport page includes flight information, departures, arrivals, destinations, and nearby attractions.
      </Typography>

      {/* Country-wise Cards */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 3, textAlign: 'left' }}>
          Browse Airports by Country
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {countries.map((country) => {
            const countrySlug = country.replace(/\s+/g, '-').toLowerCase();
            const countryAirports = airportsByCountry[country].filter(a => a.departure_count > 0 || a.arrival_count > 0);
            return (
              <Chip
                key={country}
                component={Link}
                href={`/airports/country/${countrySlug}`}
                label={`${country} (${countryAirports.length})`}
                clickable
                sx={{
                  fontSize: '0.95rem',
                  height: 36,
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 3, textAlign: 'left' }}>
          Popular Airports
        </Typography>
        <Grid container spacing={2}>
          {airportsWithDisplay.slice(0, 50).map((airport) => (
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
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2, textAlign: 'left' }}>
          All Airports ({airportsWithDisplay.length})
        </Typography>
        <Paper sx={{ p: 2 }}>
          <List>
            {airportsWithDisplay.map((airport) => (
              <ListItem
                key={airport.iata_from}
                component={Link}
                href={`/airports/${airport.iata_from.toLowerCase()}`}
                sx={{
                  textDecoration: 'none',
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, minWidth: { xs: '100%', sm: 200 } }}>
                        {airport.displayName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {airport.destinations_count} destinations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {airport.departure_count} departures/day
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {airport.arrival_count} arrivals/day
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

