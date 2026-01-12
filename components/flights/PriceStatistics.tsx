'use client';

import { Box, Paper, Typography, Grid, Tooltip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

interface MonthlyPrice {
  month: string;
  price: number;
  monthShort?: string;
}

interface PriceStatisticsProps {
  averagePrice?: number;
  monthlyPrices?: MonthlyPrice[];
  description?: string;
  originCity?: string;
  destinationCity?: string;
  originCode?: string;
  destinationCode?: string;
  originDisplay?: string; // Pre-formatted display string (e.g., "Delhi (DEL)")
  destinationDisplay?: string; // Pre-formatted display string (e.g., "Hyderabad (HYD)")
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function PriceStatistics({
  averagePrice,
  monthlyPrices = [],
  description,
  originCity,
  destinationCity,
  originCode,
  destinationCode,
  originDisplay,
  destinationDisplay,
}: PriceStatisticsProps) {
  // Find the minimum price to highlight in the chart
  const minPrice = monthlyPrices.length > 0 
    ? Math.min(...monthlyPrices.map(p => p.price || 0))
    : 0;

  // Find the maximum price for chart scaling
  const maxPrice = monthlyPrices.length > 0
    ? Math.max(...monthlyPrices.map(p => p.price || 0))
    : 100;

  // Prepare chart data
  const chartData = monthlyPrices.map((item) => ({
    month: item.monthShort || item.month.substring(0, 3),
    price: item.price || 0,
    isCheapest: item.price === minPrice,
  }));

  // Get cheapest month
  const cheapestMonth = monthlyPrices.length > 0
    ? monthlyPrices.find(p => p.price === minPrice)?.monthShort || monthlyPrices.find(p => p.price === minPrice)?.month
    : null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: { xs: 2, sm: 3 }, textAlign: 'left' }}>
        {originDisplay && destinationDisplay
          ? `${originDisplay} - ${destinationDisplay} flight price statistics`
          : originCity && destinationCity 
          ? `${originCity} - ${destinationCity} flight price statistics`
          : originCode && destinationCode
          ? `${originCode} - ${destinationCode} flight price statistics`
          : 'Flight Price Statistics'}
      </Typography>

      {/* Average Price */}
      {averagePrice && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            ${averagePrice}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Approximate
          </Typography>
        </Box>
      )}

      {/* Description */}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}

      {/* Monthly Prices Grid */}
      {monthlyPrices.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {monthlyPrices.map((item) => (
              <Grid item xs={6} sm={4} md={2} key={item.month}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: item.price === minPrice ? 'action.selected' : 'background.paper',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    ${item.price}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.monthShort || item.month}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Chart */}
          <Box sx={{ mt: 4, mb: 2 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCheapest ? '#2E7D32' : '#0B3C5D'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Chart note */}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            Approximate prices for one round-trip flight {originDisplay && destinationDisplay
              ? `from ${originDisplay} to ${destinationDisplay}`
              : originCode && destinationCode 
              ? `from ${originCity || originCode} (${originCode}) to ${destinationCity || destinationCode} (${destinationCode})`
              : 'on this route'}. Graph is not to scale.
          </Typography>
        </>
      )}
    </Paper>
  );
}

