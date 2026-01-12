'use client';

import LazyMap from './LazyMap';

interface AirportMapProps {
  airport: {
    lat: number;
    lng: number;
    iata: string;
    name?: string;
    city?: string;
  };
  topDestinations?: Array<{
    lat: number;
    lng: number;
    iata: string;
    name?: string;
    city?: string;
  }>;
  maxDestinations?: number;
}

/**
 * Map component for airport pages
 * Shows airport location + top destinations
 */
export default function AirportMap({
  airport,
  topDestinations = [],
  maxDestinations = 5,
}: AirportMapProps) {
  if (!airport.lat || !airport.lng) return null;

  const airportDisplay = airport.name || airport.city || airport.iata;
  
  // Prepare markers: airport + top destinations
  const markers = [
    {
      lat: airport.lat,
      lon: airport.lng,
      label: `${airportDisplay} (${airport.iata})`,
    },
    ...topDestinations.slice(0, maxDestinations).map(dest => ({
      lat: dest.lat,
      lon: dest.lng,
      label: `${dest.name || dest.city || dest.iata} (${dest.iata})`,
    })),
  ];

  // Calculate center and zoom to fit all markers
  const allLats = markers.map(m => m.lat);
  const allLons = markers.map(m => m.lon);
  const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
  const centerLon = (Math.min(...allLons) + Math.max(...allLons)) / 2;
  
  // Adjust zoom based on distance between points
  const latDiff = Math.max(...allLats) - Math.min(...allLats);
  const lonDiff = Math.max(...allLons) - Math.min(...allLons);
  const maxDiff = Math.max(latDiff, lonDiff);
  let zoom = 13;
  if (maxDiff > 10) zoom = 5;
  else if (maxDiff > 5) zoom = 6;
  else if (maxDiff > 2) zoom = 7;
  else if (maxDiff > 1) zoom = 8;
  else if (maxDiff > 0.5) zoom = 10;
  else if (maxDiff > 0.2) zoom = 11;
  else if (maxDiff > 0.1) zoom = 12;

  const description = topDestinations.length > 0
    ? `Map showing ${airportDisplay} (${airport.iata}) airport location and ${topDestinations.slice(0, maxDestinations).length} of its top destinations.`
    : `Map showing the location of ${airportDisplay} (${airport.iata}) airport.`;

  return (
    <LazyMap
      lat={centerLat}
      lon={centerLon}
      zoom={zoom}
      height={400}
      markers={markers}
      title={`${airportDisplay} Airport Location`}
      description={description}
    />
  );
}

