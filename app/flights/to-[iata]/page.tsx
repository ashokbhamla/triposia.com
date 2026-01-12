import { Metadata } from 'next';
import { Container, Typography, Box, Grid } from '@mui/material';
import { getAirportSummary, getFlightsFromAirport, getFlightsToAirport, getRoutesToAirport } from '@/lib/queries';
import { generateMetadata as genMeta, generateBreadcrumbList } from '@/lib/seo';
import { formatAirportDisplay } from '@/lib/formatting';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import StatCard from '@/components/ui/StatCard';
import OpenStreetMap from '@/components/maps/OpenStreetMap';
import AirportFlightsTabs from '@/components/flights/AirportFlightsTabs';
import FlightIcon from '@mui/icons-material/Flight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface PageProps {
  params: {
    iata: string;
  };
}

export const revalidate = 86400; // ISR: 24 hours

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const iata = params?.iata?.toUpperCase() || '';
  const airport = await getAirportSummary(iata);
  
  const title = airport
    ? `All Flights to ${iata} Airport - Destinations, Departures & Arrivals`
    : `Flights to ${iata}`;
  
  const description = airport
    ? `Complete flight information for ${iata} Airport: ${airport.destinations_count} destinations, ${airport.departure_count} daily departures, ${airport.arrival_count} daily arrivals.`
    : `View all flights to ${iata} Airport.`;

  return genMeta({
    title,
    description,
    canonical: `/flights/to-${iata.toLowerCase()}`,
  });
}

export default async function FlightsToPage({ params }: PageProps) {
  const iata = params?.iata?.toUpperCase() || '';
  const airport = await getAirportSummary(iata);
  const departures = await getFlightsFromAirport(iata);
  const arrivals = await getFlightsToAirport(iata);
  const routesTo = await getRoutesToAirport(iata);

  if (!airport) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Airport {iata} Not Found
        </Typography>
      </Container>
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://triposia.com';
  const breadcrumbData = generateBreadcrumbList([
    { name: 'Home', url: siteUrl },
    { name: 'Flights', url: `${siteUrl}/flights` },
    { name: `Flights to ${iata}`, url: `${siteUrl}/flights/to-${iata.toLowerCase()}` },
  ]);

  // Create origins list from routes (where flights come FROM to get TO this airport)
  const originsMap = new Map<string, { iata: string; city: string; flights_per_day: string }>();
  const uniqueOrigins = Array.from(new Set(routesTo.map(r => r.origin_iata)));
  
  // Fetch all origin airports in parallel
  const originAirports = await Promise.all(
    uniqueOrigins.map(origin => getAirportSummary(origin))
  );
  
  // Build origins map with city names
  routesTo.forEach(route => {
    if (!originsMap.has(route.origin_iata)) {
      const originAirport = originAirports.find(a => a?.iata_from === route.origin_iata);
      originsMap.set(route.origin_iata, {
        iata: route.origin_iata,
        city: originAirport?.city || route.origin_iata,
        flights_per_day: route.flights_per_day,
      });
    }
  });
  const origins = Array.from(originsMap.values());

  const airportDisplay = formatAirportDisplay(iata, airport.city);
  const introText = `${airport.arrival_count} daily arrivals from ${origins.length} origin${origins.length !== 1 ? 's' : ''} to ${airportDisplay}.`;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Flights', href: '/flights' },
          { label: `${iata} Flights`, href: `/flights/to-${iata.toLowerCase()}` },
        ]}
      />
      
      <JsonLd data={breadcrumbData} />

      <Typography variant="h1" gutterBottom sx={{ textAlign: 'left' }}>
        All Flights to {airportDisplay}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem', lineHeight: 1.8 }}>
        {introText}
      </Typography>

      {/* Summary Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Destinations"
            value={airport.destinations_count}
            subtitle="Cities served"
            icon={<LocationOnIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Daily Departures"
            value={airport.departure_count}
            subtitle="Outbound flights"
            icon={<FlightIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Daily Arrivals"
            value={airport.arrival_count}
            subtitle="Inbound flights"
            icon={<ScheduleIcon sx={{ color: 'primary.main' }} />}
          />
        </Grid>
      </Grid>

      {/* Tabs Component - For "to" page, we show arrivals and origins */}
      <AirportFlightsTabs
        iata={iata}
        city={airport.city}
        departures={departures}
        arrivals={arrivals}
        destinations={origins}
        isToPage={true}
      />

      {/* Map */}
      {airport.lat && airport.lng && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
            Airport Location
          </Typography>
          <OpenStreetMap
            lat={airport.lat}
            lon={airport.lng}
            zoom={12}
            marker={true}
            markerLabel={`${iata} Airport${airport.city ? ` - ${airport.city}` : ''}`}
            title=""
            height={300}
          />
        </Box>
      )}
    </Container>
  );
}

