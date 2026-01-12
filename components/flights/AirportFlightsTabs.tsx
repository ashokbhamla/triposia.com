'use client';

import { useState, useMemo } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Grid } from '@mui/material';
import FlightTable from '@/components/ui/FlightTable';
import Link from 'next/link';
import { formatAirportDisplay } from '@/lib/formatting-client';
import FlightModal from './FlightModal';
import RouteFilters, { RouteTypeFilter, StopFilter } from './RouteFilters';

interface AirportFlightsTabsProps {
  iata: string;
  city?: string | null;
  airportName?: string; // Full airport name for headings
  departures: any[];
  arrivals: any[];
  destinations: Array<{
    iata: string;
    city: string;
    flights_per_day: string;
    airport?: any; // Airport object for formatting
    display?: string; // Pre-formatted display string
    is_domestic?: boolean; // Whether route is domestic
  }>;
  origins?: Array<{
    iata: string;
    city: string;
    flights_per_day: string;
    airport?: any; // Airport object for formatting
    display?: string; // Pre-formatted display string
    is_domestic?: boolean; // Whether route is domestic
  }>; // Optional origins list for unified pages
  isToPage?: boolean; // If true, this is a "to" page (showing origins), if false/undefined it's a "from" page (showing destinations)
}

export default function AirportFlightsTabs({
  iata,
  city,
  airportName,
  departures,
  arrivals,
  destinations,
  origins,
  isToPage = false,
}: AirportFlightsTabsProps) {
  const [tabValue, setTabValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<{ origin: string; destination: string; originDisplay: string; destinationDisplay: string } | null>(null);
  const [routeTypeFilter, setRouteTypeFilter] = useState<RouteTypeFilter>('all');
  const [stopFilter, setStopFilter] = useState<StopFilter>('all');
  
  const airportDisplay = formatAirportDisplay(iata, city);
  const displayName = airportName || airportDisplay; // Use airport name if available, otherwise use city (IATA)

  // Filter destinations based on selected filters
  const filteredDestinations = useMemo(() => {
    let filtered = destinations;

    // Apply route type filter (domestic/international)
    if (routeTypeFilter === 'domestic') {
      filtered = filtered.filter(d => d.is_domestic === true);
    } else if (routeTypeFilter === 'international') {
      filtered = filtered.filter(d => d.is_domestic === false);
    }

    // Apply stop filter (for now, all routes are considered direct)
    // This can be enhanced when we have stop data in routes
    if (stopFilter === 'direct') {
      // All routes are direct for now
      filtered = filtered;
    } else if (stopFilter === 'one-stop') {
      // Filter for one-stop routes (when data is available)
      filtered = [];
    } else if (stopFilter === 'two-stop') {
      // Filter for two-stop routes (when data is available)
      filtered = [];
    }

    return filtered;
  }, [destinations, routeTypeFilter, stopFilter]);

  // Filter origins based on selected filters
  const filteredOrigins = useMemo(() => {
    if (!origins) return [];
    
    let filtered = origins;

    // Apply route type filter (domestic/international)
    if (routeTypeFilter === 'domestic') {
      filtered = filtered.filter(o => o.is_domestic === true);
    } else if (routeTypeFilter === 'international') {
      filtered = filtered.filter(o => o.is_domestic === false);
    }

    // Apply stop filter (for now, all routes are considered direct)
    if (stopFilter === 'direct') {
      filtered = filtered;
    } else if (stopFilter === 'one-stop' || stopFilter === 'two-stop') {
      filtered = [];
    }

    return filtered;
  }, [origins, routeTypeFilter, stopFilter]);
  const showOrigins = origins && origins.length > 0;

  const handleCardClick = (e: React.MouseEvent, origin: string, destination: string, originDisplay: string, destinationDisplay: string) => {
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.tagName === 'A') {
      return; // Let the link handle navigation
    }
    
    e.preventDefault();
    e.stopPropagation();
    setSelectedRoute({ origin, destination, originDisplay, destinationDisplay });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRoute(null);
  };

  // Calculate domestic/international counts for destinations
  const destinationsDomestic = destinations.filter(d => d.is_domestic !== false).length;
  const destinationsInternational = destinations.filter(d => d.is_domestic === false).length;

  // Calculate domestic/international counts for origins
  const originsDomestic = origins ? origins.filter(o => o.is_domestic !== false).length : 0;
  const originsInternational = origins ? origins.filter(o => o.is_domestic === false).length : 0;

  // Calculate unique airline counts
  const departureAirlines = new Set(departures.map(f => f.airline_iata || f.airline_name)).size;
  const arrivalAirlines = new Set(arrivals.map(f => f.airline_iata || f.airline_name)).size;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Paper sx={{ mb: 3, overflowX: 'auto' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="flight tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: { xs: 80, sm: 120 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
            },
          }}
        >
          <Tab label={isToPage ? `Origins (${filteredDestinations.length}/${destinations.length})` : `Destinations (${filteredDestinations.length}/${destinations.length})`} />
          {showOrigins && !isToPage && <Tab label={`Origins (${filteredOrigins.length}/${origins.length})`} />}
          <Tab label={`Departures (${departures.length})`} />
          <Tab label={`Arrivals (${arrivals.length})`} />
        </Tabs>
      </Paper>

      {/* Destinations/Origins Tab */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
            {isToPage ? `Flights to ${displayName}` : `Flights from ${displayName}`}
          </Typography>
          
          {/* Filters */}
          <RouteFilters
            routeType={routeTypeFilter}
            onRouteTypeChange={setRouteTypeFilter}
            stopType={stopFilter}
            onStopTypeChange={setStopFilter}
            showStopFilter={true}
          />
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
            {isToPage 
              ? `${origins?.length || 0} origin${(origins?.length || 0) !== 1 ? 's' : ''}${originsDomestic > 0 || originsInternational > 0 ? `: ${originsDomestic} domestic${originsInternational > 0 ? ` and ${originsInternational} international` : ''}` : ''}.`
              : `${destinations.length} destination${destinations.length !== 1 ? 's' : ''}${destinationsDomestic > 0 || destinationsInternational > 0 ? `: ${destinationsDomestic} domestic${destinationsInternational > 0 ? ` and ${destinationsInternational} international` : ''}` : ''}.`
            }
          </Typography>
          <Grid container spacing={2}>
            {filteredDestinations.map((dest) => {
              // For "to" pages, reverse the route: origin-destination instead of destination-origin
              const routeSlug = isToPage 
                ? `${dest.iata.toLowerCase()}-${iata.toLowerCase()}`
                : `${iata.toLowerCase()}-${dest.iata.toLowerCase()}`;
              
              const destDisplay = dest.display || formatAirportDisplay(dest.iata, dest.city);
              const originForRoute = isToPage ? dest.iata : iata;
              const destinationForRoute = isToPage ? iata : dest.iata;
              const originDisplayForRoute = isToPage ? destDisplay : displayName;
              const destinationDisplayForRoute = isToPage ? displayName : destDisplay;
              
              return (
              <Grid item xs={12} sm={6} md={4} key={dest.iata}>
                <Paper
                    onClick={(e) => handleCardClick(e, originForRoute, destinationForRoute, originDisplayForRoute, destinationDisplayForRoute)}
                    sx={{
                      p: 3,
                      display: 'block',
                      cursor: 'pointer',
                      position: 'relative',
                      '&:hover': { bgcolor: 'action.hover', boxShadow: 2 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {destDisplay}
                      </Typography>
                      {dest.is_domestic !== undefined && (
                        <Typography
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: dest.is_domestic ? 'success.light' : 'info.light',
                            color: dest.is_domestic ? 'success.dark' : 'info.dark',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        >
                          {dest.is_domestic ? 'Domestic' : 'International'}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {dest.flights_per_day}
                    </Typography>
                    <Typography 
                      variant="caption" 
                  component={Link}
                      href={`/flights/${routeSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ 
                        color: 'text.secondary',
                        textDecoration: 'underline',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      View route →
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Origins Tab (only shown on unified pages, not "to" pages) */}
      {showOrigins && !isToPage && tabValue === 1 && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
            Flights to {displayName} ({filteredOrigins.length} of {origins?.length || 0})
          </Typography>
          
          {/* Filters */}
          <RouteFilters
            routeType={routeTypeFilter}
            onRouteTypeChange={setRouteTypeFilter}
            stopType={stopFilter}
            onStopTypeChange={setStopFilter}
            showStopFilter={true}
          />
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
            {origins?.length || 0} origin${(origins?.length || 0) !== 1 ? 's' : ''}${originsDomestic > 0 || originsInternational > 0 ? `: ${originsDomestic} domestic${originsInternational > 0 ? ` and ${originsInternational} international` : ''}` : ''}.
          </Typography>
          <Grid container spacing={2}>
            {filteredOrigins.map((origin) => {
              // For origins, reverse the route: origin-destination
              const routeSlug = `${origin.iata.toLowerCase()}-${iata.toLowerCase()}`;
              
              const originDisplay = origin.display || formatAirportDisplay(origin.iata, origin.city);
              
              return (
                <Grid item xs={12} sm={6} md={4} key={origin.iata}>
                  <Paper
                    onClick={(e) => handleCardClick(e, origin.iata, iata, originDisplay, displayName)}
                  sx={{
                    p: 3,
                    display: 'block',
                      cursor: 'pointer',
                      position: 'relative',
                    '&:hover': { bgcolor: 'action.hover', boxShadow: 2 },
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {originDisplay}
                  </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                      {origin.flights_per_day}
                  </Typography>
                    <Typography 
                      variant="caption" 
                      component={Link}
                      href={`/flights/${routeSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      sx={{ 
                        color: 'text.secondary',
                        textDecoration: 'underline',
                        '&:hover': { color: 'primary.main' }
                      }}
                    >
                      View route →
                  </Typography>
                </Paper>
              </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Departures Tab */}
      {tabValue === (showOrigins && !isToPage ? 2 : 1) && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
            All scheduled departures from {displayName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
            {departures.length} scheduled departure${departures.length !== 1 ? 's' : ''} operated by {departureAirlines} airline${departureAirlines !== 1 ? 's' : ''}.
          </Typography>
          <FlightTable flights={departures} showDestination />
        </Box>
      )}

      {/* Arrivals Tab */}
      {tabValue === (showOrigins && !isToPage ? 3 : 2) && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: { xs: 1.5, sm: 2 }, textAlign: 'left' }}>
            All scheduled arrivals to {displayName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
            {arrivals.length} scheduled arrival${arrivals.length !== 1 ? 's' : ''} operated by {arrivalAirlines} airline${arrivalAirlines !== 1 ? 's' : ''}.
          </Typography>
          <FlightTable flights={arrivals} showOrigin />
        </Box>
      )}

      {/* Flight Modal */}
      {selectedRoute && (
        <FlightModal
          open={modalOpen}
          onClose={handleCloseModal}
          origin={selectedRoute.origin}
          destination={selectedRoute.destination}
          originDisplay={selectedRoute.originDisplay}
          destinationDisplay={selectedRoute.destinationDisplay}
        />
      )}
    </>
  );
}

