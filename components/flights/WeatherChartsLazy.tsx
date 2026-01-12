'use client';

import dynamic from 'next/dynamic';
import { Box, Typography, CircularProgress } from '@mui/material';

const WeatherCharts = dynamic(() => import('./WeatherCharts'), {
  ssr: false,
  loading: () => (
    <Box 
      sx={{ 
        minHeight: '400px', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="text.secondary">
        Loading weather charts...
      </Typography>
    </Box>
  ),
});

interface WeatherChartsLazyProps {
  rainfall?: number[];
  temperature?: number[];
  destinationName: string;
}

export default function WeatherChartsLazy(props: WeatherChartsLazyProps) {
  // Check if we have any data to display
  const hasRainfall = Array.isArray(props.rainfall) && props.rainfall.length > 0 && props.rainfall.some(v => v != null);
  const hasTemperature = Array.isArray(props.temperature) && props.temperature.length > 0 && props.temperature.some(v => v != null);
  
  if (!hasRainfall && !hasTemperature) {
    return (
      <Box sx={{ mb: 4, p: 3, border: 1, borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 2, textAlign: 'left' }}>
          Weather & Climate Information for {props.destinationName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Weather and climate data is not currently available for this destination. Please check back later or contact us for more information.
        </Typography>
      </Box>
    );
  }
  
  return <WeatherCharts {...props} />;
}

