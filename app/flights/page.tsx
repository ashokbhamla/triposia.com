import { Metadata } from 'next';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Grid, Chip } from '@mui/material';
import { getDatabase } from '@/lib/mongodb';
import { Route, getRoutesByCountry } from '@/lib/queries';
import { generateMetadata as genMeta, formatRouteSlug, generateBreadcrumbList } from '@/lib/seo';
import Link from 'next/link';
import FlightIcon from '@mui/icons-material/Flight';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/company';

// Use dynamic rendering to prevent build timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = genMeta({
  title: 'Flight Routes - Global Route Directory',
  description: 'Browse flight routes worldwide. Find flights between cities, view schedules, airlines, and flight frequencies. Complete route directory.',
  canonical: '/flights',
});

export default async function FlightsPage() {
  const db = await getDatabase();
  const routesCollection = db.collection<any>('routes');
  const routesByCountry = await getRoutesByCountry();
  
  // Get popular routes (with flight data)
  const routes = await routesCollection
    .find({ has_flight_data: true })
    .limit(500)
    .sort({ origin_iata: 1, destination_iata: 1 })
    .toArray();

  // Group routes by origin - map to Route interface
  const mappedRoutes: Route[] = routes.map((r: any) => ({
    _id: r._id,
    origin_iata: r.origin_iata,
    destination_iata: r.destination_iata,
    destination_city: r.destination_city,
    flights_per_day: r.flights_per_day,
    has_flight_data: r.has_flight_data || false,
  }));
  
  const routesByOrigin = mappedRoutes.reduce((acc, route) => {
    if (!acc[route.origin_iata]) {
      acc[route.origin_iata] = [];
    }
    acc[route.origin_iata].push(route);
    return acc;
  }, {} as Record<string, Route[]>);

  const origins = Object.keys(routesByOrigin).sort();
  
  // Get countries sorted by route count
  const countries = Object.keys(routesByCountry)
    .filter(c => c && routesByCountry[c].length > 0)
    .sort((a, b) => routesByCountry[b].length - routesByCountry[a].length);
  
  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Flights', url: `${siteUrl}/flights` },
  ]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Flights', href: '/flights' },
        ]}
      />
      <JsonLd data={breadcrumbData} />
      
      <Typography variant="h1" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>
        Flight Routes Directory
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '800px' }}>
        Browse {mappedRoutes.length} flight routes worldwide. Each route page includes schedules, airlines, aircraft types, flight frequencies, and nearby attractions at the destination.
      </Typography>

      {/* Country-wise Cards */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 3, textAlign: 'left' }}>
          Browse Routes by Country
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {countries.map((country) => {
            const countrySlug = country.replace(/\s+/g, '-').toLowerCase();
            const countryRoutes = routesByCountry[country];
            return (
              <Chip
                key={country}
                component={Link}
                href={`/flights/country/${countrySlug}`}
                label={`${country} (${countryRoutes.length})`}
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

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 3, textAlign: 'left' }}>
          Routes by Origin Airport
        </Typography>
        <Paper sx={{ p: 3 }}>
          <List>
            {origins.map((origin) => (
              <Box key={origin} sx={{ mb: 4 }}>
                <Typography variant="h3" sx={{ fontSize: '1.25rem', mb: 2, fontWeight: 600, textAlign: 'left' }}>
                  <Link href={`/flights/from-${origin.toLowerCase()}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    Flights from {origin}
                  </Link>
                </Typography>
                <Grid container spacing={1}>
                  {routesByOrigin[origin].slice(0, 20).map((route) => {
                    const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={`${route.origin_iata}-${route.destination_iata}`}>
                        <ListItem
                          component={Link}
                          href={`/flights/${routeSlug}`}
                          sx={{
                            textDecoration: 'none',
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            mb: 1,
                            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                          }}
                        >
                          <FlightIcon sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
                          <ListItemText
                            primary={`${route.origin_iata} → ${route.destination_iata} (${route.destination_city})`}
                            secondary={route.flights_per_day}
                          />
                        </ListItem>
                      </Grid>
                    );
                  })}
                </Grid>
                {routesByOrigin[origin].length > 20 && (
                  <Typography variant="body2" color="primary" sx={{ mt: 2 }}>
                    <Link href={`/flights/from-${origin.toLowerCase()}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      View all {routesByOrigin[origin].length} routes from {origin} →
                    </Link>
                  </Typography>
                )}
              </Box>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

