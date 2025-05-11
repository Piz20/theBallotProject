import { useEffect, useState, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
}

function useIntersectionObserver<T extends Element>(
  options: IntersectionObserverOptions = {}
): [RefObject<T>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);

  const { threshold = 0, root = null, rootMargin = '0px' } = options;

  useEffect(() => {
    const element = ref.current;
    
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, root, rootMargin]);

  return [ref, isVisible];
}

export default useIntersectionObserver;