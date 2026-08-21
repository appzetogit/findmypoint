import { useEffect } from 'react';
import { applySEO, SEOConfig } from '../utils/seo';

/**
 * Reusable React Hook for dynamic page SEO and Structured Data injection
 */
export function useSEO(config: SEOConfig, deps: any[] = []) {
  useEffect(() => {
    applySEO(config);

    return () => {
      // Clean up structured data script when unmounting or changing page
      const script = document.getElementById("fmp-jsonld-structured-data");
      if (script) {
        script.remove();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
