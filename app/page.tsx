import { Container, Typography, Box, Grid, Paper, Button, Chip, Divider, Card, CardContent, CardMedia } from '@mui/material';
import Link from 'next/link';
import { Metadata } from 'next';
import FlightIcon from '@mui/icons-material/Flight';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import AirlinesIcon from '@mui/icons-material/Airlines';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { COMPANY_INFO } from '@/lib/company';
import { generateMetadata as genMeta } from '@/lib/seo';
import { fetchPosts } from '@/lib/contentApi';
import { 
  getTotalCounts, 
  getTopAirlinesByDepartures, 
  getBusiestAirports, 
  getTopAircraftTypes, 
  getLongestFlight,
  getTotalFlightsToday,
  getAirportSummary,
  type TopAirline,
  type TopAirport,
  type TopAircraft,
  type LongestFlight
} from '@/lib/queries';
import { formatAirportName } from '@/lib/formatting';

export const metadata: Metadata = genMeta({
  title: `${COMPANY_INFO.name} - Global Flight Information Platform | Airport Data & Flight Schedules`,
  description: 'Comprehensive flight schedules, airport information, airline data, and flight routes worldwide. Find departures, arrivals, destinations, and detailed flight information for airports and airlines globally.',
  canonical: '/',
});

// Use dynamic rendering to prevent build timeouts - page will be generated on-demand
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour (ISR)

// Add timeout wrapper - use 8s to stay under Vercel's 10s limit
async function queryWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<T | null>((resolve) => setTimeout(() => resolve(null), timeoutMs))
    ]);
  } catch (error) {
    console.error('Query timeout or error:', error);
    return null;
  }
}

export default async function HomePage() {
  // Wrap in try-catch to handle any errors gracefully
  let counts: { airports: number; routes: number; airlines: number };
  let topAirlines: TopAirline[];
  let busiestAirports: TopAirport[];
  let topAircraft: TopAircraft[];
  let longestFlight: LongestFlight | null;
  let flightsToday: number;
  let latestBlogs: any[] = [];
  
  try {
    // Use 7s timeout per query to stay well under Vercel's 10s limit
    const results = await Promise.all([
      queryWithTimeout(getTotalCounts(), 7000),
      queryWithTimeout(getTopAirlinesByDepartures(5), 7000),
      queryWithTimeout(getBusiestAirports(5), 7000),
      queryWithTimeout(getTopAircraftTypes(5), 7000),
      queryWithTimeout(getLongestFlight(), 7000),
      queryWithTimeout(getTotalFlightsToday(), 7000),
      queryWithTimeout(fetchPosts({ status: 'published', limit: 4 }), 5000), // Fetch latest 4 blogs
    ]);
    
    counts = results[0] || { airports: 0, routes: 0, airlines: 0 };
    topAirlines = results[1] || [];
    busiestAirports = results[2] || [];
    topAircraft = results[3] || [];
    longestFlight = results[4] || null;
    flightsToday = results[5] || 0;
    latestBlogs = results[6] || [];
  } catch (error) {
    console.error('Error loading home page data:', error);
    // Set defaults to prevent page crash - ensure page always renders
    counts = { airports: 0, routes: 0, airlines: 0 };
    topAirlines = [];
    busiestAirports = [];
    topAircraft = [];
    longestFlight = null;
    flightsToday = 0;
    latestBlogs = [];
  }

  // Ensure all values are defined even if queries failed
  if (!counts) counts = { airports: 0, routes: 0, airlines: 0 };
  if (!topAirlines) topAirlines = [];
  if (!busiestAirports) busiestAirports = [];
  if (!topAircraft) topAircraft = [];
  if (longestFlight === undefined) longestFlight = null;
  if (flightsToday === undefined || flightsToday === null) flightsToday = 0;

  // Format airport names for busiest airports (with timeout protection)
  let busiestAirportsWithDisplay: Array<{ iata: string; name: string; city: string; departureCount: number; displayName: string }> = [];
  try {
    busiestAirportsWithDisplay = busiestAirports && busiestAirports.length > 0 ? await Promise.all(
      busiestAirports.map(async (airport) => {
        try {
          const airportData = await queryWithTimeout(getAirportSummary(airport.iata), 3000);
          const displayName = airportData ? await formatAirportName(airport.iata, airportData) : airport.iata;
          return { ...airport, displayName };
        } catch (error) {
          return { ...airport, displayName: airport.iata };
        }
      })
    ) : [];
  } catch (error) {
    console.error('Error formatting busiest airports:', error);
    busiestAirportsWithDisplay = busiestAirports.map(airport => ({ ...airport, displayName: airport.iata }));
  }

  // Format airport names for longest flight (with timeout protection)
  let originDisplay = longestFlight?.originCity || longestFlight?.origin || '';
  let destinationDisplay = longestFlight?.destinationCity || longestFlight?.destination || '';
  if (longestFlight) {
    try {
      const originAirport = await queryWithTimeout(getAirportSummary(longestFlight.origin), 3000);
      const destAirport = await queryWithTimeout(getAirportSummary(longestFlight.destination), 3000);
      originDisplay = originAirport ? await formatAirportName(longestFlight.origin, originAirport) : longestFlight.origin;
      destinationDisplay = destAirport ? await formatAirportName(longestFlight.destination, destAirport) : longestFlight.destination;
    } catch (error) {
      // Fallback to basic display
      originDisplay = longestFlight.origin;
      destinationDisplay = longestFlight.destination;
    }
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 8 }, px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ textAlign: 'left', mb: { xs: 4, sm: 6 } }}>
        <Typography 
          variant="h1" 
          gutterBottom 
          sx={{ 
            mb: { xs: 2, sm: 3 },
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            lineHeight: { xs: 1.3, sm: 1.4 },
            wordBreak: 'break-word',
          }}
        >
          {COMPANY_INFO.name} - Global Flight Information Platform
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ 
            mb: { xs: 3, sm: 4 }, 
            maxWidth: '800px',
            fontSize: { xs: '1rem', sm: '1.25rem' },
            wordBreak: 'break-word',
          }}
        >
          Your authoritative source for airports, flight routes, airlines, departures, and arrivals worldwide.
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
              },
            }}
          >
            <LocationOnIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, mx: 'auto' }} />
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 700, mb: 0.5 }}>
              {counts?.airports?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, opacity: 0.9 }}>
              Airports
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
              },
            }}
          >
            <RouteIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, mx: 'auto' }} />
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 700, mb: 0.5 }}>
              {counts?.routes?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, opacity: 0.9 }}>
              Flight Routes
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              textAlign: 'center',
              background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
              color: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(6, 182, 212, 0.3)',
              },
            }}
          >
            <AirlinesIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1, mx: 'auto' }} />
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, fontWeight: 700, mb: 0.5 }}>
              {counts?.airlines?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.125rem' }, opacity: 0.9 }}>
              Airlines
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, sm: 4 }} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 4 }, 
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          }}>
            <FlightIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'primary.main', mb: 2 }} />
            <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 2, textAlign: 'left' }}>
              Airports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comprehensive information about airports worldwide, including departures, arrivals, and destination statistics.
            </Typography>
            <Button
              component={Link}
              href="/airports"
              variant="contained"
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Browse Airports
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 4 }, 
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          }}>
            <AirlineStopsIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'primary.main', mb: 2 }} />
            <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 2, textAlign: 'left' }}>
              Flight Routes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Detailed flight route information, schedules, frequencies, and airline operators for routes around the world.
            </Typography>
            <Button
              component={Link}
              href="/flights"
              variant="contained"
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Browse Flights
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: { xs: 2, sm: 4 }, 
            height: '100%',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          }}>
            <AirportShuttleIcon sx={{ fontSize: { xs: 36, sm: 48 }, color: 'primary.main', mb: 2 }} />
            <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 2, textAlign: 'left' }}>
              Airlines
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete airline information, routes, destinations, and flight schedules for carriers worldwide.
            </Typography>
            <Button
              component={Link}
              href="/airlines"
              variant="contained"
              fullWidth
              sx={{
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Browse Airlines
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Biggest Airlines Section */}
      <Box sx={{ mb: { xs: 4, sm: 6 } }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 3, textAlign: 'left' }}>
          Biggest Airlines
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'left' }}>
          Based on number of departures next month
        </Typography>
        <Grid container spacing={2}>
          {(topAirlines || []).map((airline, index) => (
            <Grid item xs={12} sm={6} md={4} key={airline.airline_iata}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={index + 1} 
                    color="primary" 
                    sx={{ mr: 2, fontWeight: 700, minWidth: 40 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {airline.airline_name}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {airline.flightCount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  flights scheduled next month
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} href="/airlines" variant="outlined">
            See the full top 100 list →
          </Button>
        </Box>
      </Box>

      {/* Busiest Airports Section */}
      <Box sx={{ mb: { xs: 4, sm: 6 } }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 3, textAlign: 'left' }}>
          Busiest Airports
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'left' }}>
          By scheduled departures today
        </Typography>
        <Grid container spacing={2}>
          {(busiestAirportsWithDisplay || []).map((airport, index) => (
            <Grid item xs={12} sm={6} md={4} key={airport.iata}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={index + 1} 
                    color="primary" 
                    sx={{ mr: 2, fontWeight: 700, minWidth: 40 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {airport.displayName}
                    </Typography>
                    {airport.name && airport.name !== airport.displayName && (
                      <Typography variant="body2" color="text.secondary">
                        {airport.name}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {airport.departureCount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  flights departing today
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} href="/airports" variant="outlined">
            See the full top 100 list →
          </Button>
        </Box>
      </Box>

      {/* Top Aircraft Types Section */}
      <Box sx={{ mb: { xs: 4, sm: 6 } }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 3, textAlign: 'left' }}>
          Top Aircraft Types
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'left' }}>
          The most common aircrafts in our database
        </Typography>
        <Grid container spacing={2}>
          {(topAircraft || []).map((aircraft, index) => (
            <Grid item xs={12} sm={6} md={4} key={aircraft.aircraft}>
              <Paper sx={{ 
                p: 3, 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={index + 1} 
                    color="primary" 
                    sx={{ mr: 2, fontWeight: 700, minWidth: 40 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                    {aircraft.aircraft}
                  </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  {aircraft.flightCount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  flights with this aircraft type next month
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Longest Flight & Flights Today Section */}
      <Grid container spacing={3} sx={{ mb: { xs: 4, sm: 6 } }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 4, 
            height: '100%', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', 
            color: 'white',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)',
            },
          }}>
            <AccessTimeIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' }, fontWeight: 700, mb: 1 }}>
              {longestFlight?.duration || 'N/A'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
              Longest flight worldwide
            </Typography>
            {longestFlight && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                The route with the longest flight time is between {originDisplay} and {destinationDisplay}{longestFlight.aircraft && ` with a ${longestFlight.aircraft}`}.
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 4, 
            height: '100%', 
            textAlign: 'center', 
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
            color: 'white',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 16px rgba(16, 185, 129, 0.3)',
            },
          }}>
            <FlightTakeoffIcon sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', sm: '2.5rem' }, fontWeight: 700, mb: 1 }}>
              {flightsToday?.toLocaleString() || '0'}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
              Flights worldwide today
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Today, we have {flightsToday?.toLocaleString() || '0'} scheduled flights worldwide in our dataset, divided between 6 continents. North America, South America, Europe, Africa, Asia and Oceania.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Latest Blog Posts */}
      {latestBlogs && latestBlogs.length > 0 && (
        <Box sx={{ mt: { xs: 6, sm: 8 }, mb: { xs: 4, sm: 6 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, sm: 4 } }}>
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '2rem' }, 
                mb: 0,
                textAlign: 'left',
                wordBreak: 'break-word',
              }}
            >
              Latest Blog Posts
            </Typography>
            <Button
              component={Link}
              href="/blog"
              variant="outlined"
              sx={{
                textTransform: 'none',
                fontSize: '0.95rem',
              }}
            >
              View All Posts
            </Button>
          </Box>
          <Grid container spacing={3}>
            {latestBlogs.slice(0, 4).map((post) => {
              const formattedDate = post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';

              return (
                <Grid item xs={12} sm={6} md={3} key={post.id}>
                  <Card
                    component={Link}
                    href={`/blog/${post.slug}`}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    {post.featured_image && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.featured_image}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                        {post.title}
                      </Typography>
                      {post.excerpt && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                          {post.excerpt.length > 120 
                            ? `${post.excerpt.substring(0, 120)}...` 
                            : post.excerpt}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                        {formattedDate && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formattedDate}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <Box sx={{ mt: { xs: 4, sm: 8 } }}>
        <Typography 
          variant="h2" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '2rem' }, 
            mb: { xs: 2, sm: 3 }, 
            textAlign: 'left',
            wordBreak: 'break-word',
          }}
        >
          About {COMPANY_INFO.name}
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 2, 
            maxWidth: '900px', 
            lineHeight: 1.8,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            wordBreak: 'break-word',
          }}
        >
          {COMPANY_INFO.name} is a comprehensive global flight information platform designed to be an authoritative source for aviation data. 
          Our platform provides detailed, factual information about airports, flight routes, airlines, departures, and arrivals.
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: '900px', lineHeight: 1.8 }}>
          All data is regularly updated and optimized for both traditional search engines and AI-powered answer systems, 
          ensuring accurate and accessible flight information for users worldwide.
        </Typography>
      </Box>
    </Container>
  );
}

