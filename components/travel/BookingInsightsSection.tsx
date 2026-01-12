'use client';

import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BookingInsights } from '@/lib/queries';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ErrorBoundary from '../ui/ErrorBoundary';

interface BookingInsightsSectionProps {
  insights: BookingInsights;
  airportName: string;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BookingInsightsSection({ insights, airportName }: BookingInsightsSectionProps) {
  if (!insights) {
    return null;
  }

  // Prepare data for booking calendar chart
  const allMonths = monthNames.map((month, index) => {
    const isPeak = insights.peak_travel_months?.some(pm => pm.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(pm.toLowerCase()));
    const isRecommended = insights.recommended_months?.some(rm => rm.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(rm.toLowerCase()));
    
    let status = 'normal';
    let color = '#e0e0e0';
    if (isPeak) {
      status = 'peak';
      color = '#ff9800';
    } else if (isRecommended) {
      status = 'recommended';
      color = '#4caf50';
    }
    
    return {
      month,
      value: isPeak ? 3 : isRecommended ? 2 : 1,
      status,
      color,
    };
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 3, textAlign: 'left' }}>
        Best Time to Book Flights to {airportName}
      </Typography>

      <Grid container spacing={3}>
        {/* Best Booking Window */}
        {insights.best_booking_window && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Best Booking Window
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {insights.best_booking_window}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Booking Tip */}
        {insights.booking_tip && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Booking Tip
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {insights.booking_tip}
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Peak Travel Months */}
        {insights.peak_travel_months && insights.peak_travel_months.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'warning.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Peak Travel Months
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {insights.peak_travel_months.map((month) => (
                  <Chip key={month} label={month} color="warning" />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Expect higher prices and more crowds during these months. Book early to secure better rates.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Recommended Months */}
        {insights.recommended_months && insights.recommended_months.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'success.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarTodayIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Recommended Months
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {insights.recommended_months.map((month) => (
                  <Chip key={month} label={month} sx={{ bgcolor: 'success.main', color: 'success.contrastText' }} />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                These months offer the best balance of weather, prices, and availability.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Booking Calendar Visualization */}
      {((insights.peak_travel_months && insights.peak_travel_months.length > 0) || 
        (insights.recommended_months && insights.recommended_months.length > 0)) && (
        <ErrorBoundary
          fallback={
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Unable to display booking calendar
            </Box>
          }
        >
          <Paper sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 3, textAlign: 'left', fontWeight: 600 }}>
              Monthly Booking Recommendations
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={allMonths} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  domain={[0, 3.5]}
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
                      let statusText = 'Normal Month';
                      if (status === 'peak') statusText = 'Peak Travel Month - Book Early';
                      else if (status === 'recommended') statusText = 'Recommended Month - Best Value';
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
                  {allMonths.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '4px' }} />
                <Typography variant="caption">Recommended - Best Value</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: '4px' }} />
                <Typography variant="caption">Peak - Book Early</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#e0e0e0', borderRadius: '4px' }} />
                <Typography variant="caption">Normal</Typography>
              </Box>
            </Box>
          </Paper>
        </ErrorBoundary>
      )}
    </Box>
  );
}

