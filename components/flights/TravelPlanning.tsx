'use client';

import { Box, Paper, Typography, Grid, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloudIcon from '@mui/icons-material/Cloud';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

interface TravelPlanningProps {
  cheapestDay?: string;
  cheapestMonth?: string;
  averageFare?: number;
  rainfall?: number[];
  temperature?: number[];
  destinationName: string;
  originName: string;
}

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function TravelPlanning({
  cheapestDay,
  cheapestMonth,
  averageFare,
  rainfall,
  temperature,
  destinationName,
  originName,
}: TravelPlanningProps) {
  // Find best months to visit based on temperature and rainfall
  const getBestMonthsToVisit = () => {
    if (!temperature || !rainfall || temperature.length === 0 || rainfall.length === 0) return [];
    
    // Find months with moderate temperature (15-30°C) and low rainfall (<100mm)
    const bestMonths: string[] = [];
    temperature.forEach((temp, index) => {
      const rain = rainfall[index] || 0;
      if (temp >= 15 && temp <= 30 && rain < 100) {
        bestMonths.push(months[index]);
      }
    });
    
    return bestMonths.length > 0 ? bestMonths : [];
  };

  const bestMonths = getBestMonthsToVisit();
  const hasData = cheapestDay || cheapestMonth || averageFare !== undefined || bestMonths.length > 0;

  if (!hasData) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 3, textAlign: 'left' }}>
        Best Time to Visit & Travel Planning
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {cheapestDay && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <CalendarTodayIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Cheapest Day
              </Typography>
              <Chip label={cheapestDay} color="primary" sx={{ mt: 1 }} />
            </Paper>
          </Grid>
        )}
        
        {cheapestMonth && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <CalendarTodayIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Cheapest Month
              </Typography>
              <Chip label={cheapestMonth} color="primary" sx={{ mt: 1 }} />
            </Paper>
          </Grid>
        )}
        
        {averageFare !== undefined && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
              <AttachMoneyIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                Average Fare
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mt: 1 }}>
                ${averageFare.toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {bestMonths.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <WbSunnyIcon sx={{ color: 'warning.main' }} />
            <Typography variant="h3" sx={{ fontSize: '1.25rem', textAlign: 'left' }}>
              Best Months to Visit {destinationName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {bestMonths.map((month, idx) => (
              <Chip key={idx} label={month} color="success" variant="outlined" />
            ))}
          </Box>
          <List sx={{ mt: 2 }}>
            <ListItem>
              <ListItemIcon>
                <WbSunnyIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Ideal Weather Conditions"
                secondary={`${destinationName} experiences pleasant weather during ${bestMonths.join(', ')} with moderate temperatures and lower rainfall, making it perfect for sightseeing and outdoor activities.`}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FlightTakeoffIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Travel Planning Tips"
                secondary={`Plan your trip to ${destinationName} during ${bestMonths[0]}${bestMonths.length > 1 ? ` or ${bestMonths.slice(1).join(', ')}` : ''} for the best weather conditions and potentially better flight prices.`}
              />
            </ListItem>
            {rainfall && rainfall.length > 0 && (
              <ListItem>
                <ListItemIcon>
                  <CloudIcon color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Rainfall Considerations"
                  secondary={`${destinationName} receives varying amounts of rainfall throughout the year. The driest months (${bestMonths.join(', ')}) are ideal for travel, while wetter months may require packing appropriate rain gear.`}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h3" gutterBottom sx={{ fontSize: '1.25rem', mb: 2, textAlign: 'left' }}>
          Travel Planning Tips for {originName} to {destinationName}
        </Typography>
        <List>
          {cheapestDay && (
            <ListItem>
              <ListItemIcon>
                <CalendarTodayIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Best Day to Book"
                secondary={`${cheapestDay} typically offers the lowest fares for flights from ${originName} to ${destinationName}. Consider booking on this day for potential savings.`}
              />
            </ListItem>
          )}
          {cheapestMonth && (
            <ListItem>
              <ListItemIcon>
                <CalendarTodayIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Best Month to Travel"
                secondary={`${cheapestMonth} is generally the cheapest month to fly from ${originName} to ${destinationName}. Plan your trip during this month for the best deals.`}
              />
            </ListItem>
          )}
          {averageFare !== undefined && (
            <ListItem>
              <ListItemIcon>
                <AttachMoneyIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Average Flight Price"
                secondary={`The average fare for flights from ${originName} to ${destinationName} is approximately $${averageFare.toLocaleString()}. Prices may vary based on booking time, season, and airline.`}
              />
            </ListItem>
          )}
          {bestMonths.length > 0 && (
            <ListItem>
              <ListItemIcon>
                <WbSunnyIcon color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Weather-Based Planning"
                secondary={`For the best weather experience, visit ${destinationName} during ${bestMonths.join(', ')}. These months offer comfortable temperatures and minimal rainfall, perfect for exploring the destination.`}
              />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

