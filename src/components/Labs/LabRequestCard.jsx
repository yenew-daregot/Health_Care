import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Divider
} from '@mui/material';
import {
  Visibility,
  Download,
  Upload,
  CheckCircle,
  Warning,
  Science
} from '@mui/icons-material';

const LabRequestCard = ({ 
  request, 
  onView, 
  onDownload, 
  onUploadResult, 
  showActions = true,
  userRole = 'patient' 
}) => {
  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'requested': 'warning',
      'assigned': 'info',
      'sample_collected': 'primary',
      'in_progress': 'secondary',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'success',
      'normal': 'primary',
      'high': 'warning',
      'urgent': 'error'
    };
    return colors[priority] || 'default';
  };

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          {/* Test Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Science color="primary" />
              <Typography variant="h6" component="div">
                {request.test?.name}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {request.test?.category || 'General'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Requested: {new Date(request.requested_date).toLocaleDateString()}
            </Typography>
          </Grid>

          {/* Patient/Doctor Info */}
          <Grid item xs={12} md={3}>
            {userRole === 'doctor' || userRole === 'laboratorist' ? (
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  Patient: {request.patient?.user?.first_name} {request.patient?.user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ID: {request.patient?.id}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  Dr. {request.doctor?.user?.first_name} {request.doctor?.user?.last_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.doctor?.specialization || 'General Practitioner'}
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Status and Priority */}
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Chip
                label={request.status_display}
                color={getStatusColor(request.status)}
                size="small"
              />
              <Chip
                label={request.priority_display}
                color={getPriorityColor(request.priority)}
                size="small"
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Result Status */}
          <Grid item xs={12} md={2}>
            {request.result ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2" color="success.main">
                  Result Available
                </Typography>
                {request.result.is_abnormal && (
                  <Chip
                    label="Abnormal"
                    color="error"
                    size="small"
                    icon={<Warning />}
                  />
                )}
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" fontSize="small" />
                <Typography variant="body2" color="warning.main">
                  Pending
                </Typography>
              </Box>
            )}
          </Grid>

          {/* Actions */}
          {showActions && (
            <Grid item xs={12} md={1}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="View Details">
                  <IconButton size="small" onClick={() => onView(request)}>
                    <Visibility />
                  </IconButton>
                </Tooltip>
                
                {request.result?.result_document && (
                  <Tooltip title="Download Result">
                    <IconButton 
                      size="small" 
                      color="success"
                      onClick={() => onDownload(request)}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                )}
                
                {userRole === 'laboratorist' && !request.result && request.status === 'in_progress' && (
                  <Tooltip title="Upload Result">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => onUploadResult(request)}
                    >
                      <Upload />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Additional Details */}
        {(request.clinical_notes || request.lab_notes) && (
          <>
            <Divider sx={{ my: 2 }} />
            {request.clinical_notes && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Clinical Notes:
                </Typography>
                <Typography variant="body2">
                  {request.clinical_notes}
                </Typography>
              </Box>
            )}
            {request.lab_notes && (
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Lab Notes:
                </Typography>
                <Typography variant="body2">
                  {request.lab_notes}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Laboratorist Info */}
        {request.laboratorist && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Assigned to: {request.laboratorist.first_name} {request.laboratorist.last_name}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LabRequestCard;