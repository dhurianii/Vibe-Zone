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
        className={`flex items-center justify-center bg-gradient-to-br from-[#171224] via-[#0F1118] to-[#08090D] text-[#C77DFF]/80 ${className}`}
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
