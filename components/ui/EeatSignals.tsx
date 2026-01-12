'use client';

import { Box, Typography, Paper, Divider } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';

interface EeatSignalsProps {
  lastUpdated: Date;
  dataSources?: string[];
  disclaimers?: string[];
  updateFrequency?: string;
}

/**
 * EEAT Signals Component - Displays trust and transparency information
 * Rule 1: Data Transparency
 * Rule 5: Trustworthiness
 */
export default function EeatSignals({ 
  lastUpdated, 
  dataSources = [],
  disclaimers = [],
  updateFrequency 
}: EeatSignalsProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(lastUpdated);

  return (
    <Paper sx={{ p: 2, mt: 4, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <VerifiedIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Data Transparency & Trust
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
        <AccessTimeIcon sx={{ fontSize: 16, mr: 1, mt: 0.25, color: 'text.secondary' }} />
        <Box>
          <Typography variant="body2" color="text.secondary">
            <strong>Last updated:</strong> {formattedDate}
          </Typography>
          {updateFrequency && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <strong>Update frequency:</strong> {updateFrequency}
            </Typography>
          )}
        </Box>
      </Box>

      {dataSources.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <InfoIcon sx={{ fontSize: 16, mr: 1, mt: 0.25, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                <strong>Data sources:</strong>
              </Typography>
              {dataSources.map((source, index) => (
                <Typography key={index} variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  • {source}
                </Typography>
              ))}
            </Box>
          </Box>
        </>
      )}

      {disclaimers.length > 0 && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <Box>
            {disclaimers.map((disclaimer, index) => (
              <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 0.5, fontStyle: 'italic' }}>
                {disclaimer}
              </Typography>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}

