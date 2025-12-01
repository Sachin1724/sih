import { useState } from 'react';
import api from '../services/api';
import './Upload.css';

function Upload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage({ text: 'Please select an image file', type: 'error' });
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setMessage({ text: '', type: '' });
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage({ text: 'Please select an image first', type: 'error' });
            return;
        }

        setUploading(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await api.post('/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setMessage({ text: 'Image uploaded successfully! Awaiting admin approval.', type: 'success' });
            setSelectedFile(null);
            setPreview(null);

            // Reset file input
            document.getElementById('file-input').value = '';
        } catch (error) {
            console.error('Upload error:', error);
            setMessage({
                text: error.response?.data?.error || 'Failed to upload image. Please try again.',
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-page">
            <div className="upload-container fade-in">
                <h1 className="gradient-text">Upload Image</h1>
                <p className="subtitle">Select an image to upload to the carousel</p>

                <div className="upload-area">
                    <input
                        type="file"
                        id="file-input"
                        accept="image/*"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor="file-input" className="file-input-label">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Choose Image
                    </label>

                    {preview && (
                        <div className="preview-container">
                            <img src={preview} alt="Preview" className="preview-image" />
                        </div>
                    )}

                    {selectedFile && (
                        <div className="file-info">
                            <p><strong>File:</strong> {selectedFile.name}</p>
                            <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}

                    <button
                        className="btn btn-primary upload-btn"
                        onClick={handleUpload}
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? (
                            <>
                                <div className="spinner-small"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 9l-5-5-5 5M12 4v12" />
                                </svg>
                                Upload Image
                            </>
                        )}
                    </button>

                    {message.text && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Upload;
