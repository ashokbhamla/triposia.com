'use client';

import { useState, useMemo } from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import Link from 'next/link';
import { Airline } from '@/lib/queries';
import AirlineFilters from './AirlineFilters';

interface AirlinesListProps {
  airlines: Airline[];
}

export default function AirlinesList({ airlines }: AirlinesListProps) {
  const [filteredAirlines, setFilteredAirlines] = useState<Airline[]>(airlines);

  return (
    <>
      <AirlineFilters airlines={airlines} onFilteredChange={setFilteredAirlines} />

      <Grid container spacing={2}>
        {filteredAirlines.map((airline) => {
          const code = airline.iata?.toLowerCase() || airline.code?.toLowerCase();
          if (!code) return null;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={airline._id?.toString() || code}>
              <Paper
                component={Link}
                href={`/airlines/${code}`}
                sx={{
                  p: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  border: 1,
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {airline.name || code.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IATA: {code.toUpperCase()}
                </Typography>
                {airline.country && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {airline.country}
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {filteredAirlines.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            No airlines found matching your filters.
          </Typography>
        </Box>
      )}
    </>
  );
}

