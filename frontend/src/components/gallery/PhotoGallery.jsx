import { Edit as EditIcon, Gallery as GalleryIcon, Plus as PlusIcon, Star as StarIcon } from '@/lib/icons.js';
import React, { useState, useEffect } from 'react';

import { UploadFile } from '@/api/integrations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function PhotoGallery({ 
  entityType, 
  entityId, 
  canEdit = false, 
  maxPhotos = 10,
  showCaptions = true 
}) {
  const [gallery, setGallery] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingCaption, setEditingCaption] = useState(null);
  const [newCaption, setNewCaption] = useState('');

  useEffect(() => {
    loadGallery();
  }, [entityType, entityId]);

  const loadGallery = async () => {
    try {
      const galleries = await Gallery.filter({ 
        entity_type: entityType, 
        entity_id: entityId 
      });
      
      if (galleries.length > 0) {
        const galleryData = galleries[0];
        setGallery(galleryData);
        setPhotos(galleryData.photos || []);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const uploadResults = await Promise.all(uploadPromises);
      
      const newPhotos = uploadResults.map((result, index) => ({
        url: result.file_url,
        caption: '',
        order: photos.length + index
      }));

      const updatedPhotos = [...photos, ...newPhotos].slice(0, maxPhotos);
      await saveGallery(updatedPhotos);
      
    } catch (error) {
      console.error('Error uploading photos:', error);
    }
    
    setUploading(false);
  };

  const saveGallery = async (updatedPhotos) => {
    try {
      const galleryData = {
        entity_type: entityType,
        entity_id: entityId,
        photos: updatedPhotos,
        cover_photo: updatedPhotos[0]?.url || ''
      };

      if (gallery) {
        await Gallery.update(gallery.id, galleryData);
      } else {
        await Gallery.create(galleryData);
      }
      
      setPhotos(updatedPhotos);
      loadGallery();
    } catch (error) {
      console.error('Error saving gallery:', error);
    }
  };

  const updatePhotoCaption = async (photoIndex, caption) => {
    const updatedPhotos = [...photos];
    updatedPhotos[photoIndex].caption = caption;
    await saveGallery(updatedPhotos);
    setEditingCaption(null);
    setNewCaption('');
  };

  const removePhoto = async (photoIndex) => {
    const updatedPhotos = photos.filter((_, index) => index !== photoIndex);
    await saveGallery(updatedPhotos);
  };

  const setCoverPhoto = async (photoIndex) => {
    const updatedPhotos = [...photos];
    const coverPhoto = updatedPhotos.splice(photoIndex, 1)[0];
    updatedPhotos.unshift(coverPhoto);
    
    // Update order numbers
    updatedPhotos.forEach((photo, index) => {
      photo.order = index;
    });
    
    await saveGallery(updatedPhotos);
  };

  if (photos.length === 0 && !canEdit) {
    return (
      <Card className="border-2 border-dashed border-gray-200">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Camera className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-600">No photos available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      {canEdit && photos.length < maxPhotos && (
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
            id="photo-upload"
          />
          <Button
            onClick={() => document.getElementById('photo-upload').click()}
            disabled={uploading}
            className="bg-gradient-to-r from-[#A2D4F5] to-[#FBC3D2] hover:from-[#7DB9E8] to-[#F8A7C0] text-white border-0"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Add Photos'}
          </Button>
          <span className="text-sm text-gray-600">
            {photos.length}/{maxPhotos} photos
          </span>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div 
                className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedPhoto({ ...photo, index })}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Cover Photo Badge */}
                {index === 0 && (
                  <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                    <StarIcon className="w-3 h-3 mr-1" />
                    Cover
                  </Badge>
                )}
                
                {/* Edit Controls */}
                {canEdit && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverPhoto(index);
                      }}
                    >
                      <StarIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCaption(index);
                        setNewCaption(photo.caption || '');
                      }}
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Caption */}
              {showCaptions && photo.caption && (
                <p className="text-sm text-gray-600 mt-2 truncate">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <Dialog open={true} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>
                Photo {selectedPhoto.index + 1} of {photos.length}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center">
              <img 
                src={selectedPhoto.url} 
                alt={selectedPhoto.caption || 'Photo'}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
              {selectedPhoto.caption && (
                <p className="text-gray-700 mt-4 text-center">
                  {selectedPhoto.caption}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Caption Editor Modal */}
      {editingCaption !== null && (
        <Dialog open={true} onOpenChange={() => setEditingCaption(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Photo Caption</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-center">
                <img 
                  src={photos[editingCaption].url} 
                  alt="Photo to edit"
                  className="max-w-48 max-h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Add a caption..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingCaption(null)}>
                  Cancel
                </Button>
                <Button onClick={() => updatePhotoCaption(editingCaption, newCaption)}>
                  Save Caption
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}