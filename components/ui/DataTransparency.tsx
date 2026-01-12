import { Box, Typography, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface DataTransparencyProps {
  lastUpdated: Date | string;
  dataSource?: string;
}

export default function DataTransparency({ lastUpdated, dataSource }: DataTransparencyProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Paper sx={{ p: 2, mt: 4, bgcolor: 'grey.50' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AccessTimeIcon sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
          Data Transparency
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: dataSource ? 0.5 : 0 }}>
        Last updated: {formatDate(lastUpdated)}
      </Typography>
      {dataSource && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Data source: {dataSource}
        </Typography>
      )}
    </Paper>
  );
}

