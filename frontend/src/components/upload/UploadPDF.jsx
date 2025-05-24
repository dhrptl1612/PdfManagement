// src/components/upload/UploadPDF.jsx
import React, { useState } from 'react';
import pdfService from '../../services/pdfService';
import {
  Box, Typography, Button, Paper, 
  LinearProgress, Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const UploadPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      await pdfService.uploadPDF(selectedFile);
      setSuccess(`${selectedFile.name} uploaded successfully`);
      setSelectedFile(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      <input 
        type="file"
        accept=".pdf"
        id="pdf-upload-input"
        hidden
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      <label htmlFor="pdf-upload-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          sx={{ mb: 3 }}
          disabled={uploading}
        >
          Select PDF File
        </Button>
      </label>

      
      <br />
      {selectedFile && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 3, justifyContent: 'center' }}>
          <PictureAsPdfIcon color="primary" sx={{ mr: 1 }} />
          <Typography>{selectedFile.name}</Typography>
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        sx={{ mt: 2 }}
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </Button>

      {uploading && (
        <Box sx={{ width: '100%', mt: 3 }}>
          <LinearProgress />
        </Box>
      )}
    </Paper>
  );
};

export default UploadPDF;