'use client';

import { Box, Paper, Typography, Grid, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart, Cell } from 'recharts';
import { WeatherData } from '@/lib/queries';
import ErrorBoundary from '../ui/ErrorBoundary';

interface WeatherSectionProps {
  weather: WeatherData;
  airportName: string;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function WeatherSection({ weather, airportName }: WeatherSectionProps) {
  if (!weather || !weather.months || weather.months.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = weather.months.map((month) => ({
    month: monthNames[month.month - 1] || `Month ${month.month}`,
    temp: month.temp,
    rain: month.rain,
    wind: month.wind,
    humidity: month.humidity,
  }));

  // Find best and worst months
  const bestMonths = weather.months
    .map((m, idx) => ({ ...m, index: idx }))
    .sort((a, b) => {
      // Best = moderate temp, low rain, low wind
      const scoreA = a.temp * 0.4 - a.rain * 0.3 - a.wind * 0.2 - a.humidity * 0.1;
      const scoreB = b.temp * 0.4 - b.rain * 0.3 - b.wind * 0.2 - b.humidity * 0.1;
      return scoreB - scoreA;
    })
    .slice(0, 3)
    .map(m => monthNames[m.month - 1]);

  const worstMonths = weather.months
    .map((m, idx) => ({ ...m, index: idx }))
    .sort((a, b) => {
      // Worst = extreme temp, high rain, high wind
      const scoreA = Math.abs(a.temp - 22) * 0.4 + a.rain * 0.3 + a.wind * 0.2 + Math.abs(a.humidity - 50) * 0.1;
      const scoreB = Math.abs(b.temp - 22) * 0.4 + b.rain * 0.3 + b.wind * 0.2 + Math.abs(b.humidity - 50) * 0.1;
      return scoreB - scoreA;
    })
    .slice(0, 3)
    .map(m => monthNames[m.month - 1]);

  // Calculate averages
  const avgTemp = weather.months.reduce((sum, m) => sum + m.temp, 0) / weather.months.length;
  const avgRain = weather.months.reduce((sum, m) => sum + m.rain, 0) / weather.months.length;
  const avgWind = weather.months.reduce((sum, m) => sum + m.wind, 0) / weather.months.length;
  const avgHumidity = weather.months.reduce((sum, m) => sum + m.humidity, 0) / weather.months.length;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 3, textAlign: 'left' }}>
        Weather & Climate at {airportName}
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {avgTemp.toFixed(1)}°C
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Temperature
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {avgRain.toFixed(0)}mm
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Rainfall
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {avgWind.toFixed(1)}km/h
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Wind Speed
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {avgHumidity.toFixed(0)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg Humidity
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Best vs Worst Months */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Best Months to Visit
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {bestMonths.map((month) => (
                  <Chip key={month} label={month} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Challenging Months
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {worstMonths.map((month) => (
                  <Chip key={month} label={month} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 12-Month Weather Charts */}
      <ErrorBoundary
        fallback={
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            Unable to display weather chart
          </Box>
        }
      >
        <Grid container spacing={3}>
          {/* Temperature & Rainfall Combined Chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 3, textAlign: 'left', fontWeight: 600 }}>
                12-Month Weather Overview
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#666', fontSize: 12 }}
                    stroke="#999"
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#1976d2', fontWeight: 600 } }} 
                    tick={{ fill: '#1976d2', fontSize: 12 }}
                    stroke="#1976d2"
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#4caf50', fontWeight: 600 } }} 
                    tick={{ fill: '#4caf50', fontSize: 12 }}
                    stroke="#4caf50"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #ccc', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="temp"
                    stroke="#1976d2"
                    strokeWidth={3}
                    fill="url(#tempGradient)"
                    name="Temperature (°C)"
                    dot={{ r: 5, fill: '#1976d2', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 7, fill: '#1976d2' }}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="rain" 
                    fill="url(#rainGradient)"
                    name="Rainfall (mm)"
                    radius={[8, 8, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Wind & Humidity Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1.1rem', mb: 2, textAlign: 'left', fontWeight: 600 }}>
                Wind Speed by Month
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} />
                  <YAxis label={{ value: 'km/h', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#ff9800', fontWeight: 600 } }} tick={{ fill: '#ff9800', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Bar dataKey="wind" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.wind > avgWind ? '#ff9800' : '#ffb74d'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
              <Typography variant="h3" gutterBottom sx={{ fontSize: '1.1rem', mb: 2, textAlign: 'left', fontWeight: 600 }}>
                Humidity by Month
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 11 }} />
                  <YAxis label={{ value: '%', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9c27b0', fontWeight: 600 } }} tick={{ fill: '#9c27b0', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '8px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="humidity"
                    stroke="#9c27b0"
                    strokeWidth={2}
                    fill="url(#humidityGradient)"
                    dot={{ r: 4, fill: '#9c27b0' }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </ErrorBoundary>
    </Box>
  );
}

