import React from 'react';
import { useStore } from '../../context/StoreContext';

interface BrandLogoProps {
  variant?: 'color' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'color',
  size = 'md',
  className = '',
}) => {
  let customLogoUrl: string | undefined;
  let customIconUrl: string | undefined;

  try {
    const store = useStore();
    customLogoUrl = store.settings?.logoUrl;
    customIconUrl = store.settings?.iconUrl;
  } catch {
    // If rendered outside StoreProvider context
  }

  // 1. Icon view (for mobile bar, favicon, or avatar)
  if (size === 'icon') {
    const iconSrc = customIconUrl?.trim() ? customIconUrl.trim() : '/logo-icon.svg';
    return (
      <img
        src={iconSrc}
        alt="Sohoj Cart BD Icon"
        className={`w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 ${className}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          // Fallback to default if custom url breaks
          if (e.currentTarget.src !== window.location.origin + '/logo-icon.svg') {
            e.currentTarget.src = '/logo-icon.svg';
          }
        }}
      />
    );
  }

  // 2. Full Logo view
  const heightClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-11 md:h-12',
    lg: 'h-12 sm:h-14',
    xl: 'h-14 sm:h-16 md:h-18',
  }[size] || 'h-10';

  const defaultLogo = variant === 'white' ? '/logo-white.svg' : '/logo.svg';
  const logoSrc = customLogoUrl?.trim() ? customLogoUrl.trim() : defaultLogo;

  return (
    <img
      src={logoSrc}
      alt="Sohoj Cart BD - Official Brand Logo"
      className={`${heightClasses} w-auto max-w-[240px] sm:max-w-[280px] md:max-w-[320px] object-contain shrink-0 select-none ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback to default if custom url fails to load
        if (e.currentTarget.src !== window.location.origin + defaultLogo) {
          e.currentTarget.src = defaultLogo;
        }
      }}
    />
  );
};
