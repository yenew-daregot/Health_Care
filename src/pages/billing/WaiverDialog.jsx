import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel,
         Select, MenuItem, Typography, Box, Alert, Divider, RadioGroup, FormControlLabel, Radio, Slider, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const WaiverDialog = ({ 
  open, 
  studentId, 
  onClose, 
  onRequestWaiver,
  students,
  debts,
  invoices
}) => {
  const [formData, setFormData] = useState({
    student: studentId || '',
    requested_amount: '',
    approved_amount: '',
    reason: '',
    waiver_type: 'partial',
    status: 'pending',
    request_date: new Date(),
    academic_year: '',
    supporting_documents: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDebts, setSelectedDebts] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [waiverPercentage, setWaiverPercentage] = useState(0);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Get current academic year
  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${currentYear + 1}`;
  };

  useEffect(() => {
    if (studentId && students) {
      const student = students.find(s => s.id === studentId);
      setSelectedStudent(student);
      setFormData(prev => ({ ...prev, student: studentId }));
      
      // Calculate total outstanding for this student
      const studentDebts = debts?.filter(d => d.student?.id === studentId) || [];
      const studentInvoices = invoices?.filter(i => i.student?.id === studentId && i.balance_due > 0) || [];
      
      const debtsTotal = studentDebts.reduce((sum, debt) => sum + (debt.outstanding_balance || 0), 0);
      const invoicesTotal = studentInvoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
      const total = debtsTotal + invoicesTotal;
      
      setTotalOutstanding(total);
      setSelectedDebts(studentDebts);
      setSelectedInvoices(studentInvoices);
      
      // Set academic year to current
      setFormData(prev => ({ ...prev, academic_year: getCurrentAcademicYear() }));
    }
  }, [studentId, students, debts, invoices]);

  useEffect(() => {
    if (formData.waiver_type === 'percentage') {
      const amount = (totalOutstanding * waiverPercentage) / 100;
      setFormData(prev => ({ ...prev, requested_amount: amount.toFixed(2) }));
    }
  }, [waiverPercentage, totalOutstanding, formData.waiver_type]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleStudentChange = (studentId) => {
    const student = students?.find(s => s.id === studentId);
    setSelectedStudent(student);
    setFormData(prev => ({ ...prev, student: studentId }));
    
    // Recalculate outstanding for selected student
    const studentDebts = debts?.filter(d => d.student?.id === studentId) || [];
    const studentInvoices = invoices?.filter(i => i.student?.id === studentId && i.balance_due > 0) || [];
    
    const debtsTotal = studentDebts.reduce((sum, debt) => sum + (debt.outstanding_balance || 0), 0);
    const invoicesTotal = studentInvoices.reduce((sum, inv) => sum + (inv.balance_due || 0), 0);
    const total = debtsTotal + invoicesTotal;
    
    setTotalOutstanding(total);
    setSelectedDebts(studentDebts);
    setSelectedInvoices(studentInvoices);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.requested_amount || formData.requested_amount <= 0) {
      newErrors.requested_amount = 'Requested amount must be greater than 0';
    } else if (parseFloat(formData.requested_amount) > totalOutstanding) {
      newErrors.requested_amount = `Requested amount cannot exceed total outstanding (${formatCurrency(totalOutstanding)})`;
    }
    if (!formData.reason) newErrors.reason = 'Reason is required';
    if (!formData.academic_year) newErrors.academic_year = 'Academic year is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const waiverData = {
        ...formData,
        requested_amount: parseFloat(formData.requested_amount),
        approved_amount: formData.approved_amount ? parseFloat(formData.approved_amount) : null,
        related_debts: selectedDebts.map(d => d.id),
        related_invoices: selectedInvoices.map(i => i.id)
      };
      
      await onRequestWaiver(waiverData);
      handleClose();
    } catch (error) {
      console.error('Error requesting waiver:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      student: studentId || '',
      requested_amount: '',
      approved_amount: '',
      reason: '',
      waiver_type: 'partial',
      status: 'pending',
      request_date: new Date(),
      academic_year: '',
      supporting_documents: ''
    });
    setErrors({});
    setSelectedStudent(null);
    setSelectedDebts([]);
    setSelectedInvoices([]);
    setTotalOutstanding(0);
    setWaiverPercentage(0);
    onClose();
  };

  const waiverTypes = [
    { value: 'full', label: 'Full Waiver', description: 'Complete waiver of all outstanding amounts' },
    { value: 'partial', label: 'Partial Waiver', description: 'Waiver of a specific amount' },
    { value: 'percentage', label: 'Percentage Waiver', description: 'Waiver of a percentage of outstanding' },
    { value: 'hardship', label: 'Financial Hardship', description: 'Based on financial circumstances' },
    { value: 'merit', label: 'Merit-based', description: 'Based on academic or other achievements' },
    { value: 'other', label: 'Other', description: 'Other reasons' }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Request Fee Waiver
          </Typography>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Submit a fee waiver request for a student. All fields marked with * are required.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.student}>
                  <InputLabel>Student *</InputLabel>
                  <Select
                    value={formData.student}
                    label="Student *"
                    onChange={(e) => handleStudentChange(e.target.value)}
                    disabled={!!studentId}
                  >
                    <MenuItem value="">Select Student</MenuItem>
                    {students?.map((student) => (
                      <MenuItem key={student.id} value={student.id}>
                        {student.user?.full_name || student.username} ({student.student_id})
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.student && (
                    <Typography variant="caption" color="error">
                      {errors.student}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              {selectedStudent && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      <Typography variant="subtitle2">
                        Total Outstanding for {selectedStudent.user?.full_name}: 
                        <Typography component="span" sx={{ fontWeight: 700, ml: 1 }}>
                          {formatCurrency(totalOutstanding)}
                        </Typography>
                      </Typography>
                    </Alert>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Waiver Type *</InputLabel>
                      <Select
                        value={formData.waiver_type}
                        label="Waiver Type *"
                        onChange={(e) => handleFormChange('waiver_type', e.target.value)}
                      >
                        {waiverTypes.map(type => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                            <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                              ({type.description})
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {formData.waiver_type === 'percentage' && (
                    <Grid item xs={12}>
                      <Box sx={{ px: 2 }}>
                        <Typography gutterBottom>
                          Waiver Percentage: {waiverPercentage}%
                        </Typography>
                        <Slider
                          value={waiverPercentage}
                          onChange={(e, value) => setWaiverPercentage(value)}
                          valueLabelDisplay="auto"
                          step={5}
                          marks
                          min={0}
                          max={100}
                          valueLabelFormat={(value) => `${value}%`}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Amount: {formatCurrency((totalOutstanding * waiverPercentage) / 100)}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Requested Amount *"
                      value={formData.requested_amount}
                      onChange={(e) => handleFormChange('requested_amount', e.target.value)}
                      error={!!errors.requested_amount}
                      helperText={errors.requested_amount}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                      disabled={formData.waiver_type === 'percentage'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Approved Amount (if known)"
                      value={formData.approved_amount}
                      onChange={(e) => handleFormChange('approved_amount', e.target.value)}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                      helperText="Leave empty if unknown"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Request Date"
                      value={formData.request_date}
                      onChange={(date) => handleFormChange('request_date', date)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Academic Year *"
                      value={formData.academic_year}
                      onChange={(e) => handleFormChange('academic_year', e.target.value)}
                      error={!!errors.academic_year}
                      helperText={errors.academic_year || `Current: ${getCurrentAcademicYear()}`}
                      placeholder={getCurrentAcademicYear()}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Reason for Waiver *"
                      value={formData.reason}
                      onChange={(e) => handleFormChange('reason', e.target.value)}
                      error={!!errors.reason}
                      helperText={errors.reason || 'Provide detailed reason for the waiver request'}
                      placeholder="Explain why the fee waiver is being requested..."
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Supporting Documents"
                      value={formData.supporting_documents}
                      onChange={(e) => handleFormChange('supporting_documents', e.target.value)}
                      placeholder="List any supporting documents or references"
                      helperText="e.g., Financial statements, recommendation letters, etc."
                    />
                  </Grid>
                  
                  {/* Selected Debts and Invoices */}
                  {(selectedDebts.length > 0 || selectedInvoices.length > 0) && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Related Outstanding Items:
                        </Typography>
                        
                        {selectedDebts.length > 0 && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Debts:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {selectedDebts.map(debt => (
                                <Chip
                                  key={debt.id}
                                  label={`Debt #${debt.debt_number}: ${formatCurrency(debt.outstanding_balance)}`}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {selectedInvoices.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Invoices:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {selectedInvoices.map(invoice => (
                                <Chip
                                  key={invoice.id}
                                  label={`Invoice #${invoice.invoice_number}: ${formatCurrency(invoice.balance_due)}`}
                                  size="small"
                                  color="warning"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )}
                  
                  {/* Status (for admin use) */}
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <Typography variant="subtitle2" gutterBottom>
                        Waiver Status
                      </Typography>
                      <RadioGroup
                        row
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                      >
                        <FormControlLabel 
                          value="pending" 
                          control={<Radio size="small" />} 
                          label="Pending" 
                        />
                        <FormControlLabel 
                          value="under_review" 
                          control={<Radio size="small" />} 
                          label="Under Review" 
                        />
                        <FormControlLabel 
                          value="approved" 
                          control={<Radio size="small" />} 
                          label="Approved" 
                        />
                        <FormControlLabel 
                          value="rejected" 
                          control={<Radio size="small" />} 
                          label="Rejected" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          
          {/* Summary */}
          {selectedStudent && (
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2">Student:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedStudent.user?.full_name}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">Total Outstanding:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2" color="warning.main">
                    {formatCurrency(totalOutstanding)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">Requested Waiver:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2" color="primary">
                    {formatCurrency(formData.requested_amount || 0)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2">Remaining After Waiver:</Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                  <Typography variant="body2">
                    {formatCurrency(totalOutstanding - (parseFloat(formData.requested_amount) || 0))}
                  </Typography>
                </Grid>
                
                {formData.approved_amount && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Approved Amount:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                        {formatCurrency(parseFloat(formData.approved_amount))}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading || !selectedStudent}
          >
            {loading ? 'Submitting...' : 'Submit Waiver Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default WaiverDialog;