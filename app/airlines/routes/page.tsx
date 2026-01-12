import { Metadata } from 'next';
import { Container, Typography, Box, Grid, Paper, Chip } from '@mui/material';
import { getDatabase } from '@/lib/mongodb';
import { getAllAirlines } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList, formatRouteSlug } from '@/lib/seo';
import Link from 'next/link';
import FlightIcon from '@mui/icons-material/Flight';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getSiteUrl } from '@/lib/company';

// Use dynamic rendering for this heavy page to prevent build timeouts
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = genMeta({
  title: 'Airline Routes Directory - All Airline Routes',
  description: 'Browse airline routes worldwide. Find routes by airline, view flight schedules, and destinations.',
  canonical: '/airlines/routes',
});

export default async function AirlineRoutesPage() {
  const db = await getDatabase();
  const departuresCollection = db.collection<any>('departures');
  const routesCollection = db.collection<any>('routes');
  const airlines = await getAllAirlines();
  
  // Get airline info for each code
  const airlineMap = new Map(
    airlines.map(a => {
      const code = a.iata?.toLowerCase() || a.code?.toLowerCase();
      return [code || '', a];
    })
  );

  // Get unique airline-route combinations from departures
  const airlineRouteMap = new Map<string, Set<string>>();
  
  // Sample departures to find airline-route combinations
  const departures = await departuresCollection
    .find({})
    .limit(10000)
    .toArray();

  // Build map of airline -> routes
  for (const flight of departures) {
    if (!flight.airline_iata || !flight.origin_iata || !flight.destination_iata) continue;
    
    const airlineCode = flight.airline_iata.toLowerCase();
    const routeKey = `${flight.origin_iata}-${flight.destination_iata}`;
    
    if (!airlineRouteMap.has(airlineCode)) {
      airlineRouteMap.set(airlineCode, new Set());
    }
    airlineRouteMap.get(airlineCode)!.add(routeKey);
  }

  // Get route details for each airline-route combination
  const routesByAirline: Record<string, Array<{ origin_iata: string; destination_iata: string; destination_city?: string; flights_per_day?: string; has_flight_data?: boolean }>> = {};
  
  for (const [airlineCode, routeKeys] of airlineRouteMap.entries()) {
    routesByAirline[airlineCode] = [];
    
    for (const routeKey of routeKeys) {
      const [origin, destination] = routeKey.split('-');
      const route = await routesCollection.findOne({
        origin_iata: origin,
        destination_iata: destination,
        has_flight_data: true,
      });
      
      if (route) {
        routesByAirline[airlineCode].push({
          origin_iata: route.origin_iata,
          destination_iata: route.destination_iata,
          destination_city: route.destination_city,
          flights_per_day: route.flights_per_day,
          has_flight_data: route.has_flight_data,
        });
      }
    }
    
    // Sort routes by destination city
    routesByAirline[airlineCode].sort((a, b) => 
      (a.destination_city || a.destination_iata).localeCompare(b.destination_city || b.destination_iata)
    );
  }

  // Process all airlines and group routes by country
  const airportsCollection = db.collection<any>('airports');
  const airlinesWithCountryData = await Promise.all(
    Object.entries(routesByAirline)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 100)
      .map(async ([airlineCode, airlineRoutes]) => {
        const airline = airlineMap.get(airlineCode.toLowerCase());
        const airlineName = airline?.name || airlineCode.toUpperCase();
        const airlineCountry = airline?.country || 'Unknown';
        
        // Group routes by destination country
        const routesByCountry: Record<string, typeof airlineRoutes> = {};
        
        // Get destination countries for routes
        const destinationIatas = airlineRoutes.map(r => r.destination_iata);
        const destinationAirports = await airportsCollection
          .find({ iata_from: { $in: destinationIatas } })
          .toArray();
        
        const airportCountryMap = new Map(
          destinationAirports.map((a: any) => [a.iata_from, a.country || 'Unknown'])
        );
        
        airlineRoutes.forEach(route => {
          const country = airportCountryMap.get(route.destination_iata) || 'Unknown';
          if (!routesByCountry[country]) {
            routesByCountry[country] = [];
          }
          routesByCountry[country].push(route);
        });
        
        return { airlineCode, airlineRoutes, airlineName, airlineCountry, routesByCountry };
      })
  );

  const siteUrl = getSiteUrl();
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Airlines', url: `${siteUrl}/airlines` },
    { name: 'Airline Routes', url: `${siteUrl}/airlines/routes` },
  ]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Airlines', href: '/airlines' },
          { label: 'Routes', href: '/airlines/routes' },
        ]}
      />
      <JsonLd data={breadcrumbData} />

      <Typography variant="h1" gutterBottom sx={{ mb: 2, textAlign: 'left' }}>
        Airline Routes Directory
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.8 }}>
        Browse airline routes by airline and country. Each route page includes schedules, flight frequencies, and destination information.
      </Typography>

      {/* Group by Country */}
      {airlinesWithCountryData.map(({ airlineCode, airlineRoutes, airlineName, airlineCountry, routesByCountry }) => (
            <Box key={airlineCode} sx={{ mb: 4 }}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h2" sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 1 }}>
                      <Link
                        href={`/airlines/${airlineCode.toLowerCase()}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {airlineName}
                      </Link>
                    </Typography>
                    {airlineCountry && airlineCountry !== 'Unknown' && (
                      <Typography variant="body2" color="text.secondary">
                        Based in {airlineCountry}
                      </Typography>
                    )}
                  </Box>
                  <Chip label={`${airlineRoutes.length} routes`} size="medium" color="primary" />
                </Box>
                
                {/* Routes grouped by country */}
                {Object.entries(routesByCountry)
                  .sort((a, b) => b[1].length - a[1].length)
                  .map(([country, routes]) => (
                    <Box key={country} sx={{ mb: 3 }}>
                      <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, color: 'primary.main' }}>
                        {country} ({routes.length} {routes.length === 1 ? 'route' : 'routes'})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {/* Airline-Airport pages */}
                        {Array.from(new Set(routes.map(r => r.origin_iata)))
                          .map(originIata => (
                            <Chip
                              key={`airport-${originIata}`}
                              component={Link}
                              href={`/airlines/${airlineCode.toLowerCase()}/${originIata.toLowerCase()}`}
                              label={`${airlineName} from ${originIata}`}
                              clickable
                              size="small"
                              variant="outlined"
                              icon={<FlightIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                },
                              }}
                            />
                          ))}
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {/* Airline-Route pages */}
                        {routes.slice(0, 30).map((route: any) => {
                          const routeSlug = formatRouteSlug(route.origin_iata, route.destination_iata);
                          return (
                            <Chip
                              key={`${route.origin_iata}-${route.destination_iata}`}
                              component={Link}
                              href={`/airlines/${airlineCode.toLowerCase()}/${routeSlug}`}
                              label={`${route.origin_iata} → ${route.destination_iata}`}
                              clickable
                              size="small"
                              icon={<FlightIcon sx={{ fontSize: 16 }} />}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                },
                              }}
                            />
                          );
                        })}
                        {routes.length > 30 && (
                          <Chip
                            component={Link}
                            href={`/airlines/${airlineCode.toLowerCase()}`}
                            label={`+${routes.length - 30} more`}
                            clickable
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  ))}
              </Paper>
            </Box>
          ))}
    </Container>
  );
}

