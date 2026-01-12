'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';

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
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

interface InteractiveMapProps {
  lat: number;
  lon: number;
  zoom?: number;
  height?: number;
  markers?: Array<{ lat: number; lon: number; label: string }>;
  polyline?: Array<{ lat: number; lon: number }>;
}

/**
 * Interactive map component using Leaflet
 * Only loaded after user interaction (via LazyMap)
 */
export default function InteractiveMap({
  lat,
  lon,
  zoom = 13,
  height = 400,
  markers = [],
  polyline = [],
}: InteractiveMapProps) {
  // Ensure Leaflet CSS is loaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically import CSS - TypeScript doesn't need type checking for CSS
      import('leaflet/dist/leaflet.css' as any);
    }
  }, []);

  return (
    <Box
      sx={{
        height,
        width: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        '& .leaflet-container': {
          height: '100%',
          width: '100%',
        },
      }}
    >
      <MapContainer
        center={[lat, lon]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Single marker if no markers array provided */}
        {markers.length === 0 && (
          <Marker position={[lat, lon]}>
            <Popup>Location</Popup>
          </Marker>
        )}
        
        {/* Multiple markers */}
        {markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lon]}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
        
        {/* Polyline for route visualization */}
        {polyline.length > 0 && (
          <Polyline
            positions={polyline.map(p => [p.lat, p.lon] as LatLngExpression)}
            color="#1976d2"
            weight={3}
            opacity={0.7}
          />
        )}
      </MapContainer>
    </Box>
  );
}

