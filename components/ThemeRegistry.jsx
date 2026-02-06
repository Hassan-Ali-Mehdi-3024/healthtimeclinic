'use client';

import React, { useEffect } from 'react';

export default function ThemeRegistry({ children }) {
  useEffect(() => {
    const applyTheme = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          const root = document.documentElement;
          
          if (settings.primaryColor) {
            root.style.setProperty('--primary-color', settings.primaryColor);
            // Also update the 'blue' shade often used as default
            root.style.setProperty('--blue-500', settings.primaryColor);
          }
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    };

    applyTheme();
  }, []);

  return <>{children}</>;
}