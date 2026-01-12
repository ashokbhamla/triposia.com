import { Container, Typography, Grid, Box } from '@mui/material';
import PoiCard, { Poi } from './PoiCard';

interface PoiSectionProps {
  pois: Poi[];
  title?: string;
}

export default function PoiSection({ pois, title }: PoiSectionProps) {
  if (!pois || pois.length === 0) {
    return null;
  }

  return (
    <Box>
      {title && (
        <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
          {title}
        </Typography>
      )}
      <Grid container spacing={3}>
        {pois.map((poi) => (
          <Grid item xs={12} sm={6} md={4} key={poi._id}>
            <PoiCard poi={poi} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

