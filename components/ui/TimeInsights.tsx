import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

interface TimeInsight {
  period: string;
  description: string;
  recommendation?: string;
}

interface TimeInsightsProps {
  title: string;
  insights: TimeInsight[];
  bestTime?: string;
  busiestHours?: string;
  cheapestMonths?: string;
}

export default function TimeInsights({
  title,
  insights,
  bestTime,
  busiestHours,
  cheapestMonths,
}: TimeInsightsProps) {
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: '1.5rem', mb: 3, textAlign: 'left' }}>
        {title}
      </Typography>

      {bestTime && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Best Time to Fly:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bestTime}
          </Typography>
        </Box>
      )}

      {busiestHours && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Busiest Hours:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {busiestHours}
          </Typography>
        </Box>
      )}

      {cheapestMonths && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Typically Cheapest Months:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cheapestMonths}
          </Typography>
        </Box>
      )}

      {insights.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h3" sx={{ fontSize: '1.1rem', mb: 1, textAlign: 'left' }}>
            Time-Based Insights
          </Typography>
          <List dense>
            {insights.map((insight, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText
                  primary={insight.period}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                      {insight.recommendation && (
                        <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block' }}>
                          💡 {insight.recommendation}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
}

