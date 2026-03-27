import React, { useState, useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  CheckCircle,
  Person
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';

import appointmentsApi from '../../api/appointmentsApi';

const TimeSlotSelection = ({ doctor, selectedDate, selectedTime, onTimeSlotSelect, loading }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDateState, setSelectedDateState] = useState(selectedDate || new Date());

  useEffect(() => {
    if (doctor && selectedDateState) {
      fetchAvailableSlots();
    }
  }, [doctor, selectedDateState]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setError(null);
      
      const dateStr = format(selectedDateState, 'yyyy-MM-dd');
      const response = await appointmentsApi.getAvailableSlots(doctor.id, {
        date: dateStr,
        duration: 30
      });
      
      let slotsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          slotsData = response.data;
        } else if (response.data.slots) {
          slotsData = response.data.slots;
        } else if (response.data.available_slots) {
          slotsData = response.data.available_slots;
        }
      }
      
      // If no slots from API, generate default slots
      if (slotsData.length === 0) {
        slotsData = generateDefaultSlots();
      }
      
      setAvailableSlots(slotsData);
    } catch (err) {
      console.error('Error fetching available slots:', err);
      
      // Fallback to default slots if API fails
      const defaultSlots = generateDefaultSlots();
      setAvailableSlots(defaultSlots);
      
      setError('Could not fetch real-time availability. Showing default time slots.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateDefaultSlots = () => {
    const slots = [];
    const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
    const afternoonSlots = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
    const eveningSlots = ['17:00', '17:30', '18:00', '18:30'];
    
    [...morningSlots, ...afternoonSlots, ...eveningSlots].forEach(time => {
      slots.push({
        time: time,
        available: Math.random() > 0.3, // Random availability for demo
        period: getPeriod(time)
      });
    });
    
    return slots;
  };

  const getPeriod = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const handleDateChange = (newDate) => {
    setSelectedDateState(newDate);
  };

  const handleTimeSelect = (time24Format) => {
    onTimeSlotSelect(selectedDateState, time24Format);
  };

  const isDateDisabled = (date) => {
    // Only disable Sundays, allow all dates from 2000-2040
    return date.getDay() === 0;
  };

  const groupSlotsByPeriod = () => {
    const grouped = {
      Morning: [],
      Afternoon: [],
      Evening: []
    };
    
    availableSlots.forEach(slot => {
      const period = slot.period || getPeriod(slot.time);
      if (grouped[period]) {
        grouped[period].push(slot);
      }
    });
    
    return grouped;
  };

  // Ensure time is in 24-hour format for API (e.g., "14:30")
  const formatTimeSlot = (time) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return time;
      }
      
      // Ensure 24-hour format (e.g., "14:30" not "2:30 PM")
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      return `${formattedHours}:${formattedMinutes}`;
    } catch (e) {
      return time;
    }
  };

  // Display time in 12-hour format for user (e.g., "2:30 PM")
  const formatDisplayTime = (time) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) {
        return time;
      }
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinutes} ${ampm}`;
    } catch (e) {
      return time;
    }
  };

  // Helper to format selected time for display
  const formatSelectedTimeForDisplay = (time) => {
    return formatDisplayTime(time);
  };

  if (!doctor) {
    return (
      <Alert severity="warning">
        Please select a doctor first.
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Choose Date & Time
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select your preferred appointment date and time slot
        </Typography>

        {/* Doctor Info */}
        <Card sx={{ mb: 3, bgcolor: 'primary.light' }}>
          <CardContent>
            <Box display="flex" alignItems="center">
              <Avatar
                src={doctor.profile_picture_url}
                sx={{ width: 50, height: 50, mr: 2 }}
              >
                {doctor.user?.first_name?.charAt(0)}
              </Avatar>
              
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Dr. {doctor.user?.first_name} {doctor.user?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctor.specialization_name} • ₹{doctor.consultation_fee}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Date Selection */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                Select Date
              </Typography>
              
              <DatePicker
                value={selectedDateState}
                onChange={handleDateChange}
                shouldDisableDate={isDateDisabled}
                minDate={new Date(2000, 0, 1)} // January 1, 2000
                maxDate={new Date(2040, 11, 31)} // December 31, 2040
                renderInput={(params) => (
                  <Box sx={{ mt: 2 }}>
                    {params.inputProps && (
                      <Typography variant="body1" fontWeight="bold">
                        {format(selectedDateState, 'EEEE, MMMM dd, yyyy')}
                      </Typography>
                    )}
                  </Box>
                )}
              />
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                * Sundays are not available<br/>
                * Date range: 2000 - 2040
              </Typography>
            </Paper>
          </Grid>

          {/* Time Slots */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
                Available Time Slots
              </Typography>
              
              {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {loadingSlots ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    Loading available slots...
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {Object.entries(groupSlotsByPeriod()).map(([period, slots]) => (
                    slots.length > 0 && (
                      <Box key={period} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                          {period}
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {slots.map((slot, index) => {
                            // Ensure time is in 24-hour format for API
                            const time24Format = formatTimeSlot(slot.time);
                            return (
                              <Grid item key={index}>
                                <Button
                                  variant={selectedTime === time24Format ? "contained" : "outlined"}
                                  color={slot.available ? "primary" : "inherit"}
                                  disabled={!slot.available || loading}
                                  onClick={() => handleTimeSelect(time24Format)} // Pass 24-hour format
                                  sx={{
                                    minWidth: 100,
                                    position: 'relative'
                                  }}
                                >
                                  {/* Display in AM/PM format for user */}
                                  {formatDisplayTime(slot.time)}
                                  {selectedTime === time24Format && (
                                    <CheckCircle 
                                      sx={{ 
                                        position: 'absolute', 
                                        top: -8, 
                                        right: -8, 
                                        fontSize: 16 
                                      }} 
                                    />
                                  )}
                                </Button>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )
                  ))}
                  
                  {availableSlots.length === 0 && (
                    <Alert severity="info">
                      No available slots for the selected date. Please choose another date.
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Selected Summary */}
        {selectedDate && selectedTime && (
          <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                Selected Appointment Time
              </Typography>
              
              <Typography variant="body1">
                <strong>Date:</strong> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
              </Typography>
              
              <Typography variant="body1">
                <strong>Time:</strong> {formatSelectedTimeForDisplay(selectedTime)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Duration: 30 minutes
              </Typography>
              
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block', fontFamily: 'monospace' }}>
                  24-hour format for API: {selectedTime}
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default TimeSlotSelection;