'use client';

import { useMediaQuery, useTheme } from '@mui/material';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Avatar,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Flight } from '@/lib/queries';
import { getAirlineLogoUrl } from '@/lib/imagekit';
import OptimizedAvatar from './OptimizedAvatar';

interface FlightTableProps {
  flights: Flight[];
  showOrigin?: boolean;
  showDestination?: boolean;
  airportNameMap?: Map<string, string>; // Map of IATA code to formatted name (e.g., "JFK" -> "New York (JFK)")
}

export default function FlightTable({ flights, showOrigin = false, showDestination = false, airportNameMap }: FlightTableProps) {
  const getAirportDisplay = (iata: string | undefined): string => {
    if (!iata) return 'N/A';
    return airportNameMap?.get(iata) || iata;
  };
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (flights.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No flight data available.
      </Typography>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 1, py: 1 }}>
        {flights.map((flight, index) => (
          <Card 
            key={flight._id?.toString() || index}
            sx={{ 
              boxShadow: 1,
              '&:hover': { boxShadow: 2 },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <OptimizedAvatar
                    src={getAirlineLogoUrl(flight.airline_iata)}
                    alt={flight.airline_name || flight.airline_iata}
                    size={32}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {flight.flight_number}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {flight.airline_name}
                    </Typography>
                  </Box>
                </Box>
                {flight.aircraft && (
                  <Chip 
                    label={flight.aircraft} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
              
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                    Departure
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {flight.departure_time || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                    Arrival
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {flight.arrival_time || 'N/A'}
                  </Typography>
                </Grid>
                {showOrigin && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                      Origin
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {getAirportDisplay(flight.origin_iata)}
                    </Typography>
                  </Grid>
                )}
                {showDestination && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                      Destination
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {getAirportDisplay(flight.destination_iata)}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // Desktop table view
  return (
    <TableContainer 
      component={Paper}
      sx={{
        '& .MuiTable-root': {
          minWidth: 600,
        },
      }}
    >
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Flight</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Airline</TableCell>
            {showOrigin && <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Origin</TableCell>}
            {showDestination && <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Destination</TableCell>}
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Departure</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Arrival</TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1.5 }}>Aircraft</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {flights.map((flight, index) => (
            <TableRow 
              key={flight._id?.toString() || index}
              sx={{ '&:hover': { bgcolor: 'action.hover' } }}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  {flight.flight_number}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <OptimizedAvatar
                    src={getAirlineLogoUrl(flight.airline_iata)}
                    alt={flight.airline_name || flight.airline_iata}
                    size={32}
                  />
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {flight.airline_name}
                  </Typography>
                </Box>
              </TableCell>
              {showOrigin && (
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{getAirportDisplay(flight.origin_iata)}</Typography>
                </TableCell>
              )}
              {showDestination && (
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>{getAirportDisplay(flight.destination_iata)}</Typography>
                </TableCell>
              )}
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  {flight.departure_time || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                  {flight.arrival_time || 'N/A'}
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  {flight.aircraft || 'N/A'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

