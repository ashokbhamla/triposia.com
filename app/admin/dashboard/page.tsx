'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
} from '@mui/material';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        setAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom sx={{ mb: 4, textAlign: 'left' }}>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
              Airports
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage airport information, SEO settings, and content.
            </Typography>
            <Button
              component={Link}
              href="/admin/airports"
              variant="contained"
              fullWidth
            >
              Manage Airports
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
              Flights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage flight routes, schedules, and SEO optimization.
            </Typography>
            <Button
              component={Link}
              href="/admin/flights"
              variant="contained"
              fullWidth
            >
              Manage Flights
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
              Airlines
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage airline information and routes.
            </Typography>
            <Button
              component={Link}
              href="/admin/airlines"
              variant="contained"
              fullWidth
            >
              Manage Airlines
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

