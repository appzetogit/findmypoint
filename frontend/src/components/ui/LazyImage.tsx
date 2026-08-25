import React, { useState, useEffect, useRef, memo } from "react";
import { BACKEND_ORIGIN } from "../../config";
import { ImageOff } from "lucide-react";

// Global in-memory cache to keep track of loaded images across component remounts
const globalImageMemoryCache = new Set<string>();

/**
 * Resolves any image URL correctly:
 * - Keeps data URLs, blobs, and external http/https URLs as-is
 * - Keeps local frontend Vite assets (/src/assets/..., /assets/..., etc.) as-is
 * - Prepends BACKEND_ORIGIN only for backend uploads (/uploads/...)
 */
export const resolveOptimizedImageUrl = (src?: string | null): string => {
  if (!src || typeof src !== "string") return "";
  const trimmed = src.trim();
  if (!trimmed) return "";

  // 1. Data URLs, Blob URLs, and Absolute HTTP/HTTPS URLs
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  // 2. Vite and Frontend bundle assets (e.g. /src/assets/..., /assets/..., /@fs/..., /@vite/..., /@id/...)
  if (
    trimmed.startsWith("/src/") ||
    trimmed.startsWith("/assets/") ||
    trimmed.startsWith("/@fs/") ||
    trimmed.startsWith("/@vite/") ||
    trimmed.startsWith("/@id/")
  ) {
    return trimmed;
  }

  // 3. Backend Uploads (/uploads/... or uploads/...)
  if (trimmed.startsWith("/uploads/") || trimmed.startsWith("uploads/")) {
    const cleanUploadPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (BACKEND_ORIGIN) {
      return `${BACKEND_ORIGIN}${cleanUploadPath}`;
    }
    return cleanUploadPath;
  }

  // 4. Any other relative path
  return trimmed;
};

/**
 * Preload single or multiple images into the browser cache
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    if (!src) return resolve();
    const resolved = resolveOptimizedImageUrl(src);
    if (globalImageMemoryCache.has(resolved)) return resolve();

    const img = new Image();
    img.src = resolved;
    img.onload = () => {
      globalImageMemoryCache.add(resolved);
      resolve();
    };
    img.onerror = () => resolve();
  });
};

export const preloadImages = (srcs: string[]): Promise<void[]> => {
  return Promise.all(srcs.filter(Boolean).map(preloadImage));
};

export interface LazyImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  alt: string;
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
  aspectRatio?: string;
  priority?: boolean;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  imgClassName?: string;
  containerClassName?: string;
}

export const LazyImage = memo(function LazyImage({
  src,
  alt,
  fallbackSrc,
  fallbackComponent,
  aspectRatio,
  priority = false,
  showSkeleton = true,
  skeletonClassName = "",
  imgClassName = "",
  containerClassName = "",
  className = "",
  style,
  onLoad,
  onError,
  ...restProps
}: LazyImageProps) {
  const resolvedSrc = resolveOptimizedImageUrl(src);
  const resolvedFallback = fallbackSrc ? resolveOptimizedImageUrl(fallbackSrc) : "";

  // Check if image is already cached in memory or priority
  const isAlreadyCached = Boolean(resolvedSrc && globalImageMemoryCache.has(resolvedSrc));

  const [isLoaded, setIsLoaded] = useState<boolean>(isAlreadyCached || priority);
  const [hasError, setHasError] = useState<boolean>(!resolvedSrc);
  const [currentSrc, setCurrentSrc] = useState<string>(resolvedSrc || resolvedFallback);

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync state when src changes
  useEffect(() => {
    const nextResolved = resolveOptimizedImageUrl(src);
    if (!nextResolved) {
      setHasError(true);
      setIsLoaded(false);
      setCurrentSrc(resolvedFallback);
      return;
    }

    if (globalImageMemoryCache.has(nextResolved) || priority) {
      setIsLoaded(true);
      setHasError(false);
      setCurrentSrc(nextResolved);
    } else {
      setIsLoaded(false);
      setHasError(false);
      setCurrentSrc(nextResolved);
    }
  }, [src, resolvedFallback, priority]);

  // Check if native complete flag is already set by browser cache
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      if (currentSrc) globalImageMemoryCache.add(currentSrc);
      setIsLoaded(true);
    }
  }, [currentSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc) {
      globalImageMemoryCache.add(currentSrc);
    }
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (resolvedFallback && currentSrc !== resolvedFallback) {
      setCurrentSrc(resolvedFallback);
      setHasError(false);
    } else {
      setHasError(true);
      setIsLoaded(true);
    }
    onError?.(e);
  };

  const combinedContainerClass = `relative ${
    containerClassName || className || ""
  }`;

  return (
    <div
      className={combinedContainerClass}
      style={{
        ...(aspectRatio ? { aspectRatio } : {}),
        ...style,
      }}
    >
      {/* Animated Skeleton Shimmer (hidden when image is loaded or in cache or showSkeleton=false) */}
      {!isLoaded && showSkeleton && !hasError && (
        <div
          className={`absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700/60 dark:to-slate-800 ${skeletonClassName}`}
          aria-hidden="true"
        />
      )}

      {/* Error Fallback view */}
      {hasError ? (
        fallbackComponent ? (
          <div className="h-full w-full flex items-center justify-center">{fallbackComponent}</div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800/80 text-muted-foreground p-2">
            <ImageOff className="h-5 w-5 opacity-40 mb-1" />
            <span className="text-[10px] font-semibold opacity-60 text-center line-clamp-1">
              {alt || "Image unavailable"}
            </span>
          </div>
        )
      ) : (
        /* Actual Image with smooth fade-in and proper React fetchPriority */
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ease-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${imgClassName || "h-full w-full object-cover"}`}
          style={style}
          {...restProps}
        />
      )}
    </div>
  );
});

export default LazyImage;

