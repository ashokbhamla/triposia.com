import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import Link from 'next/link';
import FlightIcon from '@mui/icons-material/Flight';
import BusinessIcon from '@mui/icons-material/Business';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import { Route, Airline, AirportSummary } from '@/lib/queries';
import { formatRouteAnchor, formatAirportAnchor, formatAirlineAnchor } from '@/lib/linking';
import { formatAirportDisplay } from '@/lib/formatting';

interface RelatedPagesProps {
  routes?: Array<Route & { shouldIndex?: boolean }>;
  airports?: Array<{ iata: string; city?: string; name?: string; shouldIndex?: boolean }>;
  airlines?: Airline[];
  maxRoutes?: number;
  maxAirports?: number;
  maxAirlines?: number;
}

export default function RelatedPages({
  routes = [],
  airports = [],
  airlines = [],
  maxRoutes = 6,
  maxAirports = 6,
  maxAirlines = 6,
}: RelatedPagesProps) {
  const displayRoutes = routes.filter(r => r.shouldIndex !== false).slice(0, maxRoutes);
  const displayAirports = airports.filter(a => a.shouldIndex !== false).slice(0, maxAirports);
  const displayAirlines = airlines.slice(0, maxAirlines);

  if (displayRoutes.length === 0 && displayAirports.length === 0 && displayAirlines.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: '1.75rem', mb: 2, textAlign: 'left' }}>
        Related Pages
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Related Routes */}
          {displayRoutes.length > 0 && (
            <Grid item xs={12} md={displayAirports.length > 0 || displayAirlines.length > 0 ? 6 : 12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FlightIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Related Routes
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {displayRoutes.map((route, idx) => {
                  const routeSlug = `${route.origin_iata.toLowerCase()}-${route.destination_iata.toLowerCase()}`;
                  return (
                    <Chip
                      key={`${route.origin_iata}-${route.destination_iata}`}
                      component={Link}
                      href={`/flights/${routeSlug}`}
                      label={formatRouteAnchor(route, idx)}
                      clickable
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
              </Box>
            </Grid>
          )}

          {/* Related Airports */}
          {displayAirports.length > 0 && (
            <Grid item xs={12} md={displayRoutes.length > 0 || displayAirlines.length > 0 ? 6 : 12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Related Airports
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {displayAirports.map((airport, idx) => {
                  const displayName = formatAirportDisplay(airport.iata, airport.city);
                  return (
                    <Chip
                      key={airport.iata}
                      component={Link}
                      href={`/airports/${airport.iata.toLowerCase()}`}
                      label={displayName}
                      clickable
                      icon={<BusinessIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
          )}

          {/* Related Airlines */}
          {displayAirlines.length > 0 && (
            <Grid item xs={12} md={displayRoutes.length > 0 || displayAirports.length > 0 ? 6 : 12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AirplanemodeActiveIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Related Airlines
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {displayAirlines.map((airline, idx) => {
                  const airlineCode = (airline.iata || airline.code || '').toLowerCase();
                  return (
                    <Chip
                      key={airlineCode}
                      component={Link}
                      href={`/airlines/${airlineCode}`}
                      label={formatAirlineAnchor(airline, idx)}
                      clickable
                      icon={<AirplanemodeActiveIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        '&:hover': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
}

