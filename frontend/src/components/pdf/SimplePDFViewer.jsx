// src/components/pdf/SimplePDFViewer.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Grid, Paper, Box, 
  CircularProgress, Alert
} from '@mui/material';
import CommentSection from './CommentSection';

const SimplePDFViewer = () => {
  const { fileId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Use the updated endpoint that serves from GridFS
  const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/pdf/view/${fileId}`;
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleIframeError = () => {
    setError("Failed to load PDF. Please check if the file exists.");
    setLoading(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {/* PDF Viewer */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '85vh', position: 'relative' }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)'
              }}>
                <CircularProgress />
              </Box>
            )}
            
            {error && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
            
            <Box sx={{ height: '100%', width: '100%' }}>
              <iframe 
                src={pdfUrl}
                title="PDF Viewer"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  border: 'none',
                  display: loading || error ? 'none' : 'block'
                }}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Comments Section */}
        <Grid item xs={12} md={4}>
          <CommentSection fileId={fileId} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default SimplePDFViewer;