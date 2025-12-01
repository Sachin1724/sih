import { useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import './AdminDashboard.css';

function AdminDashboard() {
    const [unapprovedImages, setUnapprovedImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchUnapprovedImages();

        // Listen for new uploads
        socket.on('imageUploaded', (newImage) => {
            setUnapprovedImages((prev) => [newImage, ...prev]);
        });

        return () => {
            socket.off('imageUploaded');
        };
    }, []);

    const fetchUnapprovedImages = async () => {
        try {
            const response = await api.get('/images/unapproved');
            setUnapprovedImages(response.data);
        } catch (error) {
            console.error('Error fetching unapproved images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (imageId) => {
        if (!confirm('Approve this image for the carousel?')) return;

        setActionLoading(imageId);
        try {
            await api.put(`/images/${imageId}/approve`);
            setUnapprovedImages((prev) => prev.filter((img) => img._id !== imageId));
        } catch (error) {
            console.error('Error approving image:', error);
            alert('Failed to approve image. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (imageId) => {
        if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) return;

        setActionLoading(imageId);
        try {
            await api.delete(`/images/${imageId}`);
            setUnapprovedImages((prev) => prev.filter((img) => img._id !== imageId));
        } catch (error) {
            console.error('Error deleting image:', error);
            alert('Failed to delete image. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="admin-page flex-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="admin-header fade-in">
                <div className="header-content">
                    <div>
                        <h1 className="gradient-text">Admin Dashboard</h1>
                        <p className="admin-subtitle">Review and approve images for the carousel</p>
                    </div>
                    <div className="badge">
                        {unapprovedImages.length} Pending
                    </div>
                </div>
            </div>

            <div className="admin-container">
                {unapprovedImages.length === 0 ? (
                    <div className="empty-state fade-in">
                        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <h2 className="gradient-text">All Caught Up!</h2>
                        <p>No pending images to review</p>
                    </div>
                ) : (
                    <div className="images-grid fade-in">
                        {unapprovedImages.map((image) => (
                            <div key={image._id} className="image-card">
                                <div className="image-wrapper">
                                    <img src={image.url} alt="Pending approval" />
                                    <div className="image-info">
                                        <span className="timestamp">
                                            {new Date(image.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-actions">
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleApprove(image._id)}
                                        disabled={actionLoading === image._id}
                                    >
                                        {actionLoading === image._id ? (
                                            <div className="spinner-small"></div>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(image._id)}
                                        disabled={actionLoading === image._id}
                                    >
                                        {actionLoading === image._id ? (
                                            <div className="spinner-small"></div>
                                        ) : (
                                            <>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
