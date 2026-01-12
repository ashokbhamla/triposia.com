import { Container, Typography, Box, Button, Paper } from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import FlightIcon from '@mui/icons-material/Flight';
import { COMPANY_INFO } from '@/lib/company';

export default function NotFound() {
  return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
      <Paper sx={{ p: 6, borderRadius: 2 }}>
        <Typography variant="h1" sx={{ fontSize: { xs: '3rem', sm: '4rem' }, fontWeight: 700, mb: 2, color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
          The page you're looking for doesn't exist or has been moved. 
          Use the links below to navigate back to {COMPANY_INFO.name}.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Go Home
          </Button>
          <Button
            component={Link}
            href="/airports"
            variant="outlined"
            startIcon={<FlightIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Browse Airports
          </Button>
          <Button
            component={Link}
            href="/flights"
            variant="outlined"
            startIcon={<FlightIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Browse Flights
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

