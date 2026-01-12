'use client';

import { Box, Typography, Paper, Chip } from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import ScheduleIcon from '@mui/icons-material/Schedule';

interface TravelerInsightsProps {
  bestTimeToTravel?: string;
  peakSeason?: string;
  offSeason?: string;
  typicalDuration?: string;
  durationRange?: string;
  busiestHours?: string;
  seasonalityNote?: string;
}

/**
 * Traveler Decision Support Component - EEAT Experience Signals (Rule 2)
 * Provides data-driven insights to help travelers make decisions
 */
export default function TravelerInsights({
  bestTimeToTravel,
  peakSeason,
  offSeason,
  typicalDuration,
  durationRange,
  busiestHours,
  seasonalityNote,
}: TravelerInsightsProps) {
  const hasAnyInsight = bestTimeToTravel || peakSeason || typicalDuration || busiestHours;

  if (!hasAnyInsight) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mt: 4, bgcolor: 'background.default' }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 2, textAlign: 'left' }}>
        Traveler Insights
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {typicalDuration && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <ScheduleIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Typical Flight Duration
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {typicalDuration}
              {durationRange && ` (${durationRange})`}
            </Typography>
          </Box>
        )}

        {busiestHours && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <FlightIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Peak Departure Times
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {busiestHours}
            </Typography>
          </Box>
        )}

        {(peakSeason || offSeason) && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Seasonal Patterns
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 4 }}>
              {peakSeason && (
                <Chip 
                  label={`Peak: ${peakSeason}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
              {offSeason && (
                <Chip 
                  label={`Off-season: ${offSeason}`} 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
            {seasonalityNote && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
                {seasonalityNote}
              </Typography>
            )}
          </Box>
        )}

        {bestTimeToTravel && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Best Time to Travel
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {bestTimeToTravel}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

