import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Autocomplete,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Tooltip,
  Tabs,
  Tab,
  Snackbar,
  Divider,
  Stack,
  Badge
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Visibility,
  Send,
  Download,
  Print,
  History,
  Medication,
  LocalHospital,
  Schedule,
  Notifications,
  Save,
  Close,
  AddCircle,
  RemoveCircle,
  Person,
  CalendarToday,
  Warning
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, isAfter, isBefore, addDays } from 'date-fns';

import prescriptionsApi from '../../api/prescriptionsApi';
import patientsApi from '../../api/patientsApi';
import appointmentsApi from '../../api/appointmentsApi';

const WritePrescriptions = () => {
  // State management
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [laboratorists, setLaboratorists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedLaboratorist, setSelectedLaboratorist] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionTabValue, setPrescriptionTabValue] = useState(0);
  const [mainTabValue, setMainTabValue] = useState(0);
  const [dashboardStats, setDashboardStats] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    appointment_id: '',
    medication_id: '',
    dosage: '',
    frequency: 'once_daily',
    custom_frequency: '',
    duration: '',
    duration_days: '',
    instructions: '',
    notes: '',
    start_date: new Date(),
    end_date: null,
    refills_allowed: 0,
    is_urgent: false,
    pharmacy_notes: '',
    request_lab_tests: false,
    lab_tests_notes: '',
    lab_test_priority: 'normal',
    lab_test_category: 'general',
    lab_clinical_indication: '',
    lab_preferred_date: null,
    lab_fasting_required: false,
    lab_laboratorist_id: ''
  });

  // Show snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [
        patientsRes,
        medicationsRes,
        prescriptionsRes,
        appointmentsRes,
        dashboardRes
      ] = await Promise.all([
        patientsApi.getPatients().catch(() => ({ data: [] })),
        prescriptionsApi.getMedications().catch(() => ({ data: [] })),
        prescriptionsApi.getPrescriptions().catch(() => ({ data: [] })),
        appointmentsApi.getAppointments({ status: 'completed' }).catch(() => ({ data: [] })),
        prescriptionsApi.getDoctorDashboard().catch(() => ({ data: { statistics: {} } }))
      ]);
      
      // Fetch laboratorists separately
      let laboratoristsData = [];
      try {
        const labsApi = await import('../../api/labsApi');
        laboratoristsData = await labsApi.default.getLaboratorists();
      } catch (error) {
        console.log('Failed to fetch laboratorists, using demo data');
        laboratoristsData = [
          {
            id: 1,
            first_name: 'Dr. Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@lab.com',
            specialization: 'Clinical Chemistry'
          },
          {
            id: 2,
            first_name: 'Dr. Michael',
            last_name: 'Chen',
            email: 'michael.chen@lab.com',
            specialization: 'Hematology'
          },
          {
            id: 3,
            first_name: 'Dr. Emily',
            last_name: 'Davis',
            email: 'emily.davis@lab.com',
            specialization: 'Microbiology'
          }
        ];
      }
      
      // Ensure laboratorists is always an array
      setLaboratorists(Array.isArray(laboratoristsData) ? laboratoristsData : laboratoristsData?.results || []);
      
      // Set patients with fallback to demo data
      const patientsData = patientsRes.data?.results || patientsRes.data || [];
      if (patientsData.length === 0) {
        // Demo patients data
        const demoPatients = [
          {
            id: 1,
            user: {
              id: 1,
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com',
              phone_number: '123-456-7890'
            },
            age: 35,
            gender: 'male',
            blood_group: 'O+',
            height: 175,
            weight: 70,
            allergies: 'None known',
            medical_history: 'Hypertension',
            emergency_contact: 'Jane Doe',
            emergency_contact_phone: '123-456-7891'
          },
          {
            id: 2,
            user: {
              id: 2,
              first_name: 'Jane',
              last_name: 'Smith',
              email: 'jane.smith@example.com',
              phone_number: '123-456-7892'
            },
            age: 28,
            gender: 'female',
            blood_group: 'A+',
            height: 165,
            weight: 60,
            allergies: 'Penicillin',
            medical_history: 'Diabetes Type 2',
            emergency_contact: 'John Smith',
            emergency_contact_phone: '123-456-7893'
          },
          {
            id: 3,
            user: {
              id: 3,
              first_name: 'Robert',
              last_name: 'Johnson',
              email: 'robert.johnson@example.com',
              phone_number: '123-456-7894'
            },
            age: 42,
            gender: 'male',
            blood_group: 'B+',
            height: 180,
            weight: 85,
            allergies: 'Shellfish',
            medical_history: 'Asthma',
            emergency_contact: 'Mary Johnson',
            emergency_contact_phone: '123-456-7895'
          }
        ];
        setPatients(demoPatients);
        showSnackbar('No patients found for this doctor - using demo data for testing', 'info');
      } else {
        setPatients(patientsData);
        showSnackbar(`Successfully loaded ${patientsData.length} patients`, 'success');
      }
      
      setMedications(medicationsRes.data?.results || medicationsRes.data || []);
      
      // Add demo medications if none exist
      const medicationsData = medicationsRes.data?.results || medicationsRes.data || [];
      if (medicationsData.length === 0) {
        const demoMedications = [
          {
            id: 1,
            name: 'Amoxicillin',
            strength: '500mg',
            form: 'Capsule',
            manufacturer: 'Generic Pharma'
          },
          {
            id: 2,
            name: 'Ibuprofen',
            strength: '200mg',
            form: 'Tablet',
            manufacturer: 'Pain Relief Co'
          },
          {
            id: 3,
            name: 'Metformin',
            strength: '850mg',
            form: 'Tablet',
            manufacturer: 'Diabetes Care'
          },
          {
            id: 4,
            name: 'Lisinopril',
            strength: '10mg',
            form: 'Tablet',
            manufacturer: 'Heart Health'
          },
          {
            id: 5,
            name: 'Omeprazole',
            strength: '20mg',
            form: 'Capsule',
            manufacturer: 'Gastro Med'
          }
        ];
        setMedications(demoMedications);
      } else {
        setMedications(medicationsData);
      }
      setPrescriptions(prescriptionsRes.data?.results || prescriptionsRes.data || []);
      setAppointments(appointmentsRes.data?.results || appointmentsRes.data || []);
      setDashboardStats(dashboardRes.data?.statistics || {});
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to fetch data', 'error');
      
      // Set demo data as fallback
      const demoPatients = [
        {
          id: 1,
          user: {
            id: 1,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            phone_number: '123-456-7890'
          },
          age: 35,
          gender: 'male',
          blood_group: 'O+',
          allergies: 'None known',
          medical_history: 'Hypertension'
        }
      ];
      setPatients(demoPatients);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form changes
  const handleFormChange = (field, value) => {
    setPrescriptionForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calculate end date if duration_days is provided
    if (field === 'duration_days' && value) {
      const endDate = addDays(prescriptionForm.start_date, parseInt(value));
      setPrescriptionForm(prev => ({
        ...prev,
        end_date: endDate
      }));
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    // Filter appointments for this patient
    const patientAppointments = appointments.filter(
      apt => apt.patient?.id === patient.id && apt.status === 'completed'
    );
    if (patientAppointments.length > 0) {
      setSelectedAppointment(patientAppointments[0]);
      handleFormChange('appointment_id', patientAppointments[0].id);
    }
  };

  // Submit prescription
  const handleSubmitPrescription = async () => {
    try {
      // Validate required fields
      if (!prescriptionForm.appointment_id || !prescriptionForm.medication_id || 
          !prescriptionForm.dosage || !prescriptionForm.duration) {
        showSnackbar('Please fill all required fields', 'error');
        return;
      }

      const prescriptionData = {
        ...prescriptionForm,
        start_date: prescriptionForm.start_date.toISOString().split('T')[0],
        end_date: prescriptionForm.end_date ? prescriptionForm.end_date.toISOString().split('T')[0] : null,
      };

      console.log('Submitting prescription:', prescriptionData);
      
      const response = await prescriptionsApi.createPrescription(prescriptionData);
      
      showSnackbar('Prescription created successfully', 'success');

      // If lab tests are requested, create lab request
      if (prescriptionForm.request_lab_tests && prescriptionForm.lab_tests_notes) {
        try {
          const labRequestData = {
            appointment_id: prescriptionForm.appointment_id || null,
            patient_id: selectedPatient.id,
            test_type: prescriptionForm.lab_test_category || 'general',
            tests_requested: prescriptionForm.lab_tests_notes,
            clinical_indication: prescriptionForm.lab_clinical_indication || 'Prescription follow-up',
            priority: prescriptionForm.lab_test_priority || 'normal',
            preferred_date: prescriptionForm.lab_preferred_date ? 
              prescriptionForm.lab_preferred_date.toISOString().split('T')[0] : null,
            fasting_required: prescriptionForm.lab_fasting_required || false,
            prescription_id: response.data?.id,
            notes: `Lab tests requested with prescription: ${prescriptionData.medication_id}`
          };
          
          // Import labsApi if not already imported
          const labsApi = await import('../../api/labsApi');
          await labsApi.default.createLabRequest(labRequestData);
          
          showSnackbar('Lab request created successfully', 'success');
        } catch (labError) {
          console.error('Error creating lab request:', labError);
          showSnackbar('Prescription created but lab request failed', 'warning');
        }
      }
      
      // Reset form
      setPrescriptionForm({
        appointment_id: '',
        medication_id: '',
        dosage: '',
        frequency: 'once_daily',
        custom_frequency: '',
        duration: '',
        duration_days: '',
        instructions: '',
        notes: '',
        start_date: new Date(),
        end_date: null,
        refills_allowed: 0,
        is_urgent: false,
        pharmacy_notes: '',
        request_lab_tests: false,
        lab_tests_notes: '',
        lab_test_priority: 'normal',
        lab_test_category: 'general',
        lab_clinical_indication: '',
        lab_preferred_date: null,
        lab_fasting_required: false
      });
      
      setSelectedPatient(null);
      setSelectedAppointment(null);
      setPrescriptionTabValue(0);
      setCreateDialog(false);
      
      // Refresh data
      fetchData();
      
    } catch (error) {
      console.error('Error creating prescription:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to create prescription';
      showSnackbar(errorMessage, 'error');
    }
  };

  // View prescription details
  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewDialog(true);
  };

  // Download prescription
  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      showSnackbar('Downloading prescription...', 'info');
      // This would typically call an API endpoint that generates a PDF
      // For now, we'll create a simple text download
      const prescription = prescriptions.find(p => p.id === prescriptionId);
      if (!prescription) {
        showSnackbar('Prescription not found', 'error');
        return;
      }

      const content = `
PRESCRIPTION
${'-'.repeat(50)}
Prescription ID: ${prescription.prescription_id}
Date: ${format(new Date(prescription.prescribed_date), 'MMMM dd, yyyy')}

PATIENT INFORMATION:
Name: ${prescription.patient?.user?.first_name} ${prescription.patient?.user?.last_name}
Age: ${prescription.patient?.age || 'N/A'}
Gender: ${prescription.patient?.gender || 'N/A'}

DOCTOR INFORMATION:
Name: ${prescription.doctor?.user?.first_name} ${prescription.doctor?.user?.last_name}

MEDICATION:
Name: ${prescription.medication?.name}
Dosage: ${prescription.dosage}
Frequency: ${prescription.frequency_display}
Duration: ${prescription.duration}
${prescription.instructions ? `Instructions: ${prescription.instructions}` : ''}

${prescription.notes ? `NOTES:\n${prescription.notes}` : ''}

Refills Allowed: ${prescription.refills_allowed}
Status: ${prescription.status}
${prescription.is_urgent ? 'URGENT PRESCRIPTION' : ''}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescription.prescription_id}.txt`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Prescription downloaded', 'success');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      showSnackbar('Failed to download prescription', 'error');
    }
  };

  // Filter prescriptions based on tab
  const getFilteredPrescriptions = () => {
    let filtered = prescriptions;
    
    switch (mainTabValue) {
      case 0: // Recent
        filtered = prescriptions.slice(0, 20);
        break;
      case 1: // Active
        filtered = prescriptions.filter(p => p.status === 'active');
        break;
      case 2: // Urgent
        filtered = prescriptions.filter(p => p.is_urgent);
        break;
      case 3: // Expiring Soon
        filtered = prescriptions.filter(p => 
          p.days_remaining !== null && p.days_remaining <= 7 && p.status === 'active'
        );
        break;
      default:
        break;
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.patient?.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patient?.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medication?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.prescription_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get frequency options
  const frequencyOptions = [
    { value: 'once_daily', label: 'Once daily' },
    { value: 'twice_daily', label: 'Twice daily' },
    { value: 'thrice_daily', label: 'Three times daily' },
    { value: 'four_times_daily', label: 'Four times daily' },
    { value: 'every_hour', label: 'Every hour' },
    { value: 'every_4_hours', label: 'Every 4 hours' },
    { value: 'every_6_hours', label: 'Every 6 hours' },
    { value: 'every_8_hours', label: 'Every 8 hours' },
    { value: 'every_12_hours', label: 'Every 12 hours' },
    { value: 'weekly', label: 'Once weekly' },
    { value: 'biweekly', label: 'Twice weekly' },
    { value: 'monthly', label: 'Once monthly' },
    { value: 'as_needed', label: 'As needed (PRN)' },
    { value: 'before_meals', label: 'Before meals' },
    { value: 'after_meals', label: 'After meals' },
    { value: 'at_bedtime', label: 'At bedtime' },
    { value: 'custom', label: 'Custom frequency' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ 
        padding: 3,
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        width: '100%'
      }}>
        {/* Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  Prescription Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create and manage patient prescriptions
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={() => setCreateDialog(true)}
              >
                New Prescription
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Medication color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardStats.total_prescriptions || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Prescriptions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalHospital color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardStats.active_prescriptions || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Active Prescriptions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardStats.urgent_prescriptions || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Urgent Prescriptions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Notifications color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" component="div">
                      {dashboardStats.pending_refills || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Pending Refills
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Tabs
                value={mainTabValue}
                onChange={(e, newValue) => setMainTabValue(newValue)}
              >
                <Tab label="Recent" />
                <Tab 
                  label={
                    <Badge badgeContent={dashboardStats.active_prescriptions} color="success">
                      Active
                    </Badge>
                  } 
                />
                <Tab 
                  label={
                    <Badge badgeContent={dashboardStats.urgent_prescriptions} color="error">
                      Urgent
                    </Badge>
                  } 
                />
                <Tab label="Expiring Soon" />
              </Tabs>
              
              <TextField
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ minWidth: 300 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Prescriptions Table */}
        {loading ? (
          <LinearProgress />
        ) : (
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Prescription ID</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Medication</TableCell>
                    <TableCell>Dosage & Frequency</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredPrescriptions().map((prescription) => (
                    <TableRow key={prescription.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {prescription.prescription_id}
                        </Typography>
                        {prescription.is_urgent && (
                          <Chip 
                            label="URGENT" 
                            color="error" 
                            size="small" 
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {prescription.patient?.user?.first_name} {prescription.patient?.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Age: {prescription.patient?.age || 'N/A'} • {prescription.patient?.gender || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {prescription.medication?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prescription.medication?.strength}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {prescription.dosage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {prescription.frequency_display}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={prescription.status}
                          color={
                            prescription.status === 'active' ? 'success' :
                            prescription.status === 'completed' ? 'info' :
                            prescription.status === 'cancelled' ? 'error' :
                            prescription.status === 'expired' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                        {prescription.days_remaining !== null && prescription.days_remaining <= 7 && (
                          <Typography variant="caption" color="warning.main" display="block">
                            {prescription.days_remaining} days left
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(prescription.prescribed_date), 'MMM dd, yyyy')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewPrescription(prescription)}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPrescription(prescription.id)}
                            >
                              <Download />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {getFilteredPrescriptions().length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Medication sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No prescriptions found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Create your first prescription to get started'}
                </Typography>
              </Box>
            )}
          </Card>
        )}

        {/* Create Prescription Dialog */}
        <Dialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Create New Prescription
            {selectedPatient && (
              <Typography variant="subtitle2" color="text.secondary">
                Patient: {selectedPatient.user?.first_name} {selectedPatient.user?.last_name}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent dividers>
            <Tabs
              value={prescriptionTabValue}
              onChange={(e, newValue) => setPrescriptionTabValue(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Patient Information" icon={<Person />} />
              <Tab label="Medication Details" icon={<Medication />} />
              <Tab label="Lab Test Request" icon={<LocalHospital />} />
            </Tabs>

            {/* Tab 0: Patient Information */}
            {prescriptionTabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Select Patient
                  </Typography>
                  <Autocomplete
                    options={patients}
                    getOptionLabel={(option) => 
                      `${option.user?.first_name || ''} ${option.user?.last_name || ''} (ID: ${option.id})`
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Search and Select Patient" fullWidth required />
                    )}
                    value={selectedPatient}
                    onChange={(event, value) => {
                      handlePatientSelect(value);
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <Typography variant="body1">
                            {option.user?.first_name} {option.user?.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {option.id} • Age: {option.age || 'N/A'} • {option.gender || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  />
                </Grid>

                {selectedPatient && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Patient Details
                      </Typography>
                      <Card variant="outlined">
                        <CardContent>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                Personal Information
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Full Name:</Typography>
                                  <Typography variant="body2">
                                    {selectedPatient.user?.first_name} {selectedPatient.user?.last_name}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Age:</Typography>
                                  <Typography variant="body2">{selectedPatient.age || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Gender:</Typography>
                                  <Typography variant="body2">{selectedPatient.gender || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Blood Group:</Typography>
                                  <Typography variant="body2">{selectedPatient.blood_group || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Date of Birth:</Typography>
                                  <Typography variant="body2">
                                    {selectedPatient.date_of_birth ? 
                                      format(new Date(selectedPatient.date_of_birth), 'MMM dd, yyyy') : 'N/A'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" gutterBottom>
                                Contact Information
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                                  <Typography variant="body2">{selectedPatient.user?.phone_number || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                                  <Typography variant="body2">{selectedPatient.user?.email || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Address:</Typography>
                                  <Typography variant="body2">{selectedPatient.address || 'N/A'}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography variant="body2" color="text.secondary">Emergency Contact:</Typography>
                                  <Typography variant="body2">{selectedPatient.emergency_contact || 'N/A'}</Typography>
                                </Box>
                              </Box>
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="h6" gutterBottom>
                                Medical Information
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Height:</Typography>
                                    <Typography variant="body2">{selectedPatient.height || 'N/A'}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Weight:</Typography>
                                    <Typography variant="body2">{selectedPatient.weight || 'N/A'}</Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">BMI:</Typography>
                                    <Typography variant="body2">{selectedPatient.bmi || 'N/A'}</Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                              
                              {selectedPatient.allergies && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>Known Allergies:</Typography>
                                  <Typography variant="body2">{selectedPatient.allergies}</Typography>
                                </Box>
                              )}
                              
                              {selectedPatient.medical_history && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2" color="text.secondary" gutterBottom>Medical History:</Typography>
                                  <Typography variant="body2">{selectedPatient.medical_history}</Typography>
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Related Appointments */}
                    {appointments.filter(apt => apt.patient?.id === selectedPatient.id).length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                          Related Appointments
                        </Typography>
                        <FormControl fullWidth>
                          <InputLabel>Select Related Appointment (Optional)</InputLabel>
                          <Select
                            value={prescriptionForm.appointment_id}
                            onChange={(e) => handleFormChange('appointment_id', e.target.value)}
                            label="Select Related Appointment (Optional)"
                          >
                            <MenuItem value="">
                              <em>No specific appointment</em>
                            </MenuItem>
                            {appointments
                              .filter(apt => apt.patient?.id === selectedPatient.id)
                              .map((appointment) => (
                                <MenuItem key={appointment.id} value={appointment.id}>
                                  {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')} - {appointment.appointment_time}
                                  {appointment.reason && ` (${appointment.reason})`}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => setPrescriptionTabValue(1)}
                          disabled={!selectedPatient}
                        >
                          Next: Medication Details
                        </Button>
                      </Box>
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {/* Tab 1: Medication Details */}
            {prescriptionTabValue === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Medication Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={medications}
                    getOptionLabel={(option) => `${option.name} ${option.strength || ''}`}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Medication" required />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <Typography variant="body1">{option.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.strength} • {option.form} • {option.manufacturer}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    onChange={(event, value) => {
                      handleFormChange('medication_id', value?.id || '');
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    value={prescriptionForm.dosage}
                    onChange={(e) => handleFormChange('dosage', e.target.value)}
                    required
                    placeholder="e.g., 1 tablet, 5ml, 250mg"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">per dose</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={prescriptionForm.frequency}
                      onChange={(e) => handleFormChange('frequency', e.target.value)}
                      label="Frequency"
                    >
                      {frequencyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {prescriptionForm.frequency === 'custom' && (
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Custom Frequency"
                      value={prescriptionForm.custom_frequency}
                      onChange={(e) => handleFormChange('custom_frequency', e.target.value)}
                      required
                      placeholder="e.g., Every 4 hours as needed"
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration"
                    value={prescriptionForm.duration}
                    onChange={(e) => handleFormChange('duration', e.target.value)}
                    required
                    placeholder="e.g., 7 days, 2 weeks, 1 month"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Duration (Days)"
                    type="number"
                    value={prescriptionForm.duration_days}
                    onChange={(e) => handleFormChange('duration_days', e.target.value)}
                    placeholder="Number of days"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">days</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Instructions for Patient"
                    value={prescriptionForm.instructions}
                    onChange={(e) => handleFormChange('instructions', e.target.value)}
                    placeholder="e.g., Take with food, Avoid alcohol, Take on empty stomach"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Doctor's Notes"
                    value={prescriptionForm.notes}
                    onChange={(e) => handleFormChange('notes', e.target.value)}
                    placeholder="Additional notes for patient or pharmacy"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Additional Options
                  </Typography>
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="Start Date"
                    value={prescriptionForm.start_date}
                    onChange={(date) => handleFormChange('start_date', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <DatePicker
                    label="End Date (Auto-calculated)"
                    value={prescriptionForm.end_date}
                    onChange={(date) => handleFormChange('end_date', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Refills Allowed"
                    type="number"
                    value={prescriptionForm.refills_allowed}
                    onChange={(e) => handleFormChange('refills_allowed', parseInt(e.target.value) || 0)}
                    inputProps={{ min: 0, max: 12 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionForm.is_urgent}
                        onChange={(e) => handleFormChange('is_urgent', e.target.checked)}
                      />
                    }
                    label="Mark as Urgent Prescription"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pharmacy Notes"
                    value={prescriptionForm.pharmacy_notes}
                    onChange={(e) => handleFormChange('pharmacy_notes', e.target.value)}
                    placeholder="Special instructions for pharmacy (e.g., Brand substitution not allowed)"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setPrescriptionTabValue(0)}
                    >
                      Back: Patient Info
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setPrescriptionTabValue(2)}
                      disabled={!prescriptionForm.medication_id || !prescriptionForm.dosage || !prescriptionForm.duration}
                    >
                      Next: Lab Tests
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Tab 2: Lab Test Request */}
            {prescriptionTabValue === 2 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Laboratory Test Request
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Request laboratory tests related to this prescription for monitoring or diagnosis.
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={prescriptionForm.request_lab_tests}
                        onChange={(e) => handleFormChange('request_lab_tests', e.target.checked)}
                      />
                    }
                    label="Request laboratory tests for this prescription"
                  />
                </Grid>

                {prescriptionForm.request_lab_tests && (
                  <>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Test Priority</InputLabel>
                        <Select
                          value={prescriptionForm.lab_test_priority || 'normal'}
                          onChange={(e) => handleFormChange('lab_test_priority', e.target.value)}
                          label="Test Priority"
                        >
                          <MenuItem value="routine">Routine</MenuItem>
                          <MenuItem value="normal">Normal</MenuItem>
                          <MenuItem value="urgent">Urgent</MenuItem>
                          <MenuItem value="stat">STAT (Immediate)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Test Category</InputLabel>
                        <Select
                          value={prescriptionForm.lab_test_category || 'general'}
                          onChange={(e) => handleFormChange('lab_test_category', e.target.value)}
                          label="Test Category"
                        >
                          <MenuItem value="general">General Tests</MenuItem>
                          <MenuItem value="blood">Blood Tests</MenuItem>
                          <MenuItem value="urine">Urine Tests</MenuItem>
                          <MenuItem value="cardiac">Cardiac Markers</MenuItem>
                          <MenuItem value="liver">Liver Function</MenuItem>
                          <MenuItem value="kidney">Kidney Function</MenuItem>
                          <MenuItem value="thyroid">Thyroid Function</MenuItem>
                          <MenuItem value="diabetes">Diabetes Monitoring</MenuItem>
                          <MenuItem value="lipid">Lipid Profile</MenuItem>
                          <MenuItem value="infection">Infection Markers</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Specific Tests Required"
                        value={prescriptionForm.lab_tests_notes}
                        onChange={(e) => handleFormChange('lab_tests_notes', e.target.value)}
                        placeholder="Specify required lab tests (e.g., Complete Blood Count, Liver Function Tests, HbA1c, Lipid Profile)"
                        required={prescriptionForm.request_lab_tests}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Clinical Indication"
                        value={prescriptionForm.lab_clinical_indication || ''}
                        onChange={(e) => handleFormChange('lab_clinical_indication', e.target.value)}
                        placeholder="Clinical reason for requesting these tests (e.g., Monitor drug levels, Check for side effects, Baseline before treatment)"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Preferred Test Date"
                        value={prescriptionForm.lab_preferred_date || null}
                        onChange={(date) => handleFormChange('lab_preferred_date', date)}
                        renderInput={(params) => <TextField {...params} fullWidth />}
                        minDate={new Date()}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={prescriptionForm.lab_fasting_required || false}
                            onChange={(e) => handleFormChange('lab_fasting_required', e.target.checked)}
                          />
                        }
                        label="Fasting required for tests"
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={laboratorists || []}
                        getOptionLabel={(option) => 
                          `${option.first_name || ''} ${option.last_name || ''} (${option.email || ''})`
                        }
                        value={selectedLaboratorist}
                        onChange={(event, newValue) => {
                          setSelectedLaboratorist(newValue);
                          handleFormChange('lab_laboratorist_id', newValue?.id || '');
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Assign Laboratorist (Optional)"
                            placeholder="Search by name or email..."
                          />
                        )}
                        renderOption={(props, option) => (
                          <Box component="li" {...props}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                              <Typography variant="body1">
                                {option.first_name} {option.last_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.email} • {option.specialization || 'General Lab'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Note:</strong> Lab test requests will be automatically created when you submit this prescription. 
                          The patient will be notified about the required tests and can schedule them accordingly.
                        </Typography>
                      </Alert>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setPrescriptionTabValue(1)}
                    >
                      Back: Medication Details
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmitPrescription}
                      disabled={!selectedPatient || !prescriptionForm.medication_id || 
                               !prescriptionForm.dosage || !prescriptionForm.duration ||
                               (prescriptionForm.request_lab_tests && !prescriptionForm.lab_tests_notes)}
                      startIcon={<Save />}
                      size="large"
                    >
                      Create Prescription
                      {prescriptionForm.request_lab_tests && ' & Lab Request'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
        </Dialog>
        {/* View Prescription Dialog */}
        <Dialog
          open={viewDialog}
          onClose={() => setViewDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Prescription Details
            {selectedPrescription && (
              <Typography variant="subtitle2" color="text.secondary">
                ID: {selectedPrescription.prescription_id}
              </Typography>
            )}
          </DialogTitle>
          <DialogContent dividers>
            {selectedPrescription && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Patient Information</Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body1" gutterBottom>
                        <strong>{selectedPrescription.patient?.user?.first_name} {selectedPrescription.patient?.user?.last_name}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Age: {selectedPrescription.patient?.age || 'N/A'} • Gender: {selectedPrescription.patient?.gender || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Blood Group: {selectedPrescription.patient?.blood_group || 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>Prescription Info</Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Prescribed Date</Typography>
                      <Typography variant="body1" gutterBottom>
                        {format(new Date(selectedPrescription.prescribed_date), 'MMMM dd, yyyy')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedPrescription.status} 
                        color={
                          selectedPrescription.status === 'active' ? 'success' :
                          selectedPrescription.status === 'completed' ? 'info' :
                          selectedPrescription.status === 'cancelled' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Medication Details</Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {selectedPrescription.medication?.name}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Dosage</Typography>
                          <Typography variant="body1">{selectedPrescription.dosage}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Frequency</Typography>
                          <Typography variant="body1">{selectedPrescription.frequency_display}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Duration</Typography>
                          <Typography variant="body1">{selectedPrescription.duration}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="body2" color="text.secondary">Refills</Typography>
                          <Typography variant="body1">
                            {selectedPrescription.refills_remaining}/{selectedPrescription.refills_allowed}
                          </Typography>
                        </Grid>
                      </Grid>
                      
                      {selectedPrescription.instructions && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">Instructions</Typography>
                          <Typography variant="body1">{selectedPrescription.instructions}</Typography>
                        </Box>
                      )}
                      
                      {selectedPrescription.notes && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">Doctor's Notes</Typography>
                          <Typography variant="body1">{selectedPrescription.notes}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {selectedPrescription.days_remaining !== null && (
                  <Grid item xs={12}>
                    <Alert 
                      severity={selectedPrescription.days_remaining <= 7 ? 'warning' : 'info'}
                      icon={<Schedule />}
                    >
                      {selectedPrescription.days_remaining > 0 
                        ? `${selectedPrescription.days_remaining} days remaining`
                        : 'Prescription has expired'
                      }
                    </Alert>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialog(false)}>
              Close
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => selectedPrescription && handleDownloadPrescription(selectedPrescription.id)}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default WritePrescriptions;