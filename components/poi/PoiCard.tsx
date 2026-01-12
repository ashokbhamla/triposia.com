import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CdnImage from './CdnImage';

export interface Poi {
  _id: string;
  name: string;
  type: string;
  airport_iata: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  distance_from_airport_km: number;
  travel_time_minutes?: number;
  description: string;
  image_path: string;
  is_active: boolean;
}

interface PoiCardProps {
  poi: Poi;
}

export default function PoiCard({ poi }: PoiCardProps) {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia sx={{ height: 200, position: 'relative' }}>
        <CdnImage
          src={poi.image_path}
          alt={poi.name}
          width="100%"
          height={200}
        />
      </CardMedia>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {poi.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {poi.city}, {poi.country}
          </Typography>
        </Box>
        {poi.distance_from_airport_km && (
          <Typography variant="body2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
            {poi.distance_from_airport_km} km from {poi.airport_iata} Airport
            {poi.travel_time_minutes && ` • ${poi.travel_time_minutes} min drive`}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {poi.description}
        </Typography>
      </CardContent>
    </Card>
  );
}

