import React, { useState } from 'react';
import pdfService from '../../services/pdfService';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, CircularProgress,
  IconButton, Tooltip, Alert, Snackbar
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const GetShareableLink = ({ open, onClose, fileId, fileName }) => {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (open && fileId) {
      fetchShareableLink();
    } else {
      setShareUrl('');
      setError('');
    }
  }, [open, fileId]);

  const fetchShareableLink = async () => {
    try {
      setLoading(true);
      const response = await pdfService.getShareableLink(fileId);
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}${response.data.share_url}`);
      setError('');
    } catch (err) {
      setError('Failed to generate shareable link');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
      });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Shareable Link for "{fileName}"</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : (
            <>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Anyone with this link can view this PDF:
              </Typography>
              <Box sx={{ display: 'flex', mt: 2 }}>
                <TextField
                  value={shareUrl}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                  <IconButton onClick={handleCopyLink} color={copied ? "success" : "primary"}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default GetShareableLink;