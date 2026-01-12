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
import { AirportSummary } from '@/lib/queries';

export default function AdminAirportsPage() {
  const router = useRouter();
  const [airports, setAirports] = useState<AirportSummary[]>([]);
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
        fetchAirports();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await fetch('/api/airports');
      if (response.ok) {
        const data = await response.json();
        setAirports(data);
      }
    } catch (error) {
      console.error('Failed to fetch airports:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'iata_from', headerName: 'IATA', width: 100 },
    { field: 'destinations_count', headerName: 'Destinations', width: 150 },
    { field: 'departure_count', headerName: 'Departures', width: 150 },
    { field: 'arrival_count', headerName: 'Arrivals', width: 150 },
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
        Manage Airports
      </Typography>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={airports}
          columns={columns}
          getRowId={(row) => row.iata_from}
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

