import { Box, Typography, Chip, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

export type ReliabilityLevel = 'Very Stable' | 'Moderate' | 'Seasonal' | 'Limited';

interface ReliabilityScoreProps {
  level: ReliabilityLevel;
  description?: string;
}

export default function ReliabilityScore({ level, description }: ReliabilityScoreProps) {
  const getColor = () => {
    switch (level) {
      case 'Very Stable':
        return 'success';
      case 'Moderate':
        return 'warning';
      case 'Seasonal':
        return 'info';
      case 'Limited':
        return 'error';
      default:
        return 'default';
    }
  };

  const getIcon = () => {
    switch (level) {
      case 'Very Stable':
        return <CheckCircleIcon sx={{ fontSize: 20, mr: 0.5 }} />;
      case 'Moderate':
        return <InfoIcon sx={{ fontSize: 20, mr: 0.5 }} />;
      case 'Seasonal':
        return <WarningIcon sx={{ fontSize: 20, mr: 0.5 }} />;
      case 'Limited':
        return <WarningIcon sx={{ fontSize: 20, mr: 0.5 }} />;
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: description ? 1 : 0 }}>
        {getIcon()}
        <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>
          Service Reliability:
        </Typography>
        <Chip
          label={level}
          color={getColor()}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 4.5 }}>
          {description}
        </Typography>
      )}
    </Paper>
  );
}

