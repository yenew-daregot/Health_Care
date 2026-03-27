import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Pagination,
  Alert
} from '@mui/material';
import {
  Search,
  FilterList,
  Medication
} from '@mui/icons-material';

import PrescriptionCard from './PrescriptionCard';

const PrescriptionList = ({
  prescriptions = [],
  loading = false,
  onView,
  onDownload,
  onRefill,
  showPatientInfo = false,
  showDoctorInfo = false,
  title = "Prescriptions",
  emptyMessage = "No prescriptions found"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('prescribed_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter and sort prescriptions
  const getFilteredPrescriptions = () => {
    let filtered = [...prescriptions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.medication?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescription_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (showDoctorInfo && prescription.doctor?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (showDoctorInfo && prescription.doctor?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (showPatientInfo && prescription.patient?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (showPatientInfo && prescription.patient?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'expiring') {
        filtered = filtered.filter(p => 
          p.days_remaining !== null && p.days_remaining <= 7 && p.status === 'active'
        );
      } else if (statusFilter === 'urgent') {
        filtered = filtered.filter(p => p.is_urgent);
      } else {
        filtered = filtered.filter(p => p.status === statusFilter);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'prescribed_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'medication_name') {
        aValue = a.medication?.name || '';
        bValue = b.medication?.name || '';
      } else if (sortBy === 'doctor_name') {
        aValue = `${a.doctor?.user?.first_name || ''} ${a.doctor?.user?.last_name || ''}`;
        bValue = `${b.doctor?.user?.first_name || ''} ${b.doctor?.user?.last_name || ''}`;
      } else if (sortBy === 'patient_name') {
        aValue = `${a.patient?.user?.first_name || ''} ${a.patient?.user?.last_name || ''}`;
        bValue = `${b.patient?.user?.first_name || ''} ${b.patient?.user?.last_name || ''}`;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredPrescriptions = getFilteredPrescriptions();
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage);
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'expiring', label: 'Expiring Soon' }
  ];

  // Get sort options
  const sortOptions = [
    { value: 'prescribed_date', label: 'Date Prescribed' },
    { value: 'medication_name', label: 'Medication Name' },
    { value: 'status', label: 'Status' },
    ...(showDoctorInfo ? [{ value: 'doctor_name', label: 'Doctor Name' }] : []),
    ...(showPatientInfo ? [{ value: 'patient_name', label: 'Patient Name' }] : [])
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
        
        {/* Filters and Search */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Search prescriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Sort By"
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Order"
            >
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Results Summary */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {paginatedPrescriptions.length} of {filteredPrescriptions.length} prescriptions
          </Typography>
          
          {/* Active Filters */}
          <Stack direction="row" spacing={1}>
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                size="small"
              />
            )}
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${statusOptions.find(opt => opt.value === statusFilter)?.label}`}
                onDelete={() => setStatusFilter('all')}
                size="small"
              />
            )}
          </Stack>
        </Box>
      </Box>

      {/* Prescriptions Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading prescriptions...</Typography>
        </Box>
      ) : paginatedPrescriptions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Medication sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {emptyMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search criteria or filters'
              : 'Prescriptions will appear here when available'
            }
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedPrescriptions.map((prescription) => (
              <Grid item xs={12} sm={6} md={4} key={prescription.id}>
                <PrescriptionCard
                  prescription={prescription}
                  onView={onView}
                  onDownload={onDownload}
                  onRefill={onRefill}
                  showPatientInfo={showPatientInfo}
                  showDoctorInfo={showDoctorInfo}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {/* Urgent Prescriptions Alert */}
      {prescriptions.some(p => p.is_urgent) && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          <Typography variant="body2">
            You have {prescriptions.filter(p => p.is_urgent).length} urgent prescription(s) that require immediate attention.
          </Typography>
        </Alert>
      )}

      {/* Expiring Prescriptions Alert */}
      {prescriptions.some(p => p.days_remaining !== null && p.days_remaining <= 7 && p.status === 'active') && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            You have {prescriptions.filter(p => p.days_remaining !== null && p.days_remaining <= 7 && p.status === 'active').length} prescription(s) expiring within 7 days. Consider requesting refills.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default PrescriptionList;