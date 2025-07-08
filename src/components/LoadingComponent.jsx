import React from 'react';

const LoadingComponent = () => {
    return (
        <div className="loading-overlay">
            <div className="loader"></div>
            <p>Loading Data...</p>
        </div>
    );
};

export default LoadingComponent;
