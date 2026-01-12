'use client';

import { Box, Paper, Typography, Chip, Grid } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { FlightPriceTrends } from '@/lib/queries';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ErrorBoundary from '../ui/ErrorBoundary';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface PriceTrendsSectionProps {
  trends: FlightPriceTrends;
  airportName: string;
}

export default function PriceTrendsSection({ trends, airportName }: PriceTrendsSectionProps) {
  if (!trends) {
    return null;
  }

  // Prepare data for price trend chart
  const priceChartData = monthNames.map((month) => {
    const isCheapest = trends.cheapest_months?.some(cm => 
      cm.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(cm.toLowerCase())
    );
    const isExpensive = trends.expensive_months?.some(em => 
      em.toLowerCase().includes(month.toLowerCase()) || month.toLowerCase().includes(em.toLowerCase())
    );
    
    let priceLevel = 'normal';
    let color = '#9e9e9e';
    let value = 2;
    
    if (isCheapest) {
      priceLevel = 'cheapest';
      color = '#4caf50';
      value = 1;
    } else if (isExpensive) {
      priceLevel = 'expensive';
      color = '#f44336';
      value = 3;
    }
    
    return {
      month,
      priceLevel,
      value,
      color,
    };
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 3, textAlign: 'left' }}>
        Flight Price Trends for {airportName}
      </Typography>

      <Grid container spacing={3}>
        {/* Cheapest Months */}
        {trends.cheapest_months && trends.cheapest_months.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'success.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingDownIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Cheapest Months to Fly
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {trends.cheapest_months.map((month) => (
                  <Chip key={month} label={month} sx={{ bgcolor: 'success.main', color: 'success.contrastText' }} />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Book flights during these months for the best deals and lowest prices.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Expensive Months */}
        {trends.expensive_months && trends.expensive_months.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: 'error.light' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Most Expensive Months
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                {trends.expensive_months.map((month) => (
                  <Chip key={month} label={month} sx={{ bgcolor: 'error.main', color: 'error.contrastText' }} />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Prices are typically highest during these months. Consider booking well in advance or choosing alternative dates.
              </Typography>
            </Paper>
          </Grid>
        )}

        {/* Price Trend Summary */}
        {trends.price_trend && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h3" sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  Price Trend Analysis
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                {trends.price_trend}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Price Trend Chart */}
      {((trends.cheapest_months && trends.cheapest_months.length > 0) || 
        (trends.expensive_months && trends.expensive_months.length > 0)) && (
        <ErrorBoundary
          fallback={
            <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
              Unable to display price trend chart
            </Box>
          }
        >
          <Paper sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 3, textAlign: 'left', fontWeight: 600 }}>
              Monthly Price Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                      const level = payload[0].payload?.priceLevel;
                      let levelText = 'Normal Prices';
                      if (level === 'cheapest') levelText = 'Best Prices Available';
                      else if (level === 'expensive') levelText = 'Higher Prices Expected';
                      return (
                        <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.95)', borderRadius: 1, border: '1px solid #ccc' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Month: {label}</Typography>
                          <Typography variant="body2" color="text.secondary">{levelText}</Typography>
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
                  {priceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '4px' }} />
                <Typography variant="caption">Cheapest - Best Deals</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#f44336', borderRadius: '4px' }} />
                <Typography variant="caption">Expensive - Higher Prices</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: '#9e9e9e', borderRadius: '4px' }} />
                <Typography variant="caption">Normal Prices</Typography>
              </Box>
            </Box>
          </Paper>
        </ErrorBoundary>
      )}
    </Box>
  );
}

