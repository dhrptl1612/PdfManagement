import React, { useState } from 'react';
import pdfService from '../../services/pdfService';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Alert, Typography
} from '@mui/material';

const SharePDF = ({ open, onClose, fileId, fileName }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await pdfService.sharePDF(fileId, email);
      setSuccess(`"${fileName}" has been shared with ${email}`);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to share the PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share PDF</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Share "{fileName}" with:
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <TextField
          fullWidth
          label="Recipient Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          disabled={loading}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleShare} 
          variant="contained" 
          color="primary"
          disabled={loading || !email.trim()}
        >
          {loading ? 'Sharing...' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SharePDF;