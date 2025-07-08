import React from 'react';

/**
 * Komponen untuk menampilkan overlay loading di seluruh layar.
 * Komponen ini memerlukan styling global untuk class 'loading-overlay' dan 'loader'.
 */
const LoadingComponent = () => {
    return (
        <div className="loading-overlay">
            <div className="loader"></div>
            <p>Loading Data...</p>
        </div>
    );
};

export default LoadingComponent;
