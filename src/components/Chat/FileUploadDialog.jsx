import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  CloudUpload,
  Close,
  AttachFile,
  Image,
  Description,
  AudioFile
} from '@mui/icons-material';

const FileUploadDialog = ({ open, onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      
      // Determine message type based on file type
      let messageType = 'file';
      if (selectedFile.type.startsWith('image/')) {
        messageType = 'image';
      } else if (selectedFile.type.startsWith('audio/')) {
        messageType = 'audio';
      }
      
      await onUpload(selectedFile, messageType);
      
      // Reset state
      setSelectedFile(null);
      setError(null);
      onClose();
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setError(null);
      onClose();
    }
  };

  const getFileIcon = (file) => {
    if (!file) return <AttachFile />;
    
    if (file.type.startsWith('image/')) {
      return <Image color="primary" />;
    } else if (file.type.startsWith('audio/')) {
      return <AudioFile color="secondary" />;
    } else {
      return <Description color="action" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Upload File
        <IconButton onClick={handleClose} disabled={uploading}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {!selectedFile ? (
          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Choose a file to upload
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click here or drag and drop your file
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Maximum file size: 10MB
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
              {getFileIcon(selectedFile)}
            </Box>
            <Typography variant="h6" gutterBottom>
              {selectedFile.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatFileSize(selectedFile.size)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selectedFile.type || 'Unknown type'}
            </Typography>
            
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Uploading...
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        {selectedFile && (
          <Button onClick={() => setSelectedFile(null)} disabled={uploading}>
            Choose Different File
          </Button>
        )}
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadDialog;