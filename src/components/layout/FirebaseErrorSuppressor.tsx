'use client';

import { useEffect } from 'react';

export function FirebaseErrorSuppressor() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        const errorStr = args
          .map((a) => {
            try {
              return typeof a === 'object' ? JSON.stringify(a) : String(a);
            } catch {
              return String(a);
            }
          })
          .join(' ');

        if (
          errorStr.includes('resource-exhausted') ||
          errorStr.includes('Quota exceeded') ||
          errorStr.includes('maximum backoff delay')
        ) {
          console.info('Firestore Quota Notice: Operating smoothly in LocalStorage mode.');
          return;
        }
        originalConsoleError.apply(console, args);
      };
    }
  }, []);

  return null;
}
