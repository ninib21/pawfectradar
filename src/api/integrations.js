import apiClient from './apiClient';

// Core service functions
export const Core = {
  // Generic API call function
  async apiCall(endpoint, method = 'GET', data = null) {
    const config = {
      method: method.toLowerCase(),
      url: endpoint,
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await apiClient(config);
    return response.data;
  }
};

// LLM service
export const InvokeLLM = async (prompt, options = {}) => {
  const response = await apiClient.post('/ai/llm', {
    prompt,
    ...options
  });
  return response.data;
};

// Email service
export const SendEmail = async (to, subject, content, options = {}) => {
  const response = await apiClient.post('/email/send', {
    to,
    subject,
    content,
    ...options
  });
  return response.data;
};

// File upload service
export const UploadFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  
  Object.keys(options).forEach(key => {
    formData.append(key, options[key]);
  });
  
  const response = await apiClient.post('/upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Image generation service
export const GenerateImage = async (prompt, options = {}) => {
  const response = await apiClient.post('/ai/generate-image', {
    prompt,
    ...options
  });
  return response.data;
};

// Data extraction service
export const ExtractDataFromUploadedFile = async (fileId, extractionType, options = {}) => {
  const response = await apiClient.post('/ai/extract-data', {
    fileId,
    extractionType,
    ...options
  });
  return response.data;
};






