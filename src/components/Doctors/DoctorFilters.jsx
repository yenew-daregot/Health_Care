import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Grid,
  Paper,
  Typography,
  Tooltip
} from '@mui/material';
import { 
  FilterList, 
  ClearAll, 
  Search,
  AccessTime,
  Paid,
  VerifiedUser
} from '@mui/icons-material';
const DoctorFilters = ({ 
  onFilterChange, 
  specializations = [],
  initialFilters = {},
  showLabels = true
}) => {
  const [filters, setFilters] = useState({
    search: '',
    specialization: '',
    minExperience: '',
    maxFee: '',
    availability: 'all',
    sortBy: 'rating',
    ...initialFilters
  });
  useEffect(() => {
    if (initialFilters && Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);
  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };
  const handleClear = () => {
    const clearedFilters = {
      search: '',
      specialization: '',
      minExperience: '',
      maxFee: '',
      availability: 'all',
      sortBy: 'rating'
    };
    setFilters(clearedFilters);
    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };
  // Check if any filter is active
  const hasActiveFilters = () => {
    return filters.search || 
           filters.specialization || 
           filters.minExperience || 
           filters.maxFee || 
           filters.availability !== 'all' ||
           filters.sortBy !== 'rating';
  };
  // Get specialization name for chip display
  const getSpecializationName = () => {
    if (!filters.specialization || !Array.isArray(specializations) || specializations.length === 0) {
      return 'Selected';
    }    
    const spec = specializations.find(s => {
      const specId = s.id?.toString();
      const specValue = s.value?.toString();
      const filterValue = filters.specialization.toString();
      return specId === filterValue || specValue === filterValue;
    });   
    return spec?.name || spec?.label || 'Selected';
  };
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        border: hasActiveFilters() ? '1px solid' : 'none',
        borderColor: hasActiveFilters() ? 'primary.main' : 'transparent'
      }}
    >
      {showLabels && (
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <FilterList color="primary" />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Filter Doctors
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Refine your search by specific criteria
            </Typography>
          </Box>
        </Stack>
      )}      
      <Grid container spacing={2} alignItems="center">
        {/* Search Field */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search Doctors"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Name, specialization, or license"
            size="small"
            InputProps={{
              startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
            }}
            variant="outlined"
          />
        </Grid>       
        {/* Specialization Filter  */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Specialization</InputLabel>
            <Select
              value={filters.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              label="Specialization"
              variant="outlined"
            >
              <MenuItem value="">
                <em>All Specializations</em>
              </MenuItem>
              {Array.isArray(specializations) && specializations.length > 0 ? (
                specializations.map((spec) => (
                  <MenuItem 
                    key={spec.id || spec.value || spec.name} 
                    value={spec.id?.toString() || spec.value?.toString() || spec.name}
                  >
                    {spec.name || spec.label || 'Unknown Specialization'}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  No specializations available
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>        
        {/* Min Experience */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Min Experience"
            type="number"
            value={filters.minExperience}
            onChange={(e) => handleChange('minExperience', e.target.value)}
            placeholder="Years"
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <Tooltip title="Minimum years of experience">
                  <AccessTime fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                </Tooltip>
              ),
              inputProps: { min: 0, max: 50 }
            }}
          />
        </Grid>
        {/* Max Fee */}
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            fullWidth
            label="Max Fee"
            type="number"
            value={filters.maxFee}
            onChange={(e) => handleChange('maxFee', e.target.value)}
            placeholder="₹ Max"
            size="small"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <Tooltip title="Maximum consultation fee">
                  <Paid fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                </Tooltip>
              ),
              inputProps: { min: 0 }
            }}
          />
        </Grid>       
        {/* Availability/Status Filter */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.availability}
              onChange={(e) => handleChange('availability', e.target.value)}
              label="Status"
              variant="outlined"
            >
              <MenuItem value="all">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FilterList fontSize="small" />
                  <span>All Doctors</span>
                </Stack>
              </MenuItem>
              <MenuItem value="available">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTime fontSize="small" color="success" />
                  <span>Available Now</span>
                </Stack>
              </MenuItem>
              <MenuItem value="verified">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <VerifiedUser fontSize="small" color="primary" />
                  <span>Verified Only</span>
                </Stack>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid> 
        {/* Clear Button with conditional visibility */}
        {hasActiveFilters() && (
          <Grid item xs={12} sm={6} md={1}>
            <Tooltip title="Clear all filters">
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClear}
                startIcon={<ClearAll />}
                size="small"
                color="error"
              >
                Clear
              </Button>
            </Tooltip>
          </Grid>
        )}
      </Grid>
      {/* Active Filters Chips */}
      {hasActiveFilters() && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.search && (
            <Chip
              label={`Search: ${filters.search}`}
              size="small"
              onDelete={() => handleChange('search', '')}
            />
          )}
          {filters.specialization && (
            <Chip
              label={`Specialization: ${getSpecializationName()}`}
              size="small"
              onDelete={() => handleChange('specialization', '')}
            />
          )}
          {filters.minExperience && (
            <Chip
              label={`Min Exp: ${filters.minExperience} years`}
              size="small"
              onDelete={() => handleChange('minExperience', '')}
            />
          )}
          {filters.maxFee && (
            <Chip
              label={`Max Fee: ₹${filters.maxFee}`}
              size="small"
              onDelete={() => handleChange('maxFee', '')}
            />
          )}
          {filters.availability !== 'all' && (
            <Chip
              label={`Status: ${filters.availability}`}
              size="small"
              onDelete={() => handleChange('availability', 'all')}
            />
          )}
        </Box>
      )}
    </Paper>
  );
};
// Default props
DoctorFilters.defaultProps = {
  onFilterChange: null,
  specializations: [],
  initialFilters: {},
  showLabels: true
};
export default DoctorFilters;