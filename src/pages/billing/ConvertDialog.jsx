import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Alert, List, ListItem,
         ListItemText, ListItemIcon, Divider, Chip
} from '@mui/material';
import {
  Warning as WarningIcon,
  Receipt as ReceiptIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const ConvertDialog = ({ 
  open, 
  invoiceId, 
  onClose, 
  onConvertToDebt,
  invoices
}) => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (invoiceId && invoices) {
      const foundInvoice = invoices.find(i => i.id === invoiceId);
      setInvoice(foundInvoice);
    }
  }, [invoiceId, invoices]);

  const handleConvert = async () => {
    if (!invoice) return;
    
    setLoading(true);
    
    try {
      await onConvertToDebt(invoiceId);
      handleClose();
    } catch (error) {
      console.error('Error converting invoice to debt:', error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setInvoice(null);
    setLoading(false);
    onClose();
  };

  if (!invoice) return null;

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6">
            Convert Invoice to Debt
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Are you sure you want to convert this invoice to a student debt?
          </Typography>
          <Typography variant="body2">
            This action will create a new debt record from the invoice's outstanding balance.
            The invoice status will be updated accordingly.
          </Typography>
        </Alert>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Invoice Details
          </Typography>
          
          <List dense>
            <ListItem>
              <ListItemIcon>
                <ReceiptIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Invoice Number" 
                secondary={invoice.invoice_number || 'N/A'}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Student" 
                secondary={invoice.student?.user?.full_name || 'Unknown Student'}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <CalendarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Due Date" 
                secondary={formatDate(invoice.due_date)}
              />
            </ListItem>
            
            <Divider component="li" sx={{ my: 1 }} />
            
            <ListItem>
              <ListItemIcon>
                <MoneyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Total Amount" 
                secondary={
                  <Typography variant="body2">
                    {formatCurrency(invoice.total_amount)}
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <MoneyIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary="Amount Paid" 
                secondary={
                  <Typography variant="body2" color="success.main">
                    {formatCurrency(invoice.amount_paid)}
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <MoneyIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Balance Due" 
                secondary={
                  <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(invoice.balance_due)}
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </Box>
        
        <Box sx={{ 
          bgcolor: 'error.light', 
          p: 2, 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'error.main'
        }}>
          <Typography variant="subtitle2" gutterBottom color="error.main">
            Important Notes:
          </Typography>
          
          <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
            • This action cannot be undone
          </Typography>
          
          <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
            • A new debt record will be created with reference to this invoice
          </Typography>
          
          <Typography variant="body2" color="error.main" sx={{ mb: 1 }}>
            • The invoice will be marked as "converted to debt"
          </Typography>
          
          <Typography variant="body2" color="error.main">
            • Future payments should be recorded against the new debt
          </Typography>
        </Box>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip 
            label={`Student ID: ${invoice.student?.student_id || 'N/A'}`}
            size="small"
            variant="outlined"
          />
          <Chip 
            label={`Academic Year: ${invoice.academic_year || 'N/A'}`}
            size="small"
            variant="outlined"
          />
          <Chip 
            label={`Status: ${invoice.status || 'N/A'}`}
            size="small"
            color={invoice.status === 'overdue' ? 'error' : 'default'}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleConvert} 
          variant="contained" 
          color="warning"
          disabled={loading || !invoice || invoice.balance_due <= 0}
          startIcon={<WarningIcon />}
        >
          {loading ? 'Converting...' : 'Convert to Debt'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertDialog;