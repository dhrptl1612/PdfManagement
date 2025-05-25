import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Container, Paper, Box, Typography,
  CircularProgress, Alert, Button
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const SharedPDFViewer = () => {
  const { fileId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfFound, setPdfFound] = useState(false);
  
  const pdfUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/pdf/view/${fileId}`;
  
  const handleIframeLoad = () => {
    setLoading(false);
    setPdfFound(true);
  };
  
  const handleIframeError = () => {
    setError("Failed to load PDF. The file may have been deleted or you don't have permission to view it.");
    setLoading(false);
  };

  useEffect(() => {
    const checkPdfExists = async () => {
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        if (!response.ok) {
          handleIframeError();
        }
      } catch (err) {
        handleIframeError();
      }
    };
    
    checkPdfExists();
  }, [pdfUrl]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Shared PDF Viewer</Typography>
          <Button 
            component={Link} 
            to="/" 
            startIcon={<HomeIcon />}
            variant="contained"
          >
            Go to Home
          </Button>
        </Box>
      </Paper>
      
      <Paper sx={{ p: 2, minHeight: '80vh', position: 'relative' }}>
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
          <Box sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            width: '80%'
          }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              If you believe this is an error, please contact the person who shared this link with you.
            </Typography>
          </Box>
        )}
        
        <Box sx={{ height: '100%', width: '100%', minHeight: '80vh' }}>
          <iframe 
            src={pdfUrl}
            title="PDF Viewer"
            style={{ 
              width: '100%', 
              height: '100%',
              border: 'none',
              display: (!pdfFound && (loading || error)) ? 'none' : 'block',
              minHeight: '80vh'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default SharedPDFViewer;