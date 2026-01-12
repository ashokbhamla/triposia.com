'use client';

import { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import Link from 'next/link';
import FlightModal from './FlightModal';

interface Destination {
  iata: string;
  city: string;
  display: string;
  flights_per_day: string;
}

interface PopularRoutesCardsProps {
  originIata: string;
  originDisplay: string;
  destinations: Destination[];
  routeFlightsMap: Record<string, number>; // Map of destination IATA to flight count
}

export default function PopularRoutesCards({
  originIata,
  originDisplay,
  destinations,
  routeFlightsMap,
}: PopularRoutesCardsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const handleCardClick = (e: React.MouseEvent, dest: Destination) => {
    // If user clicks on the link text or icon, let it navigate
    // Otherwise, open modal
    const target = e.target as HTMLElement;
    if (target.closest('a') || target.tagName === 'A') {
      return; // Let the link handle navigation
    }
    
    e.preventDefault();
    e.stopPropagation();
    setSelectedDestination(dest);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDestination(null);
  };

  return (
    <>
      <Grid container spacing={2}>
        {destinations.map((dest) => {
          const flightCount = routeFlightsMap[dest.iata] || 0;
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={dest.iata}>
              <Paper
                onClick={(e) => handleCardClick(e, dest)}
                sx={{
                  p: 3,
                  display: 'block',
                  height: '100%',
                  cursor: 'pointer',
                  position: 'relative',
                  '&:hover': { 
                    bgcolor: 'action.hover', 
                    boxShadow: 3, 
                    transform: 'translateY(-2px)' 
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FlightIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {originDisplay} → {dest.display}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main', mb: 1 }}>
                  {flightCount} flight{flightCount !== 1 ? 's' : ''} • {dest.flights_per_day}
                </Typography>
                <Typography 
                  variant="caption" 
                  component={Link}
                  href={`/flights/${originIata.toLowerCase()}-${dest.iata.toLowerCase()}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ 
                    color: 'text.secondary',
                    textDecoration: 'underline',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  View route details →
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {selectedDestination && (
        <FlightModal
          open={modalOpen}
          onClose={handleCloseModal}
          origin={originIata}
          destination={selectedDestination.iata}
          originDisplay={originDisplay}
          destinationDisplay={selectedDestination.display}
        />
      )}
    </>
  );
}

