import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel,
         Select, MenuItem, Typography, Box, Alert, Divider, IconButton, Table, TableBody, TableCell,
         TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const InvoiceDialog = ({ open, mode, data, onClose, onSave, students, serviceCategories }) => {
  const [formData, setFormData] = useState({
    student: '',
    academic_year: '',
    issue_date: new Date(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: '',
    status: 'draft'
  });
  
  const [items, setItems] = useState([{ service: '', quantity: 1, unit_price: 0, amount: 0, description: '' }]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate] = useState(0.1);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

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
    if (mode === 'edit' && data) {
      setFormData({
        student: data.student?.id || '',
        academic_year: data.academic_year || getCurrentAcademicYear(),
        issue_date: data.issue_date ? new Date(data.issue_date) : new Date(),
        due_date: data.due_date ? new Date(data.due_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: data.notes || '',
        status: data.status || 'draft'
      });
      
      if (data.items && data.items.length > 0) {
        setItems(data.items.map(item => ({
          service: item.service?.id || '',
          description: item.description || item.service?.name || '',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          amount: item.amount || 0
        })));
      }
    } else {
      // Set default academic year for new invoices
      setFormData(prev => ({
        ...prev,
        academic_year: getCurrentAcademicYear()
      }));
    }
  }, [mode, data]);

  useEffect(() => {
    // Calculate totals whenever items change
    const subtotalCalc = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxCalc = subtotalCalc * taxRate;
    const totalCalc = subtotalCalc + taxCalc;
    
    setSubtotal(subtotalCalc);
    setTaxAmount(taxCalc);
    setTotalAmount(totalCalc);
  }, [items, taxRate]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate amount if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unit_price' ? value : newItems[index].unit_price;
      newItems[index].amount = quantity * unitPrice;
    }
    
    // Auto-fill description if service is selected
    if (field === 'service') {
      const selectedService = serviceCategories?.find(s => s.id === value);
      if (selectedService) {
        newItems[index].description = selectedService.name || '';
        newItems[index].unit_price = selectedService.default_price || 0;
        newItems[index].amount = newItems[index].quantity * (selectedService.default_price || 0);
      }
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { service: '', quantity: 1, unit_price: 0, amount: 0, description: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.academic_year) newErrors.academic_year = 'Academic year is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    
    // Validate items
    items.forEach((item, index) => {
      if (!item.service) {
        newErrors[`item_${index}_service`] = 'Service is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.unit_price || item.unit_price <= 0) {
        newErrors[`item_${index}_unit_price`] = 'Unit price must be greater than 0';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const invoiceData = {
        ...formData,
        total_amount: totalAmount,
        items: items.map(item => ({
          service: item.service,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.amount
        }))
      };
      
      await onSave(invoiceData);
      handleClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      student: '',
      academic_year: getCurrentAcademicYear(),
      issue_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: '',
      status: 'draft'
    });
    setItems([{ service: '', quantity: 1, unit_price: 0, amount: 0, description: '' }]);
    setErrors({});
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            {mode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
          </Typography>
          {data?.invoice_number && (
            <Typography variant="body2" color="text.secondary">
              Invoice #: {data.invoice_number}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Fill in the invoice details below. All fields marked with * are required.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.student}>
                  <InputLabel>Student *</InputLabel>
                  <Select
                    value={formData.student}
                    label="Student *"
                    onChange={(e) => handleFormChange('student', e.target.value)}
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
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Academic Year *"
                  value={formData.academic_year}
                  onChange={(e) => handleFormChange('academic_year', e.target.value)}
                  error={!!errors.academic_year}
                  helperText={errors.academic_year}
                  placeholder={getCurrentAcademicYear()}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Issue Date"
                  value={formData.issue_date}
                  onChange={(date) => handleFormChange('issue_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date *"
                  value={formData.due_date}
                  onChange={(date) => handleFormChange('due_date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.due_date}
                      helperText={errors.due_date}
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Additional notes or instructions"
                />
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="subtitle1">Invoice Items</Typography>
          </Divider>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="40%">Service *</TableCell>
                  <TableCell width="20%">Quantity *</TableCell>
                  <TableCell width="20%">Unit Price ($) *</TableCell>
                  <TableCell width="15%">Amount ($)</TableCell>
                  <TableCell width="5%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <FormControl fullWidth error={!!errors[`item_${index}_service`]}>
                        <Select
                          value={item.service}
                          onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="">Select Service</MenuItem>
                          {serviceCategories?.map((service) => (
                            <MenuItem key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.default_price || 0)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                        error={!!errors[`item_${index}_quantity`]}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        error={!!errors[`item_${index}_unit_price`]}
                        size="small"
                        fullWidth
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(item.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
          >
            Add Item
          </Button>
          
          {/* Summary */}
          <Box sx={{ 
            bgcolor: 'grey.50', 
            p: 2, 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">Subtotal:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2">Tax (10%):</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="body2">{formatCurrency(taxAmount)}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="h6">Total Amount:</Typography>
              </Grid>
              <Grid item xs={6} textAlign="right">
                <Typography variant="h6" color="primary">
                  {formatCurrency(totalAmount)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default InvoiceDialog;