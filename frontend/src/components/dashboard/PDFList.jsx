import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pdfService from '../../services/pdfService';
import {
  Box, Typography, List, ListItem, ListItemText, 
  ListItemSecondaryAction, IconButton, Paper, 
  InputAdornment, TextField, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShareIcon from '@mui/icons-material/Share';
import DeleteIcon from '@mui/icons-material/Delete';
import SharePDF from '../share/SharePDF';

const PDFList = () => {
  const [pdfs, setPdfs] = useState([]);
  const [filteredPdfs, setFilteredPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState(null);
  const navigate = useNavigate();

  // Fetch PDFs on component mount
  useEffect(() => {
    fetchPDFs();
  }, []);

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
  
  const handleDeleteClick = (pdf) => {
    setPdfToDelete(pdf);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await pdfService.deletePDF(pdfToDelete.file_id);
      setDeleteDialogOpen(false);
      setPdfToDelete(null);
      // Refresh the PDF list
      fetchPDFs();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete PDF');
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPdfToDelete(null);
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
                  {/* Only show delete button if user is the owner */}
                  {pdf.is_owner && (
                    <IconButton edge="end" onClick={() => handleDeleteClick(pdf)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Share Dialog */}
      {selectedPdf && (
        <SharePDF 
          open={shareDialogOpen} 
          onClose={handleShareDialogClose} 
          fileId={selectedPdf.file_id}
          fileName={selectedPdf.filename}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete PDF</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{pdfToDelete?.filename}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PDFList;