import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Trash2 } from 'lucide-react';
import axios from 'axios';
import './PhotoUpload.css';

const PhotoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user's photos on component mount
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const response = await axios.get('/api/photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get photo URL with authentication
  const getPhotoUrl = (filename) => {
    const token = localStorage.getItem('token');
    if (token) {
      return `/api/photos/${filename}?token=${token}`;
    }
    return `/api/photos/${filename}`;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Preview generated');
        setPreview(reader.result);
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      await axios.post('/api/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Photo uploaded successfully!');
      setSelectedFile(null);
      setPreview(null);
      loadPhotos(); // Reload photos
    } catch (error) {
      alert(error.response?.data?.error || 'Error uploading photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    // Reset the file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDeletePhoto = async (photoId, filename) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        console.log('Deleting photo:', { photoId, filename });
        const response = await axios.delete(`/api/photos/${photoId}`);
        console.log('Delete response:', response.data);
        setPhotos(photos.filter(photo => photo.id !== photoId));
        alert('Photo deleted successfully!');
      } catch (error) {
        console.error('Error deleting photo:', error);
        alert(error.response?.data?.error || 'Error deleting photo');
      }
    }
  };

  return (
    <div className="photo-upload">
      <div className="container">
        <div className="page-header">
          <h1>Photo Upload</h1>
          <p>Take a photo of your meal to automatically track your nutrition</p>
        </div>

        <div className="upload-section">
          <div className="upload-card">
            {!preview ? (
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                  id="file-input"
                />
                <label htmlFor="file-input" className="upload-label">
                  <Camera size={48} />
                  <h3>Upload Food Photo</h3>
                  <p>Click to select or drag and drop an image</p>
                </label>
              </div>
            ) : (
              <div className="preview-area">
                <div className="preview-header">
                  <h3>Photo Preview</h3>
                  <button onClick={handleRemove} className="remove-btn">
                    <X size={20} />
                  </button>
                </div>
                <img src={preview} alt="Preview" className="preview-image" />
                <div className="preview-actions">
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="btn btn-primary"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="photos-section">
            <h3>Your Photos</h3>
            {loading ? (
              <div className="loading-message">Loading photos...</div>
            ) : photos.length === 0 ? (
              <div className="empty-state">
                <p>No photos uploaded yet. Start by uploading your first meal photo!</p>
              </div>
            ) : (
              <div className="photos-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="photo-item">
                    <img
                      src={getPhotoUrl(photo.filename)}
                      alt={photo.original_name}
                      className="photo-thumbnail"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="photo-fallback" style={{ display: 'none', padding: '20px', textAlign: 'center', color: '#666' }}>
                      <Camera size={32} />
                      <p>Image not available</p>
                    </div>
                    <div className="photo-info">
                      <p className="photo-name">{photo.original_name}</p>
                      <p className="photo-date">{new Date(photo.date).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.filename)}
                      className="delete-photo-btn"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="upload-tips">
            <h3>Tips for Better Results</h3>
            <ul>
              <li>Take photos in good lighting</li>
              <li>Include the entire meal in the frame</li>
              <li>Make sure the food is clearly visible</li>
              <li>Avoid blurry or dark images</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload; 