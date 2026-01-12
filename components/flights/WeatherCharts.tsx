'use client';

import { Box, Paper, Typography, Grid } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ErrorBoundary from '../ui/ErrorBoundary';

interface WeatherChartsProps {
  rainfall?: number[];
  temperature?: number[];
  destinationName: string;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function WeatherChartsContent({ rainfall, temperature, destinationName }: WeatherChartsProps) {
  // Validate and prepare data for charts
  const validRainfall = Array.isArray(rainfall) ? rainfall.filter((v): v is number => typeof v === 'number' && !isNaN(v)) : [];
  const validTemperature = Array.isArray(temperature) ? temperature.filter((v): v is number => typeof v === 'number' && !isNaN(v)) : [];
  
  // Prepare data for charts
  const chartData = months.map((month, index) => ({
    month,
    rainfall: validRainfall[index] !== undefined ? validRainfall[index] : null,
    temperature: validTemperature[index] !== undefined ? validTemperature[index] : null,
  })).filter(item => item.rainfall !== null || item.temperature !== null);

  if (chartData.length === 0) return null;

  // Validate chart data before rendering
  const hasValidData = chartData.some(item => 
    (item.rainfall !== null && item.rainfall >= 0) || 
    (item.temperature !== null && !isNaN(item.temperature))
  );

  if (!hasValidData) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 3, textAlign: 'left' }}>
        Weather & Climate Information for {destinationName}
      </Typography>
      <Grid container spacing={3}>
        {validTemperature.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 2, textAlign: 'left' }}>
                Average Temperature by Month
              </Typography>
              <ErrorBoundary
                fallback={
                  <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Unable to display temperature chart
                  </Box>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      name="Temperature (°C)"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ErrorBoundary>
            </Paper>
          </Grid>
        )}
        
        {validRainfall.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 2, textAlign: 'left' }}>
                Average Rainfall by Month
              </Typography>
              <ErrorBoundary
                fallback={
                  <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Unable to display rainfall chart
                  </Box>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rainfall" fill="#4caf50" name="Rainfall (mm)" />
                  </BarChart>
                </ResponsiveContainer>
              </ErrorBoundary>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default function WeatherCharts(props: WeatherChartsProps) {
  return (
    <ErrorBoundary
      fallback={
        <Box sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Weather charts are temporarily unavailable
          </Typography>
        </Box>
      }
    >
      <WeatherChartsContent {...props} />
    </ErrorBoundary>
  );
}

