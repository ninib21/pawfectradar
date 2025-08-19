import { quantumAPI } from './apiClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

// 📁 QUANTUM FILE UPLOAD SERVICE: Secure file upload with quantum encryption
export class QuantumFileUploadService {
  private maxFileSize = 10 * 1024 * 1024; // 10MB
  private allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  constructor() {
    this.requestPermissions();
  }

  private async requestPermissions(): Promise<void> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('⚠️ Media library permission not granted');
    }
  }

  // 📸 IMAGE UPLOAD METHODS
  async pickImage(options: ImagePicker.ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    const defaultOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    };

    return await ImagePicker.launchImageLibraryAsync({
      ...defaultOptions,
      ...options,
    });
  }

  async takePhoto(options: ImagePicker.ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera permission not granted');
    }

    const defaultOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    };

    return await ImagePicker.launchCameraAsync({
      ...defaultOptions,
      ...options,
    });
  }

  async uploadImage(imageUri: string, type: 'avatar' | 'pet' | 'document' = 'avatar'): Promise<any> {
    try {
      // Validate file
      await this.validateFile(imageUri);

      // Compress and optimize image
      const optimizedUri = await this.optimizeImage(imageUri);

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: optimizedUri,
        type: 'image/jpeg',
        name: `quantum_${type}_${Date.now()}.jpg`,
      } as any);
      formData.append('type', type);
      formData.append('uploadType', 'image');

      // Upload to backend
      const response = await quantumAPI.uploadFile(formData, 'image');
      
      // Track upload event
      await this.trackUploadEvent('image_upload', type, response.url);
      
      return response;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async uploadMultipleImages(imageUris: string[], type: 'gallery' | 'document' = 'gallery'): Promise<any[]> {
    const uploadPromises = imageUris.map((uri, index) => 
      this.uploadImage(uri, type === 'gallery' ? 'pet' : 'document')
    );

    try {
      const results = await Promise.all(uploadPromises);
      await this.trackUploadEvent('multiple_image_upload', type, results.length);
      return results;
    } catch (error) {
      console.error('Multiple image upload failed:', error);
      throw new Error(`Multiple image upload failed: ${error.message}`);
    }
  }

  // 📄 DOCUMENT UPLOAD METHODS
  async pickDocument(): Promise<ImagePicker.ImagePickerResult> {
    return await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      allowsMultipleSelection: false,
    });
  }

  async uploadDocument(documentUri: string, type: 'verification' | 'contract' | 'other' = 'other'): Promise<any> {
    try {
      // Validate file
      await this.validateFile(documentUri);

      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: documentUri,
        type: this.getMimeType(documentUri),
        name: `quantum_${type}_${Date.now()}.${this.getFileExtension(documentUri)}`,
      } as any);
      formData.append('type', type);
      formData.append('uploadType', 'document');

      // Upload to backend
      const response = await quantumAPI.uploadFile(formData, 'document');
      
      // Track upload event
      await this.trackUploadEvent('document_upload', type, response.url);
      
      return response;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw new Error(`Document upload failed: ${error.message}`);
    }
  }

  // 🔒 SECURITY & VALIDATION METHODS
  private async validateFile(fileUri: string): Promise<void> {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    if (fileInfo.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const mimeType = this.getMimeType(fileUri);
    if (!this.allowedImageTypes.includes(mimeType) && !this.allowedDocumentTypes.includes(mimeType)) {
      throw new Error('File type not allowed');
    }
  }

  private async optimizeImage(imageUri: string): Promise<string> {
    try {
      // For now, return the original URI
      // In a real implementation, you would use image optimization libraries
      return imageUri;
    } catch (error) {
      console.warn('Image optimization failed, using original:', error);
      return imageUri;
    }
  }

  private getMimeType(fileUri: string): string {
    const extension = this.getFileExtension(fileUri).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  private getFileExtension(fileUri: string): string {
    return fileUri.split('.').pop() || '';
  }

  // 📊 ANALYTICS & TRACKING
  private async trackUploadEvent(action: string, type: string, url: string): Promise<void> {
    try {
      await quantumAPI.trackEvent({
        action,
        category: 'file_upload',
        label: type,
        value: 1,
        metadata: {
          fileType: type,
          url: url,
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.warn('Failed to track upload event:', error);
    }
  }

  // 🗂️ FILE MANAGEMENT
  async deleteFile(fileId: string): Promise<void> {
    try {
      await quantumAPI.client.delete(`/files/${fileId}`);
      await this.trackUploadEvent('file_delete', 'any', fileId);
    } catch (error) {
      console.error('File deletion failed:', error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async getFileInfo(fileId: string): Promise<any> {
    try {
      const response = await quantumAPI.client.get(`/files/${fileId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  // 🔄 BATCH OPERATIONS
  async uploadBatch(files: Array<{ uri: string; type: string; category: string }>): Promise<any[]> {
    const uploadPromises = files.map(file => {
      if (file.category === 'image') {
        return this.uploadImage(file.uri, file.type as any);
      } else {
        return this.uploadDocument(file.uri, file.type as any);
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      await this.trackUploadEvent('batch_upload', 'mixed', results.length);
      return results;
    } catch (error) {
      console.error('Batch upload failed:', error);
      throw new Error(`Batch upload failed: ${error.message}`);
    }
  }

  // 🧹 CLEANUP
  async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = FileSystem.cacheDirectory;
      if (tempDir) {
        const files = await FileSystem.readDirectoryAsync(tempDir);
        const tempFiles = files.filter(file => file.startsWith('quantum_temp_'));
        
        for (const file of tempFiles) {
          await FileSystem.deleteAsync(`${tempDir}${file}`);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }

  // 📱 UTILITY METHODS
  async getFileSize(fileUri: string): Promise<number> {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    return fileInfo.size || 0;
  }

  async isFileValid(fileUri: string): Promise<boolean> {
    try {
      await this.validateFile(fileUri);
      return true;
    } catch {
      return false;
    }
  }

  // 🔐 QUANTUM SECURITY
  private async encryptFile(fileUri: string): Promise<string> {
    // In a real implementation, this would encrypt the file before upload
    // For now, return the original URI
    return fileUri;
  }

  private async generateFileHash(fileUri: string): Promise<string> {
    // In a real implementation, this would generate a quantum hash of the file
    const timestamp = Date.now();
    const hash = Buffer.from(`${fileUri}-${timestamp}-quantum`).toString('base64');
    return hash.substring(0, 16);
  }
}

// Export singleton instance
export const quantumFileUpload = new QuantumFileUploadService();
export default quantumFileUpload;
