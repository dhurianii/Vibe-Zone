import { Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ArtworkImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

export function ArtworkImage({
  src,
  fallbackSrc,
  alt,
  className = 'w-full h-full object-cover',
}: ArtworkImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failedCompletely, setFailedCompletely] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailedCompletely(false);
  }, [src]);

  if (failedCompletely) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#181B2A] via-[#101320] to-[#0A0C14] text-indigo-300/70 ${className}`}
        aria-label={alt}
      >
        <Music2 className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        } else {
          setFailedCompletely(true);
        }
      }}
      className={className}
    />
  );
}
