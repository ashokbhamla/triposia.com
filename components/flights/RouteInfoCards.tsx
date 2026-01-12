'use client';

import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import StraightenIcon from '@mui/icons-material/Straighten';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AirlineStopsIcon from '@mui/icons-material/AirlineStops';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import LanguageIcon from '@mui/icons-material/Language';

interface RouteInfoCardsProps {
  flightTimeRange?: string;
  earliestFlight?: string;
  lastFlight?: string;
  distance?: string;
  cheapestMonth?: string;
  airlinesCount?: number;
  flightsPerWeek?: string | number;
  departingTerminal?: string;
  arrivingTerminal?: string;
  originTimezone?: string;
  destinationTimezone?: string;
  timezoneDifference?: string;
}

export default function RouteInfoCards({
  flightTimeRange,
  earliestFlight,
  lastFlight,
  distance,
  cheapestMonth,
  airlinesCount,
  flightsPerWeek,
  departingTerminal,
  arrivingTerminal,
  originTimezone,
  destinationTimezone,
  timezoneDifference,
}: RouteInfoCardsProps) {
  const cards = [
    flightTimeRange && {
      title: 'Flight time',
      value: flightTimeRange,
      icon: <AccessTimeIcon />,
    },
    earliestFlight && {
      title: 'Earliest flight',
      value: earliestFlight,
      icon: <FlightTakeoffIcon />,
    },
    lastFlight && {
      title: 'Last flight',
      value: lastFlight,
      icon: <FlightLandIcon />,
    },
    distance && {
      title: 'Distance',
      value: distance,
      icon: <StraightenIcon />,
    },
    cheapestMonth && {
      title: 'Cheapest month',
      value: cheapestMonth,
      icon: <CalendarTodayIcon />,
    },
    airlinesCount !== undefined && {
      title: 'Airlines',
      value: `${airlinesCount}${airlinesCount !== undefined && airlinesCount > 0 ? ' (Show)' : ''}`,
      icon: <AirlineStopsIcon />,
    },
    flightsPerWeek && {
      title: 'Flights per week',
      value: flightsPerWeek.toString(),
      icon: <AirportShuttleIcon />,
    },
    departingTerminal && {
      title: `Departing Terminal`,
      value: departingTerminal,
      icon: <FlightTakeoffIcon />,
    },
    arrivingTerminal && {
      title: `Arriving Terminal`,
      value: arrivingTerminal,
      icon: <FlightLandIcon />,
    },
    (originTimezone || destinationTimezone) && {
      title: 'Timezones',
      value: originTimezone && destinationTimezone 
        ? `${originTimezone} / ${destinationTimezone}`
        : originTimezone || destinationTimezone || '',
      icon: <LanguageIcon />,
    },
    timezoneDifference && {
      title: 'Timezone difference',
      value: timezoneDifference,
      icon: <LanguageIcon />,
    },
  ].filter((card) => !!card) as Array<{ title: string; value: string; icon: React.ReactNode }>;

  return (
    <Grid container spacing={2}>
      {cards.map((card, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                {card.icon}
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight="medium">
                {card.title}
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {card.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

