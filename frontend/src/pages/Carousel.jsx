import { useState, useEffect } from 'react';
import api from '../services/api';
import socket from '../services/socket';
import './Carousel.css';

function Carousel() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApprovedImages();

        socket.on('imageApproved', (newImage) => {
            setImages((prev) => [newImage, ...prev]);
        });

        socket.on('imageDeleted', ({ id }) => {
            setImages((prev) => prev.filter((img) => img._id !== id));
        });

        return () => {
            socket.off('imageApproved');
            socket.off('imageDeleted');
        };
    }, []);

    const fetchApprovedImages = async () => {
        try {
            const response = await api.get('/images/approved');
            setImages(response.data);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="carousel-page"></div>;
    }

    if (images.length === 0) {
        return <div className="carousel-page"></div>;
    }

    // Create grids of 12 images (3 columns × 4 rows)
    const grids = [];
    const gridSize = 12;

    // Duplicate images to ensure smooth infinite scroll
    const allImages = [...images, ...images, ...images, ...images];

    for (let i = 0; i < allImages.length; i += gridSize) {
        grids.push(allImages.slice(i, i + gridSize));
    }

    return (
        <div className="carousel-page">
            <div className="grid-carousel-track">
                {grids.map((grid, gridIndex) => (
                    <div key={gridIndex} className="grid-3x4">
                        {grid.map((image, imageIndex) => (
                            <div key={`${image._id}-${imageIndex}`} className="grid-cell">
                                <img src={image.url} alt="" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="overlay-content">
                <div className="logo-container">
                    <img src="/sih.png" alt="" className="overlay-logo sih-logo" />
                    <img src="/bput.png" alt="" className="overlay-logo" />
                </div>
                <h1 className="overlay-text">SIH 2025, BPUT</h1>
            </div>
        </div>
    );
}

export default Carousel;
