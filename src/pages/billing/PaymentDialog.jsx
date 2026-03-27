import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControl, InputLabel,
         Select, MenuItem, Typography, Box, Alert, Divider, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const PaymentDialog = ({ 
  open, 
  invoiceId, 
  debtId, 
  onClose, 
  onProcessPayment,
  students,
  invoices,
  debts
}) => {
  const [formData, setFormData] = useState({
    payment_method: 'cash',
    amount: '',
    payment_date: new Date(),
    reference_number: '',
    notes: '',
    status: 'completed'
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [maxAmount, setMaxAmount] = useState(0);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  useEffect(() => {
    if (invoiceId && invoices) {
      const invoice = invoices.find(i => i.id === invoiceId);
      setSelectedInvoice(invoice);
      setMaxAmount(invoice?.balance_due || 0);
      setFormData(prev => ({ ...prev, amount: invoice?.balance_due || 0 }));
    } else if (debtId && debts) {
      const debt = debts.find(d => d.id === debtId);
      setSelectedDebt(debt);
      setMaxAmount(debt?.outstanding_balance || 0);
      setFormData(prev => ({ ...prev, amount: debt?.outstanding_balance || 0 }));
    } else {
      setSelectedInvoice(null);
      setSelectedDebt(null);
      setMaxAmount(0);
      setFormData(prev => ({ ...prev, amount: '' }));
    }
  }, [invoiceId, debtId, invoices, debts]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (formData.amount > maxAmount) {
      newErrors.amount = `Amount cannot exceed ${formatCurrency(maxAmount)}`;
    }
    if (!formData.payment_date) newErrors.payment_date = 'Payment date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateReferenceNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `PAY-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        invoice: selectedInvoice?.id || null,
        student_debt: selectedDebt?.id || null,
        reference_number: formData.reference_number || generateReferenceNumber()
      };
      
      await onProcessPayment(paymentData);
      handleClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      payment_method: 'cash',
      amount: '',
      payment_date: new Date(),
      reference_number: '',
      notes: '',
      status: 'completed'
    });
    setErrors({});
    setSelectedInvoice(null);
    setSelectedDebt(null);
    setMaxAmount(0);
    onClose();
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'online', label: 'Online Payment' }
  ];

  const getPaymentSource = () => {
    if (selectedInvoice) return `Invoice #${selectedInvoice.invoice_number}`;
    if (selectedDebt) return `Debt #${selectedDebt.debt_number}`;
    return 'N/A';
  };

  const getStudentName = () => {
    if (selectedInvoice) return selectedInvoice.student?.user?.full_name;
    if (selectedDebt) return selectedDebt.student?.user?.full_name;
    return 'Unknown';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Process Payment
          </Typography>
          {maxAmount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {getPaymentSource()} - Balance: {formatCurrency(maxAmount)}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Record a payment for {selectedInvoice ? 'invoice' : selectedDebt ? 'debt' : 'student'}
            </Alert>
            
            {/* Select Invoice/Debt if none provided */}
            {!invoiceId && !debtId && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Select Invoice or Debt</InputLabel>
                    <Select
                      value={selectedInvoice?.id || selectedDebt?.id || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.startsWith('invoice_')) {
                          const id = parseInt(value.replace('invoice_', ''));
                          const invoice = invoices?.find(i => i.id === id);
                          setSelectedInvoice(invoice);
                          setSelectedDebt(null);
                          setMaxAmount(invoice?.balance_due || 0);
                          setFormData(prev => ({ ...prev, amount: invoice?.balance_due || 0 }));
                        } else if (value.startsWith('debt_')) {
                          const id = parseInt(value.replace('debt_', ''));
                          const debt = debts?.find(d => d.id === id);
                          setSelectedDebt(debt);
                          setSelectedInvoice(null);
                          setMaxAmount(debt?.outstanding_balance || 0);
                          setFormData(prev => ({ ...prev, amount: debt?.outstanding_balance || 0 }));
                        }
                      }}
                      label="Select Invoice or Debt"
                    >
                      <MenuItem value="">Select...</MenuItem>
                      
                      {/* Invoices with outstanding balance */}
                      {invoices?.filter(inv => inv.balance_due > 0).length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
                            Invoices
                          </Typography>
                          {invoices
                            .filter(inv => inv.balance_due > 0)
                            .map(invoice => (
                              <MenuItem key={`invoice_${invoice.id}`} value={`invoice_${invoice.id}`}>
                                Invoice #{invoice.invoice_number} - {invoice.student?.user?.full_name} - 
                                Balance: {formatCurrency(invoice.balance_due)}
                              </MenuItem>
                            ))}
                        </>
                      )}
                      
                      {/* Debts with outstanding balance */}
                      {debts?.filter(debt => debt.outstanding_balance > 0).length > 0 && (
                        <>
                          <Typography variant="subtitle2" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
                            Debts
                          </Typography>
                          {debts
                            .filter(debt => debt.outstanding_balance > 0)
                            .map(debt => (
                              <MenuItem key={`debt_${debt.id}`} value={`debt_${debt.id}`}>
                                Debt #{debt.debt_number} - {debt.student?.user?.full_name} - 
                                Outstanding: {formatCurrency(debt.outstanding_balance)}
                              </MenuItem>
                            ))}
                        </>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
            
            {(selectedInvoice || selectedDebt || invoiceId || debtId) && (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.payment_method}>
                      <InputLabel>Payment Method *</InputLabel>
                      <Select
                        value={formData.payment_method}
                        label="Payment Method *"
                        onChange={(e) => handleFormChange('payment_method', e.target.value)}
                      >
                        {paymentMethods.map(method => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.payment_method && (
                        <Typography variant="caption" color="error">
                          {errors.payment_method}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Amount *"
                      value={formData.amount}
                      onChange={(e) => handleFormChange('amount', parseFloat(e.target.value) || 0)}
                      error={!!errors.amount}
                      helperText={errors.amount || `Maximum: ${formatCurrency(maxAmount)}`}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Payment Date *"
                      value={formData.payment_date}
                      onChange={(date) => handleFormChange('payment_date', date)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          fullWidth 
                          error={!!errors.payment_date}
                          helperText={errors.payment_date}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Reference Number"
                      value={formData.reference_number}
                      onChange={(e) => handleFormChange('reference_number', e.target.value)}
                      placeholder="Auto-generated if left empty"
                      helperText="Transaction ID, check number, or other reference"
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
                      placeholder="Additional payment notes"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl component="fieldset">
                      <Typography variant="subtitle2" gutterBottom>
                        Payment Status
                      </Typography>
                      <RadioGroup
                        row
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                      >
                        <FormControlLabel 
                          value="completed" 
                          control={<Radio size="small" />} 
                          label="Completed" 
                        />
                        <FormControlLabel 
                          value="pending" 
                          control={<Radio size="small" />} 
                          label="Pending" 
                        />
                        <FormControlLabel 
                          value="failed" 
                          control={<Radio size="small" />} 
                          label="Failed" 
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                </Grid>
                
                {/* Summary */}
                <Box sx={{ 
                  bgcolor: 'grey.50', 
                  p: 2, 
                  borderRadius: 1,
                  mt: 3,
                  border: '1px solid',
                  borderColor: 'grey.200'
                }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2">Student:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {getStudentName()}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Outstanding:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body2" color="warning.main">
                        {formatCurrency(maxAmount)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="h6">Payment Amount:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="h6" color="primary">
                        {formatCurrency(formData.amount || 0)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2">Remaining After Payment:</Typography>
                    </Grid>
                    <Grid item xs={6} textAlign="right">
                      <Typography variant="body2">
                        {formatCurrency(maxAmount - (formData.amount || 0))}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
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
            disabled={loading || (!selectedInvoice && !selectedDebt && !invoiceId && !debtId)}
          >
            {loading ? 'Processing...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default PaymentDialog;