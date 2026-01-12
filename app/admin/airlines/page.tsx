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
import { Airline } from '@/lib/queries';

export default function AdminAirlinesPage() {
  const router = useRouter();
  const [airlines, setAirlines] = useState<Airline[]>([]);
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
        fetchAirlines();
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchAirlines = async () => {
    try {
      const response = await fetch('/api/airlines');
      if (response.ok) {
        const data = await response.json();
        setAirlines(data);
      }
    } catch (error) {
      console.error('Failed to fetch airlines:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Name', width: 250 },
    { field: 'iata', headerName: 'IATA', width: 100 },
    { field: 'icao', headerName: 'ICAO', width: 100 },
    { field: 'country', headerName: 'Country', width: 150 },
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
        Manage Airlines
      </Typography>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={airlines}
          columns={columns}
          getRowId={(row) => row.code}
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

