'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import dynamic from 'next/dynamic';

// Lazy-load map components only when needed
const InteractiveMap = dynamic(
  () => import('./InteractiveMap'),
  { 
    ssr: false,
    loading: () => (
      <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">Loading map...</Typography>
      </Box>
    )
  }
);

interface LazyMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  height?: number;
  markers?: Array<{ lat: number; lon: number; label: string }>;
  polyline?: Array<{ lat: number; lon: number }>;
  description?: string;
  title?: string;
}

/**
 * LazyMap component that shows a static placeholder on SSR
 * and loads the interactive map only on user interaction
 */
export default function LazyMap({
  lat,
  lon,
  zoom = 13,
  height = 400,
  markers = [],
  polyline = [],
  description,
  title,
}: LazyMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Leaflet CSS and map after component mounts (auto-load with delay for performance)
  useEffect(() => {
    // Dynamically import CSS - TypeScript doesn't need type checking for CSS
    if (typeof window !== 'undefined') {
      import('leaflet/dist/leaflet.css' as any);
    }
    // Auto-load map after a short delay to improve initial page load
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500); // Load after 500ms to allow page to render first
    
    return () => clearTimeout(timer);
  }, []);

  // Static placeholder for SSR and initial render
  if (!isLoaded) {
    return (
      <Box sx={{ mb: 4 }}>
        {title && (
          <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 2, textAlign: 'left' }}>
            {title}
          </Typography>
        )}
        <Paper
          component="div"
          onClick={() => setIsLoaded(true)}
          sx={{
            height,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            bgcolor: 'background.default',
            cursor: 'pointer',
            width: '100%',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              p: 3,
            }}
          >
            <MapIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Loading map...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
              Interactive map powered by OpenStreetMap
            </Typography>
          </Box>
        </Paper>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'left' }}>
            {description}
          </Typography>
        )}
      </Box>
    );
  }

  // Load interactive map after user interaction
  return (
    <Box sx={{ mb: 4 }}>
      {title && (
        <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 2, textAlign: 'left' }}>
          {title}
        </Typography>
      )}
      <InteractiveMap
        lat={lat}
        lon={lon}
        zoom={zoom}
        height={height}
        markers={markers}
        polyline={polyline}
      />
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, textAlign: 'left' }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

