/**
 * Date and Time utility functions for appointment booking
 */

/**
 * Safely combine date and time into a Date object
 * @param {Date|string} date - Date object or date string
 * @param {string} time - Time string in HH:MM or HH:MM:SS format (24-hour)
 * @returns {Date} Combined datetime
 */
export const combineDateAndTime = (date, time) => {
  try {
    console.log('combineDateAndTime input:', { date, time });
    
    if (!date || !time) {
      throw new Error('Date and time are required');
    }

    let dateObj;
    
    // Handle different date formats
    if (date instanceof Date && !isNaN(date.getTime())) {
      dateObj = new Date(date);
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      throw new Error('Invalid date format');
    }

    // Validate date
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date value');
    }

    // Parse time - handle both HH:MM and HH:MM:SS formats
    let hours, minutes;
    
    if (typeof time === 'string') {
      // Try parsing HH:MM format
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!timeMatch) {
        throw new Error(`Invalid time format: ${time}. Expected HH:MM or HH:MM:SS`);
      }
      
      hours = parseInt(timeMatch[1], 10);
      minutes = parseInt(timeMatch[2], 10);
      
      // Handle 12-hour format with AM/PM
      if (time.toLowerCase().includes('pm') && hours < 12) {
        hours += 12;
      } else if (time.toLowerCase().includes('am') && hours === 12) {
        hours = 0;
      }
    } else if (typeof time === 'object' && time.getHours) {
      // If time is already a Date object
      hours = time.getHours();
      minutes = time.getMinutes();
    } else {
      throw new Error('Invalid time format');
    }

    // Validate time components
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time values: ${hours}:${minutes}`);
    }

    // Create new date with the time
    const combinedDateTime = new Date(dateObj);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Final validation
    if (isNaN(combinedDateTime.getTime())) {
      throw new Error('Failed to create valid datetime');
    }

    console.log('combineDateAndTime result:', combinedDateTime);
    return combinedDateTime;
  } catch (error) {
    console.error('Date/time combination error:', error);
    throw new Error(`Date/time combination failed: ${error.message}`);
  }
};

/**
 * Format time for display (12-hour format)
 * @param {string} time - Time string in HH:MM format
 * @returns {string} Formatted time (e.g., "2:30 PM")
 */
export const formatTimeForDisplay = (time) => {
  try {
    if (!time) return 'Not specified';
    
    // Parse time
    let hours, minutes;
    if (typeof time === 'string') {
      const [h, m] = time.split(':').map(Number);
      hours = h;
      minutes = m;
    } else if (typeof time === 'object' && time.getHours) {
      hours = time.getHours();
      minutes = time.getMinutes();
    } else {
      return String(time);
    }
    
    if (isNaN(hours) || isNaN(minutes)) {
      return String(time);
    }
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHour}:${displayMinutes} ${ampm}`;
  } catch (e) {
    console.error('Time formatting error:', e);
    return time || 'Invalid time';
  }
};

/**
 * Convert time to 24-hour format string
 * @param {string} time - Time string in various formats
 * @returns {string} Time in HH:MM format (24-hour)
 */
export const to24HourFormat = (time) => {
  try {
    if (!time) return null;
    
    let hours, minutes;
    
    if (typeof time === 'string') {
      // Remove AM/PM and whitespace
      const cleanTime = time.trim().toUpperCase();
      
      // Check if it contains AM/PM
      if (cleanTime.includes('AM') || cleanTime.includes('PM')) {
        const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const period = match[3].toUpperCase();
          
          // Convert to 24-hour format
          if (period === 'PM' && hours < 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }
        } else {
          throw new Error('Invalid time format');
        }
      } else {
        // Assume it's already in 24-hour format
        const [h, m] = cleanTime.split(':').map(Number);
        hours = h;
        minutes = m;
      }
    } else if (typeof time === 'object' && time.getHours) {
      // Date object
      hours = time.getHours();
      minutes = time.getMinutes();
    } else {
      throw new Error('Invalid time format');
    }
    
    // Validate
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time values');
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('to24HourFormat error:', error);
    throw new Error(`Failed to convert to 24-hour format: ${error.message}`);
  }
};

/**
 * Format date for display
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date
 */
export const formatDateForDisplay = (date) => {
  try {
    if (!date) return 'Not specified';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
  }
};

/**
 * Get day name from date
 * @param {Date|string} date - Date object or string
 * @returns {string} Day name (e.g., "Monday")
 */
export const getDayName = (date) => {
  try {
    if (!date) return 'Not specified';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
  } catch (e) {
    console.error('Day name error:', e);
    return 'Invalid date';
  }
};

/**
 * Validate appointment date/time
 * @param {Date|string} date - Date object or string
 * @param {string} time - Time string
 * @returns {Object} Validation result
 */
export const validateAppointmentDateTime = (date, time) => {
  try {
    console.log('validateAppointmentDateTime input:', { date, time });
    
    const combinedDateTime = combineDateAndTime(date, time);
    const now = new Date();
    
    // Check if appointment is in the past
    if (combinedDateTime <= now) {
      return {
        isValid: false,
        error: 'Appointment time cannot be in the past'
      };
    }
    
    // Check if appointment is too far in the future (e.g., more than 6 months)
    const sixMonthsFromNow = new Date(now);
    sixMonthsFromNow.setMonth(now.getMonth() + 6);
    
    console.log('Now:', now);
    console.log('Six months from now:', sixMonthsFromNow);
    console.log('Appointment date:', combinedDateTime);
    
    if (combinedDateTime > sixMonthsFromNow) {
      return {
        isValid: false,
        error: 'Appointment cannot be scheduled more than 6 months in advance'
      };
    }
    
    return {
      isValid: true,
      dateTime: combinedDateTime
    };
  } catch (error) {
    console.error('Validation error:', error);
    return {
      isValid: false,
      error: error.message || 'Invalid appointment date/time'
    };
  }
};

/**
 * Convert date to ISO string safely for API
 * @param {Date} date - Date object
 * @returns {string} ISO string for API
 */
export const toISOString = (date) => {
  try {
    if (!date || !(date instanceof Date)) {
      throw new Error('Invalid date object');
    }
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date value');
    }
    
    // Return full ISO string
    return date.toISOString();
  } catch (error) {
    console.error('ISO string conversion error:', error);
    throw new Error(`Failed to convert date to ISO string: ${error.message}`);
  }
};

/**
 * Create a simple ISO string without timezone adjustments
 * @param {Date} date - Date object
 * @returns {string} Simple ISO string (YYYY-MM-DDTHH:MM:SS)
 */
export const toSimpleISOString = (date) => {
  try {
    if (!date || !(date instanceof Date)) {
      throw new Error('Invalid date object');
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Simple ISO string conversion error:', error);
    throw new Error(`Failed to create simple ISO string: ${error.message}`);
  }
};