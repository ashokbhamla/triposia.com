'use client';

import LazyMap from './LazyMap';

interface RouteMapProps {
  origin: {
    lat: number;
    lng: number;
    iata: string;
    name?: string;
    city?: string;
  };
  destination: {
    lat: number;
    lng: number;
    iata: string;
    name?: string;
    city?: string;
  };
}

/**
 * Map component for route pages
 * Shows origin to destination path with a line
 */
export default function RouteMap({
  origin,
  destination,
}: RouteMapProps) {
  if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
    return null;
  }

  const originDisplay = origin.name || origin.city || origin.iata;
  const destinationDisplay = destination.name || destination.city || destination.iata;

  // Calculate center point between origin and destination
  const centerLat = (origin.lat + destination.lat) / 2;
  const centerLon = (origin.lng + destination.lng) / 2;

  // Calculate zoom based on distance
  const latDiff = Math.abs(origin.lat - destination.lat);
  const lonDiff = Math.abs(origin.lng - destination.lng);
  const maxDiff = Math.max(latDiff, lonDiff);
  let zoom = 5;
  if (maxDiff > 20) zoom = 3;
  else if (maxDiff > 10) zoom = 4;
  else if (maxDiff > 5) zoom = 5;
  else if (maxDiff > 2) zoom = 6;
  else if (maxDiff > 1) zoom = 7;
  else if (maxDiff > 0.5) zoom = 8;
  else if (maxDiff > 0.2) zoom = 9;
  else zoom = 10;

  const markers = [
    {
      lat: origin.lat,
      lon: origin.lng,
      label: `${originDisplay} (${origin.iata})`,
    },
    {
      lat: destination.lat,
      lon: destination.lng,
      label: `${destinationDisplay} (${destination.iata})`,
    },
  ];

  const polyline = [
    { lat: origin.lat, lon: origin.lng },
    { lat: destination.lat, lon: destination.lng },
  ];

  const description = `Flight route map showing the path from ${originDisplay} (${origin.iata}) to ${destinationDisplay} (${destination.iata}). The line represents the approximate flight path between these airports.`;

  return (
    <LazyMap
      lat={centerLat}
      lon={centerLon}
      zoom={zoom}
      height={400}
      markers={markers}
      polyline={polyline}
      title={`Flight Route: ${originDisplay} to ${destinationDisplay}`}
      description={description}
    />
  );
}

