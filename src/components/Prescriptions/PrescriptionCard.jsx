import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Avatar,
  Divider
} from '@mui/material';
import {
  Visibility,
  Download,
  Add,
  Warning,
  Schedule,
  Medication,
  Person
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';

const PrescriptionCard = ({ 
  prescription, 
  onView, 
  onDownload, 
  onRefill,
  showPatientInfo = false,
  showDoctorInfo = false 
}) => {
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  // Get urgency indicator
  const getUrgencyLevel = () => {
    if (prescription.is_urgent) {
      return { level: 'urgent', color: 'error', label: 'URGENT' };
    }
    if (prescription.days_remaining !== null && prescription.days_remaining <= 3 && prescription.status === 'active') {
      return { level: 'expiring', color: 'warning', label: 'EXPIRING SOON' };
    }
    if (prescription.days_remaining !== null && prescription.days_remaining <= 7 && prescription.status === 'active') {
      return { level: 'warning', color: 'warning', label: 'EXPIRES SOON' };
    }
    return null;
  };

  const urgency = getUrgencyLevel();

  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
    >
      {urgency && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        >
          <Chip
            label={urgency.label}
            color={urgency.color}
            size="small"
            icon={urgency.level === 'urgent' ? <Warning /> : <Schedule />}
          />
        </Box>
      )}

      <CardContent sx={{ pb: 1 }}>
        {/* Header */}
        <Box sx={{ mb: 2, pr: urgency ? 10 : 0 }}>
          <Typography variant="h6" component="div" noWrap>
            {prescription.medication?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {prescription.prescription_id}
          </Typography>
        </Box>

        {/* Medication Details */}
        <Box sx={{ mb: 2 }}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="body2" color="text.secondary">Dosage & Frequency</Typography>
              <Typography variant="body1">
                {prescription.dosage} - {prescription.frequency_display}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="body1">{prescription.duration}</Typography>
            </Box>
          </Stack>
        </Box>

        {/* Patient/Doctor Info */}
        {showPatientInfo && prescription.patient && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                <Person fontSize="small" />
              </Avatar>
              <Typography variant="body2" color="text.secondary">Patient</Typography>
            </Box>
            <Typography variant="body2">
              {prescription.patient.user?.first_name} {prescription.patient.user?.last_name}
            </Typography>
          </Box>
        )}

        {showDoctorInfo && prescription.doctor && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'secondary.main' }}>
                <Person fontSize="small" />
              </Avatar>
              <Typography variant="body2" color="text.secondary">Prescribed by</Typography>
            </Box>
            <Typography variant="body2">
              Dr. {prescription.doctor.user?.first_name} {prescription.doctor.user?.last_name}
            </Typography>
          </Box>
        )}

        {/* Status and Date */}
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip
              label={prescription.status}
              color={getStatusColor(prescription.status)}
              size="small"
            />
            {prescription.refills_remaining > 0 && (
              <Chip
                label={`${prescription.refills_remaining} refills left`}
                variant="outlined"
                size="small"
                color="primary"
              />
            )}
          </Stack>
          
          <Typography variant="body2" color="text.secondary">
            Prescribed: {format(new Date(prescription.prescribed_date), 'MMM dd, yyyy')}
          </Typography>
          
          {prescription.days_remaining !== null && prescription.status === 'active' && (
            <Typography 
              variant="body2" 
              color={prescription.days_remaining <= 7 ? 'warning.main' : 'text.secondary'}
            >
              {prescription.days_remaining > 0 
                ? `${prescription.days_remaining} days remaining`
                : 'Expired'
              }
            </Typography>
          )}
        </Box>

        {/* Instructions Preview */}
        {prescription.instructions && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Instructions</Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {prescription.instructions}
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onView(prescription)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={() => onDownload(prescription.id)}
            >
              <Download />
            </IconButton>
          </Tooltip>
          
          {prescription.refills_remaining > 0 && prescription.status === 'active' && onRefill && (
            <Tooltip title="Request Refill">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onRefill(prescription)}
              >
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default PrescriptionCard;