'use client';

import { useState } from 'react';
import { Box, Paper, Typography, Button, Grid } from '@mui/material';
import { ViewWeek, CalendarMonth } from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Flight } from '@/lib/queries';

interface FlightCalendarProps {
  flights: Flight[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export default function FlightCalendar({ flights, selectedDate, onDateSelect }: FlightCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Get flights for a specific date
  const getFlightsForDate = (date: Date) => {
    // Since flights don't have dates, we'll show all flights
    // In a real implementation, you'd filter by date
    return flights;
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentMonth, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handlePrevPeriod = () => {
    setCurrentMonth(viewMode === 'month' ? subMonths(currentMonth, 1) : subMonths(currentMonth, 0));
  };

  const handleNextPeriod = () => {
    setCurrentMonth(viewMode === 'month' ? addMonths(currentMonth, 1) : addMonths(currentMonth, 0));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };

  const renderMonthView = () => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Create array of days including empty cells for alignment
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return (
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Grid 
          container 
          spacing={{ xs: 0.25, sm: 0.5 }} 
          sx={{ 
            width: '100%', 
            margin: 0,
            '& .MuiGrid-item': {
              padding: { xs: '2px', sm: '4px' },
            }
          }}
        >
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Grid 
              item 
              xs={12 / 7} 
              key={day} 
              sx={{ 
                textAlign: 'center', 
                py: { xs: 0.75, sm: 1 },
                minWidth: 0,
                flexBasis: { xs: '14.28%', sm: 'auto' },
                maxWidth: { xs: '14.28%', sm: 'none' },
              }}
            >
              <Typography 
                variant="caption" 
                fontWeight="bold" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  display: 'block',
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
          {/* Calendar days */}
          {days.map((date, idx) => (
            <Grid 
              item 
              xs={12 / 7}
              key={idx} 
              sx={{ 
                minHeight: { xs: 60, sm: 70, md: 80 },
                minWidth: 0,
                flexBasis: { xs: '14.28%', sm: 'auto' },
                maxWidth: { xs: '14.28%', sm: 'none' },
                p: { xs: '2px', sm: '4px' },
              }}
            >
              {date ? (
                <Button
                  fullWidth
                  variant={selectedDate && isSameDay(date, selectedDate) ? 'contained' : 'outlined'}
                  onClick={() => handleDateClick(date)}
                  sx={{
                    minHeight: { xs: 60, sm: 70, md: 80 },
                    height: '100%',
                    width: '100%',
                    borderColor: 'divider',
                    p: { xs: '4px', sm: 1 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 0.25, sm: 0.5 },
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '& .MuiButton-label': {
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: { xs: 0.25, sm: 0.5 },
                    },
                  }}
                >
                  <Typography 
                    variant="body2"
                    component="span"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' }, 
                      fontWeight: 600,
                      lineHeight: 1.2,
                      display: 'block',
                    }}
                  >
                    {format(date, 'd')}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    component="span"
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      lineHeight: 1.2,
                      textAlign: 'center',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      width: '100%',
                      maxWidth: '100%',
                    }}
                  >
                    {getFlightsForDate(date).length} {getFlightsForDate(date).length === 1 ? 'flight' : 'flights'}
                  </Typography>
                </Button>
              ) : (
                <Box 
                  sx={{ 
                    minHeight: { xs: 60, sm: 70, md: 80 },
                    width: '100%',
                    height: '100%',
                  }} 
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderWeekView = () => {
    return (
      <Grid 
        container 
        spacing={{ xs: 0.5, sm: 1 }}
        sx={{ 
          width: '100%',
          '& .MuiGrid-item': {
            padding: { xs: '4px', sm: '8px' },
          }
        }}
      >
        {weekDays.map((date) => (
          <Grid 
            item 
            xs={12 / 7}
            key={date.toISOString()}
            sx={{
              minWidth: 0,
              flexBasis: { xs: '14.28%', sm: 'auto' },
              maxWidth: { xs: '14.28%', sm: 'none' },
            }}
          >
            <Button
              fullWidth
              variant={selectedDate && isSameDay(date, selectedDate) ? 'contained' : 'outlined'}
              onClick={() => handleDateClick(date)}
              sx={{
                minHeight: { xs: 80, sm: 100 },
                height: '100%',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: { xs: 0.5, sm: 1 },
                p: { xs: 1, sm: 1.5 },
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                {format(date, 'EEE')}
              </Typography>
              <Typography 
                variant="h6"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {format(date, 'd')}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {format(date, 'MMM')}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  mt: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  textAlign: 'center',
                }}
              >
                {getFlightsForDate(date).length} {getFlightsForDate(date).length === 1 ? 'flight' : 'flights'}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 3 }, overflow: 'hidden', width: '100%' }}>
      {/* Header with view toggle */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 2, sm: 0 },
          flexWrap: 'wrap',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1, 
            justifyContent: { xs: 'center', sm: 'flex-start' },
            width: { xs: '100%', sm: 'auto' },
          }}
        >
          <Button
            startIcon={<CalendarMonth />}
            variant={viewMode === 'month' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('month')}
            size="small"
            sx={{ 
              minWidth: { xs: 'auto', sm: 100 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Month
          </Button>
          <Button
            startIcon={<ViewWeek />}
            variant={viewMode === 'week' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('week')}
            size="small"
            sx={{ 
              minWidth: { xs: 'auto', sm: 100 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Week
          </Button>
        </Box>
        
        {/* Month navigation */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            flexShrink: 0,
          }}
        >
          <Button 
            onClick={handlePrevPeriod} 
            size="small"
            sx={{ 
              minWidth: { xs: 36, sm: 48 },
              px: { xs: 0.75, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
            aria-label="Previous month"
          >
            ←
          </Button>
          <Typography 
            variant="h6" 
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1.25rem' },
              fontWeight: 600,
              minWidth: { xs: 100, sm: 150 },
              maxWidth: { xs: 150, sm: 200 },
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {format(currentMonth, viewMode === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
          </Typography>
          <Button 
            onClick={handleNextPeriod} 
            size="small"
            sx={{ 
              minWidth: { xs: 36, sm: 48 },
              px: { xs: 0.75, sm: 1.5 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
            aria-label="Next month"
          >
            →
          </Button>
        </Box>
      </Box>

      {/* Calendar view */}
      <Box sx={{ width: '100%', overflowX: 'auto', overflowY: 'visible' }}>
        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      </Box>

    </Paper>
  );
}

