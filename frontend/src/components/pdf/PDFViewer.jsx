import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import CommentSection from './CommentSection';
import { 
  Container, Grid, Paper, Typography, Box, 
  Button, CircularProgress, Alert 
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = () => {
  const { fileId } = useParams();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  
  useEffect(() => {
    const url = `http://localhost:8000/pdf/view/${fileId}`;
    setPdfUrl(url);
    setLoading(false);
  }, [fileId]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const previousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const nextPage = () => {
    setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages || 1));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
            ) : (
              <>
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(error) => setError("Error loading PDF: " + error.message)}
                  loading={<CircularProgress />}
                >
                  <Page 
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={700}
                  />
                </Document>
                
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={previousPage}
                    disabled={pageNumber <= 1}
                    startIcon={<NavigateBeforeIcon />}
                  >
                    Previous
                  </Button>
                  
                  <Typography>
                    Page {pageNumber} of {numPages || '?'}
                  </Typography>
                  
                  <Button 
                    variant="contained"
                    onClick={nextPage}
                    disabled={pageNumber >= numPages || !numPages}
                    endIcon={<NavigateNextIcon />}
                  >
                    Next
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <CommentSection fileId={fileId} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default PDFViewer;