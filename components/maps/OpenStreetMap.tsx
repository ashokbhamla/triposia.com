'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Box, Typography, IconButton, Collapse, useMediaQuery, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import 'leaflet/dist/leaflet.css';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface OpenStreetMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  width?: string | number;
  height?: string | number;
  marker?: boolean;
  markerLabel?: string;
  title?: string;
}

/**
 * OpenStreetMap component using Leaflet.js and React-Leaflet
 * Client-side only component for Next.js SSR compatibility
 */
export default function OpenStreetMap({
  lat,
  lon,
  zoom = 13,
  width = '100%',
  height = 400,
  marker = true,
  markerLabel,
  title,
}: OpenStreetMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setIsClient(true);
  }, []);

  // On mobile, start collapsed; on desktop, always expanded
  const shouldBeCollapsed = isMobile && !isExpanded;

  if (!isClient) {
    return (
      <Box
        sx={{
          width,
          height: isMobile && !isExpanded ? 'auto' : height,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          mt: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          minHeight: isMobile && !isExpanded ? 60 : height,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading map...
        </Typography>
      </Box>
    );
  }

  const mapContent = (
    <MapContainer
      center={[lat, lon]}
      zoom={zoom}
      style={{ height: title ? 'calc(100% - 60px)' : '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {marker && (
        <Marker position={[lat, lon]}>
          {markerLabel && <Popup>{markerLabel}</Popup>}
        </Marker>
      )}
    </MapContainer>
  );

  return (
    <Box
      sx={{
        width,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        mt: 2,
        mb: 2,
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
        },
      }}
    >
      {/* Header with title and expand/collapse button (mobile only) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderBottom: shouldBeCollapsed ? 0 : 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.25rem', textAlign: 'left', flex: 1 }}>
          {title || 'Location Map'}
        </Typography>
        {isMobile && (
          <IconButton
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            sx={{ ml: 1 }}
            aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>

      {/* Map content - collapsed on mobile by default */}
      <Collapse in={!shouldBeCollapsed} timeout="auto">
        <Box
          sx={{
            width: '100%',
            height: isMobile && isExpanded ? height : !isMobile ? height : 0,
            position: 'relative',
          }}
        >
          {mapContent}
        </Box>
      </Collapse>
    </Box>
  );
}
