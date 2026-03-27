// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Chip,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Select,
//   FormControl,
//   InputLabel,
//   IconButton,
//   Tooltip,
//   Typography,
//   Box,
//   Card,
//   CardContent,
//   Grid,
//   Alert,
//   Snackbar,
//   CircularProgress,
//   Avatar,
//   Divider,
//   CardActions,
//   Stack,
//   TablePagination
// } from '@mui/material';
// import {
//   CheckCircle,
//   Cancel,
//   AccessTime,
//   CalendarToday,
//   Person,
//   MedicalServices,
//   Visibility,
//   Refresh,
//   FilterList,
//   Search,
//   Check,
//   Close,
//   Download
// } from '@mui/icons-material';
// import { format } from 'date-fns';
// import { styled } from '@mui/material/styles';
// import appointmentsApi from '../../api/appointmentsApi'; 

// const StatusChip = styled(Chip)(({ theme, status }) => ({
//   backgroundColor: 
//     status === 'pending' ? theme.palette.warning.light :
//     status === 'confirmed' ? theme.palette.success.light :
//     status === 'cancelled' ? theme.palette.error.light :
//     status === 'completed' ? theme.palette.info.light :
//     status === 'scheduled' ? theme.palette.primary.light : theme.palette.grey[300],
//   color: 'white',
//   fontWeight: 'bold'
// }));

// const PriorityChip = styled(Chip)(({ theme, priority }) => ({
//   backgroundColor: 
//     priority === 'high' ? theme.palette.error.light :
//     priority === 'medium' ? theme.palette.warning.light :
//     theme.palette.success.light,
//   color: 'white'
// }));

// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:hover': {
//     backgroundColor: theme.palette.action.hover,
//   },
//   '&.highlighted': {
//     backgroundColor: theme.palette.warning.light + '20',
//   }
// }));

// const AppointmentRequests = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [filteredAppointments, setFilteredAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [actionDialogOpen, setActionDialogOpen] = useState(false);
//   const [actionType, setActionType] = useState('');
//   const [cancelReason, setCancelReason] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [dateFilter, setDateFilter] = useState('');
//   const [viewMode, setViewMode] = useState('list');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalCount, setTotalCount] = useState(0);

//   const statuses = [
//     { value: 'all', label: 'All Appointments' },
//     { value: 'pending', label: 'Pending' },
//     { value: 'confirmed', label: 'Confirmed' },
//     { value: 'scheduled', label: 'Scheduled' },
//     { value: 'completed', label: 'Completed' },
//     { value: 'cancelled', label: 'Cancelled' }
//   ];

//   const fetchAppointments = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       console.log('🔍 Fetching appointments using API service...');
      
//       // Use your appointmentsApi service
//       const response = await appointmentsApi.getDoctorAppointments();
      
//       console.log('✅ API Response:', response);
      
//       // Handle API response
//       let appointmentsData = [];
//       let count = 0;
      
//       if (response && Array.isArray(response.data)) {
//         // Response with data array
//         appointmentsData = response.data;
//         count = response.data.length;
//       } else if (response && Array.isArray(response)) {
//         // Direct array response
//         appointmentsData = response;
//         count = response.length;
//       } else {
//         console.warn('⚠️ Unexpected response format:', response);
//         appointmentsData = [];
//         count = 0;
//       }
      
//       // For doctor view, filter to show only pending/scheduled appointments
//       const filteredData = appointmentsData.filter(app => 
//         ['pending', 'scheduled'].includes(app.status?.toLowerCase())
//       );
      
//       setAppointments(filteredData);
//       setFilteredAppointments(filteredData);
//       setTotalCount(filteredData.length);
      
//       // Calculate stats
//       const today = new Date().toISOString().split('T')[0];
//       const todayCount = filteredData.filter(app => 
//         app.appointment_date === today && 
//         ['confirmed', 'scheduled', 'pending'].includes(app.status?.toLowerCase())
//       ).length;
      
//       const upcomingCount = filteredData.filter(app => {
//         const appDate = app.appointment_date;
//         return appDate > today && ['confirmed', 'scheduled'].includes(app.status?.toLowerCase());
//       }).length;
      
//       console.log('📊 Appointment Requests Stats:', { 
//         total: filteredData.length, 
//         today: todayCount, 
//         upcoming: upcomingCount 
//       });
      
//     } catch (err) {
//       console.error('❌ Error fetching appointments:', {
//         message: err.message,
//         response: err.response,
//         config: err.config
//       });
      
//       let errorMessage = 'Failed to load appointment requests.';
      
//       if (err.response) {
//         switch (err.response.status) {
//           case 401:
//             errorMessage = 'Session expired. Please login again.';
//             setTimeout(() => window.location.href = '/login', 2000);
//             break;
//           case 403:
//             errorMessage = 'You do not have permission to view appointments.';
//             break;
//           case 404:
//             errorMessage = 'Appointments endpoint not found.';
//             break;
//           case 500:
//             errorMessage = 'Server error. Please try again later.';
//             console.error('Server error details:', err.response.data);
//             break;
//           default:
//             errorMessage = `Error ${err.response.status}: ${err.response.data?.detail || 'Failed to load appointments'}`;
//         }
//       } else if (err.request) {
//         errorMessage = 'Network error. Please check your connection.';
//       } else {
//         errorMessage = `Error: ${err.message}`;
//       }
      
//       setError(errorMessage);
//       showSnackbar(errorMessage, 'error');
      
//       // For development, show mock data
//       if (process.env.NODE_ENV === 'development') {
//         console.log('⚠️ Using mock data for development');
//         const mockData = getMockAppointments();
//         setAppointments(mockData);
//         setFilteredAppointments(mockData);
//         setTotalCount(mockData.length);
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAppointments();
//   }, [fetchAppointments]);

//   useEffect(() => {
//     filterAppointments();
//   }, [statusFilter, searchTerm, dateFilter, appointments]);

//   const filterAppointments = () => {
//     let filtered = [...appointments];

//     // Apply status filter
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(app => 
//         app.status?.toLowerCase() === statusFilter.toLowerCase()
//       );
//     }

//     // Apply search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(app => {
//         const patientName = getPatientName(app).toLowerCase();
//         const patientEmail = app.patient?.user?.email?.toLowerCase() || '';
//         const doctorName = app.doctor?.user?.full_name?.toLowerCase() || 
//                           app.doctor?.full_name?.toLowerCase() || '';
        
//         return (
//           patientName.includes(term) ||
//           patientEmail.includes(term) ||
//           doctorName.includes(term) ||
//           (app.reason && app.reason.toLowerCase().includes(term)) ||
//           (app.notes && app.notes.toLowerCase().includes(term)) ||
//           (app.appointment_type && app.appointment_type.toLowerCase().includes(term))
//         );
//       });
//     }

//     // Apply date filter
//     if (dateFilter) {
//       filtered = filtered.filter(app => app.appointment_date === dateFilter);
//     }

//     setFilteredAppointments(filtered);
//   };

//   const handleViewDetails = (appointment) => {
//     setSelectedAppointment(appointment);
//     setDialogOpen(true);
//   };

//   const handleAction = (type, appointment) => {
//     setSelectedAppointment(appointment);
//     setActionType(type);
//     if (type === 'cancel') {
//       setCancelReason('');
//     }
//     setActionDialogOpen(true);
//   };

//   const confirmAction = async () => {
//     try {
//       if (!selectedAppointment) return;

//       let response;
      
//       switch (actionType) {
//         case 'confirm':
//           // Use the updateStatus endpoint from your API
//           response = await appointmentsApi.updateStatus(selectedAppointment.id, { 
//             status: 'confirmed' 
//           });
//           break;

//         case 'cancel':
//           // Use the cancelAppointment endpoint from your API
//           response = await appointmentsApi.cancelAppointment(selectedAppointment.id);
//           // Note: If your backend expects cancellation reason, you might need to update the API
//           break;

//         case 'complete':
//           // Use the updateStatus endpoint for completion
//           response = await appointmentsApi.updateStatus(selectedAppointment.id, { 
//             status: 'completed' 
//           });
//           break;

//         case 'reschedule':
//           // Implementation would require date picker and time slot selection
//           showSnackbar('Reschedule feature coming soon!', 'info');
//           setActionDialogOpen(false);
//           return;
          
//         default:
//           throw new Error('Unknown action type');
//       }

//       console.log(`✅ Appointment ${actionType} response:`, response);
      
//       setActionDialogOpen(false);
//       setCancelReason('');
      
//       // Refresh the appointments list
//       fetchAppointments();
      
//       showSnackbar(`Appointment ${actionType}ed successfully!`, 'success');

//     } catch (err) {
//       console.error(`❌ Error ${actionType}ing appointment:`, err);
//       const errorMsg = err.response?.data?.detail || 
//                       err.response?.data?.message || 
//                       err.message || 
//                       `Failed to ${actionType} appointment`;
//       showSnackbar(errorMsg, 'error');
//     }
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const getPatientName = (appointment) => {
//     if (appointment.patient?.user) {
//       return `${appointment.patient.user.first_name || ''} ${appointment.patient.user.last_name || ''}`.trim();
//     } else if (appointment.patient_name) {
//       return appointment.patient_name;
//     } else if (appointment.patient?.full_name) {
//       return appointment.patient.full_name;
//     }
//     return 'Unknown Patient';
//   };

//   const getDoctorName = (appointment) => {
//     if (appointment.doctor?.user) {
//       return `${appointment.doctor.user.first_name || ''} ${appointment.doctor.user.last_name || ''}`.trim();
//     } else if (appointment.doctor_name) {
//       return appointment.doctor_name;
//     } else if (appointment.doctor?.full_name) {
//       return appointment.doctor.full_name;
//     }
//     return 'Unknown Doctor';
//   };

//   const getStatusIcon = (status) => {
//     const statusLower = status?.toLowerCase();
//     switch (statusLower) {
//       case 'pending': return <AccessTime color="warning" />;
//       case 'confirmed': return <CheckCircle color="success" />;
//       case 'cancelled': return <Cancel color="error" />;
//       case 'completed': return <Check color="info" />;
//       case 'scheduled': return <CalendarToday color="primary" />;
//       default: return <CalendarToday />;
//     }
//   };

//   const formatDateTime = (dateString, timeString) => {
//     try {
//       if (!dateString) return 'Date not set';
      
//       // Handle different date formats
//       let date;
//       if (dateString.includes('T')) {
//         date = new Date(dateString);
//       } else {
//         // Assume YYYY-MM-DD format
//         date = new Date(dateString + 'T00:00:00');
//       }
      
//       if (isNaN(date.getTime())) return dateString;
      
//       const formattedDate = format(date, 'MMM dd, yyyy');
      
//       if (timeString) {
//         return `${formattedDate} at ${timeString}`;
//       }
//       return formattedDate;
//     } catch (err) {
//       console.warn('Error formatting date:', err);
//       return dateString;
//     }
//   };

//   const getActionButtons = (appointment) => {
//     const buttons = [];
//     const status = appointment.status?.toLowerCase();
    
//     if (status === 'pending') {
//       buttons.push(
//         <Button
//           key="confirm"
//           size="small"
//           variant="contained"
//           color="success"
//           startIcon={<Check />}
//           onClick={() => handleAction('confirm', appointment)}
//           sx={{ mr: 1 }}
//         >
//           Confirm
//         </Button>
//       );
//       buttons.push(
//         <Button
//           key="cancel"
//           size="small"
//           variant="outlined"
//           color="error"
//           startIcon={<Close />}
//           onClick={() => handleAction('cancel', appointment)}
//         >
//           Cancel
//         </Button>
//       );
//     } else if (status === 'confirmed' || status === 'scheduled') {
//       buttons.push(
//         <Button
//           key="complete"
//           size="small"
//           variant="contained"
//           color="primary"
//           startIcon={<Check />}
//           onClick={() => handleAction('complete', appointment)}
//           sx={{ mr: 1 }}
//         >
//           Complete
//         </Button>
//       );
//     }
    
//     buttons.push(
//       <Button
//         key="view"
//         size="small"
//         variant="text"
//         startIcon={<Visibility />}
//         onClick={() => handleViewDetails(appointment)}
//         sx={{ ml: 1 }}
//       >
//         View
//       </Button>
//     );
    
//     return buttons;
//   };

//   const exportToCSV = () => {
//     const csvContent = [
//       ['ID', 'Patient', 'Date', 'Time', 'Status', 'Type', 'Reason', 'Notes'],
//       ...filteredAppointments.map(app => [
//         app.id,
//         getPatientName(app),
//         app.appointment_date,
//         app.appointment_time || 'N/A',
//         app.status,
//         app.appointment_type || 'Consultation',
//         app.reason || '',
//         app.notes || ''
//       ])
//     ].map(row => row.join(',')).join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `appointment-requests-${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   // Mock data for development
//   const getMockAppointments = () => {
//     return [
//       {
//         id: 1,
//         patient: {
//           user: {
//             first_name: 'John',
//             last_name: 'Doe',
//             email: 'john@example.com'
//           },
//           phone_number: '+1234567890',
//           date_of_birth: '1985-05-15',
//           gender: 'Male',
//           blood_group: 'O+'
//         },
//         appointment_date: new Date().toISOString().split('T')[0],
//         appointment_time: '10:00 AM',
//         status: 'pending',
//         appointment_type: 'Consultation',
//         priority: 'medium',
//         reason: 'Routine checkup',
//         notes: 'Patient has mild fever',
//         duration: 30,
//         created_at: new Date().toISOString()
//       },
//       {
//         id: 2,
//         patient: {
//           user: {
//             first_name: 'Jane',
//             last_name: 'Smith',
//             email: 'jane@example.com'
//           },
//           phone_number: '+0987654321',
//           date_of_birth: '1990-08-22',
//           gender: 'Female',
//           blood_group: 'A+'
//         },
//         appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
//         appointment_time: '02:30 PM',
//         status: 'pending',
//         appointment_type: 'Follow-up',
//         priority: 'low',
//         reason: 'Follow-up visit',
//         notes: '',
//         duration: 20,
//         created_at: new Date(Date.now() - 86400000).toISOString()
//       }
//     ];
//   };

//   if (loading && appointments.length === 0) {
//     return (
//       <Box 
//         display="flex" 
//         justifyContent="center" 
//         alignItems="center" 
//         minHeight="400px"
//         sx={{ marginLeft: '240px' }}
//       >
//         <CircularProgress />
//         <Typography variant="body1" sx={{ ml: 2 }}>
//           Loading appointment requests...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ 
//       marginLeft: '240px',
//       padding: 3,
//       minHeight: '100vh',
//       backgroundColor: '#f5f5f5'
//     }}>
//       {/* Header with Stats */}
//       <Card sx={{ mb: 3, backgroundColor: 'white' }}>
//         <CardContent>
//           <Grid container spacing={3} alignItems="center">
//             <Grid item xs={12} md={8}>
//               <Typography variant="h5" gutterBottom>
//                 Appointment Requests
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Manage and respond to patient appointment requests
//               </Typography>
//               {error && (
//                 <Alert severity="error" sx={{ mt: 1 }}>
//                   {error}
//                   <Button 
//                     onClick={() => fetchAppointments()} 
//                     sx={{ ml: 1 }}
//                     size="small"
//                   >
//                     Retry
//                   </Button>
//                 </Alert>
//               )}
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Stack direction="row" spacing={2}>
//                 <Card variant="outlined" sx={{ flex: 1, textAlign: 'center', p: 2 }}>
//                   <Typography variant="h6" color="primary">
//                     {totalCount}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Total Requests
//                   </Typography>
//                 </Card>
//                 <Card variant="outlined" sx={{ flex: 1, textAlign: 'center', p: 2 }}>
//                   <Typography variant="h6" color="warning">
//                     {appointments.filter(a => a.status?.toLowerCase() === 'pending').length}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Pending
//                   </Typography>
//                 </Card>
//               </Stack>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Filters */}
//       <Card sx={{ mb: 3, backgroundColor: 'white' }}>
//         <CardContent>
//           <Grid container spacing={2} alignItems="center">
//             <Grid item xs={12} md={3}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>Status</InputLabel>
//                 <Select
//                   value={statusFilter}
//                   label="Status"
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                 >
//                   {statuses.map(status => (
//                     <MenuItem key={status.value} value={status.value}>
//                       {status.label}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} md={3}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 label="Search Patients/Reason"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 InputProps={{
//                   startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
//                 }}
//               />
//             </Grid>
//             <Grid item xs={12} md={2}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 type="date"
//                 label="Filter by Date"
//                 value={dateFilter}
//                 onChange={(e) => setDateFilter(e.target.value)}
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Stack direction="row" spacing={1} justifyContent="flex-end">
//                 <Button
//                   variant="outlined"
//                   startIcon={<Refresh />}
//                   onClick={() => fetchAppointments()}
//                   disabled={loading}
//                 >
//                   Refresh
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   startIcon={<Download />}
//                   onClick={exportToCSV}
//                   disabled={filteredAppointments.length === 0}
//                 >
//                   Export CSV
//                 </Button>
//                 <IconButton onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
//                   <FilterList />
//                 </IconButton>
//               </Stack>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* Appointments Table */}
//       <Card sx={{ backgroundColor: 'white' }}>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Patient</TableCell>
//                 <TableCell>Date & Time</TableCell>
//                 <TableCell>Type</TableCell>
//                 <TableCell>Status</TableCell>
//                 <TableCell>Priority</TableCell>
//                 <TableCell>Reason</TableCell>
//                 <TableCell align="right">Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {filteredAppointments.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
//                     <CalendarToday sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
//                     <Typography variant="h6" color="text.secondary">
//                       No appointment requests found
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {statusFilter !== 'all' ? `No ${statusFilter} appointment requests` : 'No appointment requests available'}
//                     </Typography>
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredAppointments.map((appointment) => (
//                   <StyledTableRow 
//                     key={appointment.id}
//                     className={appointment.status?.toLowerCase() === 'pending' ? 'highlighted' : ''}
//                   >
//                     <TableCell>
//                       <Box display="flex" alignItems="center">
//                         <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
//                           {getPatientName(appointment).charAt(0)}
//                         </Avatar>
//                         <Box>
//                           <Typography variant="body2" fontWeight="medium">
//                             {getPatientName(appointment)}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {appointment.patient?.user?.email || 'No email'}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </TableCell>
//                     <TableCell>
//                       {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
//                     </TableCell>
//                     <TableCell>
//                       <Chip 
//                         size="small" 
//                         label={appointment.appointment_type || 'Consultation'}
//                         icon={<MedicalServices />}
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <Box display="flex" alignItems="center">
//                         {getStatusIcon(appointment.status)}
//                         <StatusChip 
//                           size="small" 
//                           label={appointment.status?.toUpperCase() || 'UNKNOWN'}
//                           status={appointment.status?.toLowerCase()}
//                           sx={{ ml: 1 }}
//                         />
//                       </Box>
//                     </TableCell>
//                     <TableCell>
//                       <PriorityChip 
//                         size="small" 
//                         label={appointment.priority || 'normal'}
//                         priority={appointment.priority || 'normal'}
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <Tooltip title={appointment.reason || 'No reason provided'}>
//                         <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
//                           {appointment.reason || 'No reason provided'}
//                         </Typography>
//                       </Tooltip>
//                     </TableCell>
//                     <TableCell align="right">
//                       <Stack direction="row" spacing={1} justifyContent="flex-end">
//                         {getActionButtons(appointment)}
//                       </Stack>
//                     </TableCell>
//                   </StyledTableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
        
//         {/* Pagination */}
//         {totalCount > 0 && (
//           <TablePagination
//             component="div"
//             count={totalCount}
//             page={page}
//             onPageChange={handleChangePage}
//             rowsPerPage={rowsPerPage}
//             onRowsPerPageChange={handleChangeRowsPerPage}
//             rowsPerPageOptions={[5, 10, 25, 50]}
//           />
//         )}
//       </Card>

//       {/* Details Dialog */}
//       <Dialog 
//         open={dialogOpen} 
//         onClose={() => setDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         {selectedAppointment && (
//           <>
//             <DialogTitle>
//               Appointment Details
//               <StatusChip 
//                 label={selectedAppointment.status?.toUpperCase() || 'UNKNOWN'}
//                 status={selectedAppointment.status?.toLowerCase()}
//                 sx={{ ml: 2 }}
//               />
//             </DialogTitle>
//             <DialogContent dividers>
//               <Grid container spacing={3}>
//                 <Grid item xs={12} md={6}>
//                   <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                     Patient Information
//                   </Typography>
//                   <Box display="flex" alignItems="center" mb={2}>
//                     <Avatar sx={{ mr: 2, width: 56, height: 56 }}>
//                       {getPatientName(selectedAppointment).charAt(0)}
//                     </Avatar>
//                     <Box>
//                       <Typography variant="h6">
//                         {getPatientName(selectedAppointment)}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {selectedAppointment.patient?.user?.email || 'No email'}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Phone: {selectedAppointment.patient?.phone_number || 'N/A'}
//                       </Typography>
//                     </Box>
//                   </Box>
                  
//                   {selectedAppointment.patient?.date_of_birth && (
//                     <Typography variant="body2">
//                       <strong>Date of Birth:</strong> {selectedAppointment.patient.date_of_birth}
//                     </Typography>
//                   )}
                  
//                   {selectedAppointment.patient?.gender && (
//                     <Typography variant="body2">
//                       <strong>Gender:</strong> {selectedAppointment.patient.gender}
//                     </Typography>
//                   )}
                  
//                   {selectedAppointment.patient?.blood_group && (
//                     <Typography variant="body2">
//                       <strong>Blood Group:</strong> {selectedAppointment.patient.blood_group}
//                     </Typography>
//                   )}
//                 </Grid>
                
//                 <Grid item xs={12} md={6}>
//                   <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                     Appointment Details
//                   </Typography>
                  
//                   <Typography variant="body2" gutterBottom>
//                     <strong>Date:</strong> {formatDateTime(selectedAppointment.appointment_date, null)}
//                   </Typography>
                  
//                   {selectedAppointment.appointment_time && (
//                     <Typography variant="body2" gutterBottom>
//                       <strong>Time:</strong> {selectedAppointment.appointment_time}
//                     </Typography>
//                   )}
                  
//                   <Typography variant="body2" gutterBottom>
//                     <strong>Type:</strong> {selectedAppointment.appointment_type || 'Consultation'}
//                   </Typography>
                  
//                   <Typography variant="body2" gutterBottom>
//                     <strong>Priority:</strong> 
//                     <PriorityChip 
//                       size="small" 
//                       label={selectedAppointment.priority || 'normal'}
//                       priority={selectedAppointment.priority || 'normal'}
//                       sx={{ ml: 1 }}
//                     />
//                   </Typography>
                  
//                   <Typography variant="body2" gutterBottom>
//                     <strong>Duration:</strong> {selectedAppointment.duration || '30'} minutes
//                   </Typography>
                  
//                   {selectedAppointment.created_at && (
//                     <Typography variant="body2">
//                       <strong>Created:</strong> {format(new Date(selectedAppointment.created_at), 'PPpp')}
//                     </Typography>
//                   )}
//                 </Grid>
                
//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                     Reason for Visit
//                   </Typography>
//                   <Paper variant="outlined" sx={{ p: 2 }}>
//                     <Typography variant="body1">
//                       {selectedAppointment.reason || 'No reason provided'}
//                     </Typography>
//                   </Paper>
//                 </Grid>
                
//                 {selectedAppointment.notes && (
//                   <Grid item xs={12}>
//                     <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//                       Additional Notes
//                     </Typography>
//                     <Paper variant="outlined" sx={{ p: 2 }}>
//                       <Typography variant="body1">
//                         {selectedAppointment.notes}
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 )}
                
//                 {selectedAppointment.cancellation_reason && (
//                   <Grid item xs={12}>
//                     <Alert severity="warning">
//                       <Typography variant="subtitle2">Cancellation Reason:</Typography>
//                       <Typography variant="body2">
//                         {selectedAppointment.cancellation_reason}
//                       </Typography>
//                     </Alert>
//                   </Grid>
//                 )}
//               </Grid>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setDialogOpen(false)}>Close</Button>
//               {selectedAppointment.status?.toLowerCase() === 'pending' && (
//                 <Button 
//                   variant="contained" 
//                   color="success"
//                   startIcon={<Check />}
//                   onClick={() => {
//                     setDialogOpen(false);
//                     handleAction('confirm', selectedAppointment);
//                   }}
//                 >
//                   Confirm Appointment
//                 </Button>
//               )}
//             </DialogActions>
//           </>
//         )}
//       </Dialog>

//       {/* Action Dialog */}
//       <Dialog 
//         open={actionDialogOpen} 
//         onClose={() => setActionDialogOpen(false)}
//       >
//         <DialogTitle>
//           {actionType === 'confirm' && 'Confirm Appointment'}
//           {actionType === 'cancel' && 'Cancel Appointment'}
//           {actionType === 'complete' && 'Mark as Complete'}
//           {actionType === 'reschedule' && 'Reschedule Appointment'}
//         </DialogTitle>
//         <DialogContent>
//           {selectedAppointment && (
//             <Typography variant="body1" paragraph>
//               {actionType === 'confirm' && 
//                 `Confirm appointment with ${getPatientName(selectedAppointment)} on ${formatDateTime(selectedAppointment.appointment_date, selectedAppointment.appointment_time)}?`}
              
//               {actionType === 'cancel' && 
//                 `Cancel appointment with ${getPatientName(selectedAppointment)}?`}
              
//               {actionType === 'complete' && 
//                 `Mark appointment with ${getPatientName(selectedAppointment)} as completed?`}
//             </Typography>
//           )}
          
//           {actionType === 'cancel' && (
//             <TextField
//               autoFocus
//               fullWidth
//               multiline
//               rows={3}
//               label="Cancellation Reason"
//               value={cancelReason}
//               onChange={(e) => setCancelReason(e.target.value)}
//               placeholder="Please provide a reason for cancellation..."
//               required
//             />
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
//           <Button 
//             onClick={confirmAction}
//             variant="contained"
//             color={
//               actionType === 'confirm' ? 'success' :
//               actionType === 'cancel' ? 'error' : 'primary'
//             }
//             disabled={actionType === 'cancel' && !cancelReason.trim()}
//           >
//             {actionType === 'confirm' && 'Confirm'}
//             {actionType === 'cancel' && 'Cancel Appointment'}
//             {actionType === 'complete' && 'Mark Complete'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert 
//           onClose={handleCloseSnackbar} 
//           severity={snackbar.severity}
//           sx={{ width: '100%' }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default AppointmentRequests;