import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';
import {
  Upload,
  Send,
  Close
} from '@mui/icons-material';

const LabResultUploadForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  request,
  loading = false 
}) => {
  const [resultForm, setResultForm] = useState({
    result_text: '',
    result_document: null,
    interpretation: '',
    is_abnormal: false
  });

  const handleSubmit = () => {
    onSubmit(resultForm);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResultForm({ ...resultForm, result_document: file });
    }
  };

  const resetForm = () => {
    setResultForm({
      result_text: '',
      result_document: null,
      interpretation: '',
      is_abnormal: false
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Upload />
          Upload Lab Result
        </Box>
      </DialogTitle>
      <DialogContent>
        {request && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Patient:</strong> {request.patient?.user?.first_name} {request.patient?.user?.last_name}
                <br />
                <strong>Test:</strong> {request.test?.name}
                <br />
                <strong>Normal Range:</strong> {request.test?.normal_range || 'Not specified'}
              </Typography>
            </Alert>
          </Box>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Result Text"
              value={resultForm.result_text}
              onChange={(e) => setResultForm({ ...resultForm, result_text: e.target.value })}
              placeholder="Enter the lab test results, values, and observations..."
              helperText="Provide detailed test results including numerical values, units, and observations"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Clinical Interpretation"
              value={resultForm.interpretation}
              onChange={(e) => setResultForm({ ...resultForm, interpretation: e.target.value })}
              placeholder="Enter clinical interpretation of the results..."
              helperText="Provide professional interpretation and recommendations based on the results"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={resultForm.is_abnormal}
                  onChange={(e) => setResultForm({ ...resultForm, is_abnormal: e.target.checked })}
                />
              }
              label="Mark as abnormal result"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Check this if the result is outside the normal range or requires attention
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 1, 
              p: 3, 
              textAlign: 'center',
              backgroundColor: '#fafafa'
            }}>
              <input
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="result-document-upload"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="result-document-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Upload />}
                  size="large"
                >
                  Upload Result Document
                </Button>
              </label>
              {resultForm.result_document && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="success.main">
                    ✓ Selected: {resultForm.result_document.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Size: {(resultForm.result_document.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                <br />
                Upload scanned reports, images, or digital documents
              </Typography>
            </Box>
          </Grid>

          {!resultForm.result_text && !resultForm.result_document && (
            <Grid item xs={12}>
              <Alert severity="warning">
                Please provide either text results or upload a document (or both) before submitting.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<Send />}
          disabled={loading || (!resultForm.result_text && !resultForm.result_document)}
        >
          {loading ? 'Submitting...' : 'Submit Result'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LabResultUploadForm;