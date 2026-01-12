'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Route } from '@/lib/queries';

export default function AdminFlightsPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      if (response.ok) {
        setAuthenticated(true);
        fetchRoutes();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch('/api/flights');
      if (response.ok) {
        const data = await response.json();
        setRoutes(data);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'origin_iata', headerName: 'Origin', width: 120 },
    { field: 'destination_iata', headerName: 'Destination', width: 120 },
    { field: 'destination_city', headerName: 'City', width: 200 },
    { field: 'flights_per_day', headerName: 'Flights/Day', width: 150 },
    { field: 'has_flight_data', headerName: 'Has Data', width: 120, type: 'boolean' },
  ];

  if (loading || !authenticated) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h1" gutterBottom sx={{ mb: 4, textAlign: 'left' }}>
        Manage Flights
      </Typography>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={routes}
          columns={columns}
          getRowId={(row) => `${row.origin_iata}-${row.destination_iata}`}
          loading={loading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
        />
      </Paper>
    </Container>
  );
}

