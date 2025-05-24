// src/components/pdf/CommentSection.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import pdfService from '../../services/pdfService';
import { 
  Paper, Typography, TextField, Button, List, 
  ListItem, ListItemText, Divider, Box, 
  CircularProgress, Alert 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';

const CommentSection = ({ fileId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const commentListRef = useRef(null);

  const fetchComments = useCallback(async () => {
  try {
    setLoading(true);
    const response = await pdfService.getComments(fileId);
    setComments(response.data);
    setError('');
  } catch (err) {
    console.error('Error fetching comments:', err);
    setError('Failed to load comments. Please try again later.');
  } finally {
    setLoading(false);
  }
}, [fileId]);

  useEffect(() => {
    fetchComments();
    // Set up polling to refresh comments
    const interval = setInterval(fetchComments, 10000);
    return () => clearInterval(interval);
  }, [fileId,fetchComments]);

  useEffect(() => {
    // Scroll to bottom when comments change
    if (commentListRef.current) {
      commentListRef.current.scrollTop = commentListRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      setSubmitting(true);
      setError('');
      await pdfService.addComment(fileId, newComment);
      setNewComment('');
      // Fetch comments to update the list
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return timestamp;
    }
  };

  return (
    <Paper sx={{ p: 2, height: '85vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>
      
      {/* Comments list */}
      <Box 
        ref={commentListRef}
        sx={{ 
          flexGrow: 1, 
          overflow: 'auto', 
          mb: 2,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {loading && comments.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : comments.length === 0 ? (
          <Typography variant="body2" color="textSecondary" align="center" sx={{ p: 3 }}>
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <List>
            {comments.map((comment, index) => (
              <React.Fragment key={comment.id || index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">{comment.user_email}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatTimestamp(comment.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={comment.text}
                  />
                </ListItem>
                {index < comments.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Comment form */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          multiline
          rows={2}
          disabled={submitting}
          sx={{ mb: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          disabled={!newComment.trim() || submitting}
        >
          {submitting ? 'Sending...' : 'Add Comment'}
        </Button>
      </Box>
    </Paper>
  );
};

export default CommentSection;