import React, { useState } from 'react';
import { Container, Box, Tabs, Tab, Typography } from '@mui/material';
import PDFList from './PDFList';
import UploadPDF from '../upload/UploadPDF';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        PDF Management Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="My PDFs" />
          <Tab label="Upload New PDF" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && <PDFList />}
      {activeTab === 1 && <UploadPDF />}
    </Container>
  );
};

export default Dashboard;