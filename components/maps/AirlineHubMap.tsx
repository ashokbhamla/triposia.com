'use client';

import LazyMap from './LazyMap';

interface Hub {
  lat: number;
  lng: number;
  iata: string;
  name?: string;
  city?: string;
}

interface AirlineHubMapProps {
  hubs: Hub[];
  airlineName: string;
  maxHubs?: number;
}

/**
 * Map component for airline pages
 * Shows airline hub network (optional)
 */
export default function AirlineHubMap({
  hubs = [],
  airlineName,
  maxHubs = 10,
}: AirlineHubMapProps) {
  if (hubs.length === 0) return null;

  const displayHubs = hubs.slice(0, maxHubs);

  const markers = displayHubs.map(hub => ({
    lat: hub.lat,
    lon: hub.lng,
    label: `${hub.name || hub.city || hub.iata} (${hub.iata})`,
  }));

  // Calculate center and zoom to fit all hubs
  const allLats = markers.map(m => m.lat);
  const allLons = markers.map(m => m.lon);
  const centerLat = (Math.min(...allLats) + Math.max(...allLats)) / 2;
  const centerLon = (Math.min(...allLons) + Math.max(...allLons)) / 2;
  
  // Adjust zoom based on spread of hubs
  const latDiff = Math.max(...allLats) - Math.min(...allLats);
  const lonDiff = Math.max(...allLons) - Math.min(...allLons);
  const maxDiff = Math.max(latDiff, lonDiff);
  let zoom = 5;
  if (maxDiff > 30) zoom = 2;
  else if (maxDiff > 20) zoom = 3;
  else if (maxDiff > 10) zoom = 4;
  else if (maxDiff > 5) zoom = 5;
  else if (maxDiff > 2) zoom = 6;
  else if (maxDiff > 1) zoom = 7;
  else zoom = 8;

  const description = `Map showing ${airlineName}'s hub network with ${displayHubs.length} hub${displayHubs.length !== 1 ? 's' : ''} across different regions.`;

  return (
    <LazyMap
      lat={centerLat}
      lon={centerLon}
      zoom={zoom}
      height={400}
      markers={markers}
      title={`${airlineName} Hub Network`}
      description={description}
    />
  );
}

