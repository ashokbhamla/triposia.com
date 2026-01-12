'use client';

import { useState, useMemo } from 'react';
import { Box, TextField, InputAdornment, Grid, Paper, Typography, Chip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Airline } from '@/lib/queries';

interface AirlineFiltersProps {
  airlines: Airline[];
  onFilteredChange?: (filtered: Airline[]) => void;
}

export default function AirlineFilters({ airlines, onFilteredChange }: AirlineFiltersProps) {
  const [nameFilter, setNameFilter] = useState('');
  const [iataFilter, setIataFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const filteredAirlines = useMemo(() => {
    let filtered = airlines;

    if (nameFilter) {
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    if (iataFilter) {
      filtered = filtered.filter(a =>
        a.iata?.toLowerCase().includes(iataFilter.toLowerCase()) ||
        a.code?.toLowerCase().includes(iataFilter.toLowerCase())
      );
    }

    if (countryFilter) {
      filtered = filtered.filter(a =>
        a.country?.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    if (onFilteredChange) {
      onFilteredChange(filtered);
    }

    return filtered;
  }, [airlines, nameFilter, iataFilter, countryFilter, onFilteredChange]);

  const countries = useMemo(() => {
    const countrySet = new Set(airlines.map(a => a.country).filter(Boolean));
    return Array.from(countrySet).sort();
  }, [airlines]);

  const hasActiveFilters = nameFilter || iataFilter || countryFilter;

  return (
    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 2, textAlign: 'left' }}>
          Filter Airlines
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by Name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search by IATA Code"
              value={iataFilter}
              onChange={(e) => setIataFilter(e.target.value.toUpperCase())}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Filter by Country"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </TextField>
          </Grid>
        </Grid>
        
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredAirlines.length} of {airlines.length} airlines
            </Typography>
            {(nameFilter || iataFilter || countryFilter) && (
              <Chip
                label="Clear Filters"
                onClick={() => {
                  setNameFilter('');
                  setIataFilter('');
                  setCountryFilter('');
                }}
                onDelete={() => {
                  setNameFilter('');
                  setIataFilter('');
                  setCountryFilter('');
                }}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

