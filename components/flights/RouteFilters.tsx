'use client';

import { useState } from 'react';
import { Box, Chip, Typography, Stack } from '@mui/material';
import { FilterList } from '@mui/icons-material';

export type RouteTypeFilter = 'all' | 'domestic' | 'international';
export type StopFilter = 'all' | 'direct' | 'one-stop' | 'two-stop';

interface RouteFiltersProps {
  routeType: RouteTypeFilter;
  onRouteTypeChange: (value: RouteTypeFilter) => void;
  stopType: StopFilter;
  onStopTypeChange: (value: StopFilter) => void;
  showStopFilter?: boolean; // Optional - only show if we have stop data
}

export default function RouteFilters({
  routeType,
  onRouteTypeChange,
  stopType,
  onStopTypeChange,
  showStopFilter = false,
}: RouteFiltersProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <FilterList fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          Filters
        </Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
        {/* Route Type Filter */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Route Type
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              label="All"
              onClick={() => onRouteTypeChange('all')}
              color={routeType === 'all' ? 'primary' : 'default'}
              variant={routeType === 'all' ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="Domestic"
              onClick={() => onRouteTypeChange('domestic')}
              color={routeType === 'domestic' ? 'primary' : 'default'}
              variant={routeType === 'domestic' ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
            <Chip
              label="International"
              onClick={() => onRouteTypeChange('international')}
              color={routeType === 'international' ? 'primary' : 'default'}
              variant={routeType === 'international' ? 'filled' : 'outlined'}
              size="small"
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
        </Box>

        {/* Stop Filter */}
        {showStopFilter && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Stops
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label="All"
                onClick={() => onStopTypeChange('all')}
                color={stopType === 'all' ? 'primary' : 'default'}
                variant={stopType === 'all' ? 'filled' : 'outlined'}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="Direct"
                onClick={() => onStopTypeChange('direct')}
                color={stopType === 'direct' ? 'primary' : 'default'}
                variant={stopType === 'direct' ? 'filled' : 'outlined'}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="1 Stop"
                onClick={() => onStopTypeChange('one-stop')}
                color={stopType === 'one-stop' ? 'primary' : 'default'}
                variant={stopType === 'one-stop' ? 'filled' : 'outlined'}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
              <Chip
                label="2 Stops"
                onClick={() => onStopTypeChange('two-stop')}
                color={stopType === 'two-stop' ? 'primary' : 'default'}
                variant={stopType === 'two-stop' ? 'filled' : 'outlined'}
                size="small"
                sx={{ cursor: 'pointer' }}
              />
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

