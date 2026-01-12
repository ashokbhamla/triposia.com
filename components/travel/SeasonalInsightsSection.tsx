'use client';

import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AirlineSeasonalInsights } from '@/lib/queries';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import ErrorBoundary from '../ui/ErrorBoundary';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface SeasonalInsightsSectionProps {
  insights: AirlineSeasonalInsights;
  airportName?: string;
  airlineName?: string;
}

export default function SeasonalInsightsSection({ insights, airportName, airlineName }: SeasonalInsightsSectionProps) {
  if (!insights || !insights.seasonal_pattern) {
    return null;
  }

  const { seasonal_pattern, insight } = insights;
  const title = airlineName 
    ? `Best Months to Fly ${airlineName} to ${airportName}`
    : `Seasonal Travel Insights for ${airportName}`;

  // Prepare data for seasonal calendar chart
  const seasonalChartData = monthNames.map((month) => {
    const isBest = seasonal_pattern.best?.some(bm => 
      bm.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(bm.toLowerCase())
    );
    const isShoulder = seasonal_pattern.shoulder?.some(sm => 
      sm.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(sm.toLowerCase())
    );
    const isWorst = seasonal_pattern.worst?.some(wm => 
      wm.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(wm.toLowerCase())
    );
    const isExtreme = seasonal_pattern.extreme?.some(em => 
      em.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(em.toLowerCase())
    );
    
    let status = 'normal';
    let color = '#e0e0e0';
    let value = 2;
    
    if (isExtreme) {
      status = 'extreme';
      color = '#d32f2f';
      value = 4;
    } else if (isWorst) {
      status = 'worst';
      color = '#f44336';
      value = 3;
    } else if (isShoulder) {
      status = 'shoulder';
      color = '#ff9800';
      value = 2.5;
    } else if (isBest) {
      status = 'best';
      color = '#4caf50';
      value = 1;
    }
    
    return {
      month,
      status,
      value,
      color,
    };
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 3, textAlign: 'left' }}>
        {title}
      </Typography>

      <Grid container spacing={3}>
        {/* Best Months */}
        {seasonal_pattern.best && seasonal_pattern.best.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'success.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Best Months
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {seasonal_pattern.best.map((month) => (
                  <Chip key={month} label={month} sx={{ bgcolor: 'success.main', color: 'success.contrastText' }} />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Optimal conditions for travel with favorable weather, prices, and availability.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Shoulder Season */}
        {seasonal_pattern.shoulder && seasonal_pattern.shoulder.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'warning.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Shoulder Season
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {seasonal_pattern.shoulder.map((month) => (
                  <Chip key={month} label={month} color="warning" />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Transition periods with moderate conditions. Good balance of price and experience.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Worst Months */}
        {seasonal_pattern.worst && seasonal_pattern.worst.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'error.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CancelIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Challenging Months
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {seasonal_pattern.worst.map((month) => (
                  <Chip key={month} label={month} sx={{ bgcolor: 'error.main', color: 'error.contrastText' }} />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                These months may have less favorable conditions. Plan accordingly and book early.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Extreme Months */}
        {seasonal_pattern.extreme && seasonal_pattern.extreme.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'error.dark' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon sx={{ mr: 1, color: 'white' }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>
                  Extreme Conditions
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {seasonal_pattern.extreme.map((month) => (
                  <Chip key={month} label={month} sx={{ bgcolor: 'rgba(255,255,255,0.3)', color: 'white' }} />
                ))}
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: 'rgba(255,255,255,0.9)' }}>
                These months may have extreme weather or conditions. Travel with caution and proper preparation.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Insight Text */}
        {insight && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Seasonal Insight
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {insight}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Seasonal Calendar Visualization */}
      {((seasonal_pattern.best && seasonal_pattern.best.length > 0) || 
        (seasonal_pattern.shoulder && seasonal_pattern.shoulder.length > 0) || 
        (seasonal_pattern.worst && seasonal_pattern.worst.length > 0) || 
        (seasonal_pattern.extreme && seasonal_pattern.extreme.length > 0)) && (
        <ErrorBoundary
          fallback={
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Unable to display seasonal calendar
            </Box>
          }
        >
          <Paper sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 3, textAlign: 'left', fontWeight: 600 }}>
              Seasonal Travel Calendar
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={seasonalChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#666', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  hide
                  domain={[0, 4.5]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #ccc', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const status = payload[0].payload?.status;
                      let statusText = 'Normal Conditions';
                      if (status === 'best') statusText = 'Best Time to Travel';
                      else if (status === 'shoulder') statusText = 'Shoulder Season - Good Value';
                      else if (status === 'worst') statusText = 'Challenging Conditions';
                      else if (status === 'extreme') statusText = 'Extreme Conditions - Travel with Caution';
                      return (
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.95)', borderRadius: 1, border: '1px solid #ccc' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Month: {label}</Typography>
                          <Typography variant="body2" color="text.secondary">{statusText}</Typography>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {seasonalChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '4px' }} />
                <Typography variant="caption">Best - Optimal Conditions</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: '4px' }} />
                <Typography variant="caption">Shoulder - Good Value</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: '4px' }} />
                <Typography variant="caption">Challenging</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#d32f2f', borderRadius: '4px' }} />
                <Typography variant="caption">Extreme - Use Caution</Typography>
              </Box>
            </Box>
          </Paper>
        </ErrorBoundary>
      )}
    </Box>
  );
}

