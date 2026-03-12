'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  // Removed onDarkBackground prop as it's no longer needed
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  ...props
}: ImageWithFallbackProps) {
  // Use provided fallback or default to a system fallback image
  const finalFallback = fallbackSrc || '/images/JBC-icon.png';
  
  // Determine the source immediately to avoid state changes during render
  const [imgSrc, setImgSrc] = useState(src);

  // Handle errors outside of the render cycle
  const handleError = () => {
    if (imgSrc !== finalFallback) {
      setImgSrc(finalFallback);
    }
  };

  // Use consistent styling for all images
  const imageClass = `${props.className || ''} object-contain`;

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={imageClass}
    />
  );
}
