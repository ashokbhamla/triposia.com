'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FlightTable from '@/components/ui/FlightTable';
import { Flight } from '@/lib/queries';

interface FlightModalProps {
  open: boolean;
  onClose: () => void;
  origin: string;
  destination: string;
  originDisplay?: string;
  destinationDisplay?: string;
}

export default function FlightModal({
  open,
  onClose,
  origin,
  destination,
  originDisplay,
  destinationDisplay,
}: FlightModalProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && origin && destination) {
      setLoading(true);
      setError(null);
      fetch(`/api/flights/route/${origin}/${destination}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to fetch flights');
          }
          return res.json();
        })
        .then((data) => {
          setFlights(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching flights:', err);
          setError('Failed to load flights');
          setLoading(false);
        });
    }
  }, [open, origin, destination]);

  const displayOrigin = originDisplay || origin;
  const displayDestination = destinationDisplay || destination;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '85vh' },
          height: { xs: '100vh', sm: 'auto' },
          borderRadius: { xs: 0, sm: 2 },
        },
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 1,
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2.5 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              lineHeight: 1.3,
            }}
          >
            Flights from {displayOrigin} to {displayDestination}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              color: (theme) => theme.palette.grey[500],
              flexShrink: 0,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent 
        dividers 
        sx={{ 
          p: { xs: 0, sm: 2 },
          overflowY: 'auto',
          maxHeight: { xs: 'calc(100vh - 140px)', sm: 'calc(85vh - 120px)' },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ py: 2, px: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        ) : flights.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 2, textAlign: 'center' }}>
            No flights found for this route.
          </Typography>
        ) : (
          <Box sx={{ 
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': {
              height: { xs: 4, sm: 8 },
            },
          }}>
            <FlightTable flights={flights} />
          </Box>
        )}
      </DialogContent>
      <DialogActions 
        sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 1 },
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {flights.length} flight{flights.length !== 1 ? 's' : ''} found
        </Typography>
      </DialogActions>
    </Dialog>
  );
}

