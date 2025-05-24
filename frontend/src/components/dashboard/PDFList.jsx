// src/components/dashboard/PDFList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pdfService from '../../services/pdfService';
import {
  Box, Typography, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, Paper, 
  InputAdornment, TextField, CircularProgress, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import SharePDF from '../share/SharePDF';

const PDFList = () => {
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const navigate = useNavigate();

  // Fetch PDFs on component mount
  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        setLoading(true);
        const response = await pdfService.listPDFs();
        setPdfs(response.data);
        setFilteredPdfs(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load PDFs');
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, []);

  // Filter PDFs based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = pdfs.filter(pdf => 
        pdf.filename.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPdfs(filtered);
    } else {
      setFilteredPdfs(pdfs);
    }
  }, [searchQuery, pdfs]);

  const handleViewPdf = (fileId) => {
    navigate(`/pdf/${fileId}`);
  };

  const handleSharePdf = (pdf) => {
    setSelectedPdf(pdf);
    setShareDialogOpen(true);
  };

  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Search PDFs by name"
        variant="outlined"
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      ) : filteredPdfs.length === 0 ? (
        <Paper sx={{ p: 3, mt: 3, textAlign: 'center' }}>
          <Typography>No PDFs found</Typography>
        </Paper>
      ) : (
        <Paper sx={{ mt: 3 }}>
          <List>
            {filteredPdfs.map((pdf) => (
              <ListItem key={pdf.file_id} divider>
                <ListItemText primary={pdf.filename} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleViewPdf(pdf.file_id)}>
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleSharePdf(pdf)}>
                    <ShareIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {selectedPdf && (
        <SharePDF 
          open={shareDialogOpen} 
          onClose={handleShareDialogClose} 
          fileId={selectedPdf.file_id}
          fileName={selectedPdf.filename}
        />
      )}
    </Box>
  );
};

export default PDFList;