import api from './api';

const pdfService = {
  uploadPDF: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await api.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  listPDFs: async () => {
    return await api.get('/pdf/list');
  },
  
  addComment: async (fileId, text) => {
    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('text', text);
    return await api.post('/pdf/comment', formData);
  },
  
  getComments: async (fileId) => {
    return await api.get(`/pdf/comments/${fileId}`);
  },
  
  sharePDF: async (fileId, shareWith) => {
    return await api.post('/pdf/share', {
      file_id: fileId,
      share_with: shareWith
    });
  },
  
  deletePDF: async (fileId) => {
    return await api.delete(`/pdf/delete/${fileId}`);
  },
  
  getShareableLink: async (fileId) => {
    return await api.get(`/pdf/shared-link/${fileId}`);
  }
};


export default pdfService;