'use client';

import { Toaster } from 'react-hot-toast';

/** Toasts sit above the sticky CTA and clear the home indicator. */
export function ToastHost() {
  return (
    <Toaster
      position="bottom-center"
      containerStyle={{ bottom: 'calc(max(20px, var(--safe-bottom)) + 76px)' }}
      toastOptions={{
        duration: 2600,
        style: {
          background: 'rgba(36, 30, 43, 0.96)',
          color: '#fff',
          border: '1px solid rgba(149, 97, 233, 0.3)',
          borderRadius: '999px',
          padding: '10px 18px',
          fontSize: '14px',
          fontWeight: 600,
          backdropFilter: 'blur(14px)',
          maxWidth: 'min(92vw, 420px)',
        },
        success: { iconTheme: { primary: '#9561e9', secondary: '#fff' } },
      }}
    />
  );
}
