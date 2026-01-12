'use client';

import { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography, Grid, Avatar, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import FlightTable from '@/components/ui/FlightTable';
import { Flight } from '@/lib/queries';
import { getAirlineLogoUrl } from '@/lib/imagekit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';

interface AirlineWithFlights {
  code: string;
  name: string;
  iata: string;
  departures: Flight[];
  arrivals: Flight[];
  totalFlights: number;
}

interface AirportTabsProps {
  departures: Flight[];
  arrivals: Flight[];
  airlines?: AirlineWithFlights[];
  airportDisplay?: string;
}

export default function AirportTabs({ departures, arrivals, airlines = [], airportDisplay = '' }: AirportTabsProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="flight schedule tabs">
          <Tab label="Departures" />
          <Tab label="Arrivals" />
          {airlines.length > 0 && <Tab label={`Airlines (${airlines.length})`} />}
        </Tabs>
      </Paper>
      
      {tabValue === 0 && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 2, textAlign: 'left' }}>
            Departures
          </Typography>
          <FlightTable flights={departures} showDestination />
        </Box>
      )}
      
      {tabValue === 1 && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 2, textAlign: 'left' }}>
            Arrivals
          </Typography>
          <FlightTable flights={arrivals} showOrigin />
        </Box>
      )}
      
      {tabValue === 2 && airlines.length > 0 && (
        <Box>
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' }, mb: 3, textAlign: 'left' }}>
            Airlines Operating from {airportDisplay}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'left' }}>
            {airlines.length} airline{airlines.length !== 1 ? 's' : ''} operating from {airportDisplay}. Click on an airline to view their flights.
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {airlines.map((airline) => (
              <Accordion key={airline.code} defaultExpanded={false}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${airline.code}-content`}
                  id={`${airline.code}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                    <Avatar
                      src={getAirlineLogoUrl(airline.iata || airline.code)}
                      alt={airline.name}
                      sx={{ width: 40, height: 40 }}
                    >
                      {airline.iata || airline.code}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {airline.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {airline.departures.length} departures • {airline.arrivals.length} arrivals
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${airline.totalFlights} flights`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {airline.departures.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h3" sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            Departures ({airline.departures.length})
                          </Typography>
                          <Link 
                            href={`/airlines/${airline.code.toLowerCase()}/${airportDisplay.split('(')[1]?.replace(')', '').toLowerCase() || ''}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Chip label="View all flights" size="small" clickable />
                          </Link>
                        </Box>
                        <FlightTable flights={airline.departures.slice(0, 10)} showDestination />
                        {airline.departures.length > 10 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                            Showing 10 of {airline.departures.length} departures. 
                            <Link 
                              href={`/airlines/${airline.code.toLowerCase()}/${airportDisplay.split('(')[1]?.replace(')', '').toLowerCase() || ''}`}
                              style={{ textDecoration: 'underline', marginLeft: 4 }}
                            >
                              View all
                            </Link>
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {airline.arrivals.length > 0 && (
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h3" sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
                            Arrivals ({airline.arrivals.length})
                          </Typography>
                          <Link 
                            href={`/airlines/${airline.code.toLowerCase()}/${airportDisplay.split('(')[1]?.replace(')', '').toLowerCase() || ''}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <Chip label="View all flights" size="small" clickable />
                          </Link>
                        </Box>
                        <FlightTable flights={airline.arrivals.slice(0, 10)} showOrigin />
                        {airline.arrivals.length > 10 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                            Showing 10 of {airline.arrivals.length} arrivals. 
                            <Link 
                              href={`/airlines/${airline.code.toLowerCase()}/${airportDisplay.split('(')[1]?.replace(')', '').toLowerCase() || ''}`}
                              style={{ textDecoration: 'underline', marginLeft: 4 }}
                            >
                              View all
                            </Link>
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

