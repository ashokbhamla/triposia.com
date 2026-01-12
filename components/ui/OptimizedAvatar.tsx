'use client';

import { Avatar, AvatarProps } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedAvatarProps extends Omit<AvatarProps, 'src'> {
  src: string;
  alt: string;
  size?: number;
}

/**
 * Optimized Avatar component that uses Next.js Image for better performance
 */
export default function OptimizedAvatar({ src, alt, size = 32, ...props }: OptimizedAvatarProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <Avatar {...props} sx={{ width: size, height: size, ...props.sx }}>
        {alt.charAt(0).toUpperCase()}
      </Avatar>
    );
  }

  return (
    <Avatar
      {...props}
      sx={{
        width: size,
        height: size,
        position: 'relative',
        overflow: 'hidden',
        ...props.sx,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: 'cover' }}
        loading="lazy"
        onError={() => setImgError(true)}
        sizes={`${size}px`}
      />
    </Avatar>
  );
}

