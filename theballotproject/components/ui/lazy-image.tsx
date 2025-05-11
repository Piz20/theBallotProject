import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt?: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt = '', className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);
    
    // Create new image to track loading
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };
    
    return () => {
      // Clean up
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={`relative h-48 w-full bg-gray-100 overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <Loader className="h-8 w-8 text-primary animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">Failed to load image</p>
        </div>
      )}
      
      <div 
        className={`h-full w-full bg-cover bg-center transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ backgroundImage: `url(${src})` }}
        role="img"
        aria-label={alt}
      />
    </div>
  );
};

export default LazyImage;