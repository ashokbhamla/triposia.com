'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  TextField,
  Button,
  Container,
  InputAdornment,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { FlightTakeoff, FlightLand, Search, Airlines } from '@mui/icons-material';

interface Airline {
  code: string;
  iata?: string;
  name: string;
}

export default function FlightSearchBar() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
  const [airlines, setAirlines] = useState<Airline[]>([]);
  const [loadingAirlines, setLoadingAirlines] = useState(false);

  // Fetch airlines on component mount
  useEffect(() => {
    const fetchAirlines = async () => {
      setLoadingAirlines(true);
      try {
        const response = await fetch('/api/airlines');
        if (response.ok) {
          const data = await response.json();
          // Filter to only passenger airlines and map to our format
          const passengerAirlines = data
            .filter((a: any) => a.is_passenger !== false)
            .map((a: any) => ({
              code: (a.iata || a.code || '').toLowerCase(),
              iata: a.iata || a.code,
              name: a.name || a.short_name || a.code || '',
            }))
            .filter((a: Airline) => a.code && a.code.length >= 2)
            .sort((a: Airline, b: Airline) => a.name.localeCompare(b.name));
          setAirlines(passengerAirlines);
        }
      } catch (error) {
        console.error('Error fetching airlines:', error);
      } finally {
        setLoadingAirlines(false);
      }
    };
    fetchAirlines();
  }, []);

  const normalizeIata = (code: string): string => {
    return code.trim().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
  };

  const parseSearchQuery = (query: string): { origin: string; destination: string | null } => {
    const normalized = query.trim().toUpperCase();
    
    // Check for "to" separator: "del to bom" or "DEL TO BOM"
    const toMatch = normalized.match(/^([A-Z]{3})\s+TO\s+([A-Z]{3})$/i);
    if (toMatch) {
      return {
        origin: normalizeIata(toMatch[1]),
        destination: normalizeIata(toMatch[2]),
      };
    }

    // Check for hyphen separator: "del-bom" or "DEL-BOM"
    const hyphenMatch = normalized.match(/^([A-Z]{3})-([A-Z]{3})$/i);
    if (hyphenMatch) {
      return {
        origin: normalizeIata(hyphenMatch[1]),
        destination: normalizeIata(hyphenMatch[2]),
      };
    }

    // Check for space separator: "del bom" (two 3-letter codes)
    const spaceMatch = normalized.match(/^([A-Z]{3})\s+([A-Z]{3})$/i);
    if (spaceMatch) {
      return {
        origin: normalizeIata(spaceMatch[1]),
        destination: normalizeIata(spaceMatch[2]),
      };
    }

    // Single IATA code (origin only)
    const singleCode = normalized.match(/^([A-Z]{3})$/);
    if (singleCode) {
      return {
        origin: normalizeIata(singleCode[1]),
        destination: null,
      };
    }

    // Try to extract IATA codes from the query
    const codes = normalized.match(/\b([A-Z]{3})\b/g);
    if (codes && codes.length === 1) {
      return {
        origin: normalizeIata(codes[0]),
        destination: null,
      };
    }
    if (codes && codes.length >= 2) {
      return {
        origin: normalizeIata(codes[0]),
        destination: normalizeIata(codes[1]),
      };
    }

    return { origin: '', destination: null };
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    let finalOrigin = origin.trim().toUpperCase();
    let finalDestination = destination.trim().toUpperCase();

    // If using the unified search box
    if (searchQuery) {
      const parsed = parseSearchQuery(searchQuery);
      finalOrigin = parsed.origin;
      finalDestination = parsed.destination || '';
    } else {
      // Using separate origin/destination fields
      finalOrigin = normalizeIata(origin);
      finalDestination = normalizeIata(destination);
    }

    if (!finalOrigin) {
      return; // Need at least origin
    }

    const airlineCode = selectedAirline?.code?.toLowerCase();

    // Navigate to appropriate route
    if (airlineCode) {
      // Airline is selected - use airline routes
      if (finalDestination && finalDestination.length === 3) {
        // Both origin and destination with airline: /airlines/airline/origin-destination
        router.push(`/airlines/${airlineCode}/${finalOrigin.toLowerCase()}-${finalDestination.toLowerCase()}`);
      } else {
        // Only origin with airline: /airlines/airline/origin
        router.push(`/airlines/${airlineCode}/${finalOrigin.toLowerCase()}`);
      }
    } else {
      // No airline selected - use regular flight routes
      if (finalDestination && finalDestination.length === 3) {
        // Both origin and destination: /flights/origin-destination
        router.push(`/flights/${finalOrigin.toLowerCase()}-${finalDestination.toLowerCase()}`);
      } else {
        // Only origin: /flights/origin
        router.push(`/flights/${finalOrigin.toLowerCase()}`);
      }
    }
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          component="form"
          onSubmit={handleSearch}
          elevation={2}
          sx={{
            p: { xs: 2, sm: 3 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
          }}
        >
          {/* Unified Search Box */}
          <TextField
            fullWidth
            placeholder="Search flights (e.g., 'del' or 'del to bom' or 'del-bom')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
          />

          {/* Separate Origin/Destination Fields (Desktop) */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              label="Origin"
              placeholder="e.g., DEL"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightTakeoff color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
              inputProps={{
                maxLength: 3,
                style: { textTransform: 'uppercase' },
              }}
            />
            <Box
              sx={{
                color: 'text.secondary',
                fontSize: '1.5rem',
                fontWeight: 300,
              }}
            >
              →
            </Box>
            <TextField
              label="Destination"
              placeholder="e.g., BOM (optional)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightLand color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
              inputProps={{
                maxLength: 3,
                style: { textTransform: 'uppercase' },
              }}
            />
            <Autocomplete
              options={airlines}
              getOptionLabel={(option) => `${option.name} (${option.iata || option.code})`}
              value={selectedAirline}
              onChange={(_, newValue) => setSelectedAirline(newValue)}
              loading={loadingAirlines}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Airline (optional)"
                  placeholder="Select airline"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Airlines color="action" />
                        </InputAdornment>
                        {loadingAirlines ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ flex: 1, minWidth: 200 }}
              filterOptions={(options, { inputValue }) => {
                const search = inputValue.toLowerCase();
                return options.filter(
                  (option) =>
                    option.name.toLowerCase().includes(search) ||
                    option.code.toLowerCase().includes(search) ||
                    (option.iata && option.iata.toLowerCase().includes(search))
                );
              }}
            />
          </Box>
          
          {/* Airline Filter for Mobile */}
          <Autocomplete
            options={airlines}
            getOptionLabel={(option) => `${option.name} (${option.iata || option.code})`}
            value={selectedAirline}
            onChange={(_, newValue) => setSelectedAirline(newValue)}
            loading={loadingAirlines}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Airline (optional)"
                placeholder="Select airline"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Airlines color="action" />
                      </InputAdornment>
                      {loadingAirlines ? (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{
              display: { xs: 'block', md: 'none' },
            }}
            filterOptions={(options, { inputValue }) => {
              const search = inputValue.toLowerCase();
              return options.filter(
                (option) =>
                  option.name.toLowerCase().includes(search) ||
                  option.code.toLowerCase().includes(search) ||
                  (option.iata && option.iata.toLowerCase().includes(search))
              );
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Search />}
            sx={{
              minWidth: { xs: '100%', md: '150px' },
              py: { xs: 1.5, md: 1.75 },
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Search Flights
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

