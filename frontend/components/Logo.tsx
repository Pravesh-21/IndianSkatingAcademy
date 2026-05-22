'use client';

import React from 'react';

interface LogoProps {
  variant?: 'navbar' | 'footer' | 'icon';
  height?: number | string;
  className?: string;
}

export default function Logo({ variant = 'navbar', height, className = '' }: LogoProps) {
  // Choose the source image names based on the variant:
  // - 'navbar' and 'icon' use the cropped top-half logo without subtitles
  // - 'footer' uses the full logo with subtitles
  const isCropped = variant === 'navbar' || variant === 'icon';
  const lightSrc = isCropped ? '/images/logo_nav_light.png' : '/images/logo_light.png';
  const darkSrc = isCropped ? '/images/logo_nav_dark.png' : '/images/logo_dark.png';

  // Apply explicit height style if provided as a prop
  const wrapperStyle = height ? { height } : undefined;

  return (
    <>
      {/* Zero-CLS (Cumulative Layout Shift) stylesheet for instant light/dark switches */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .logo-wrapper {
          display: inline-flex;
          align-items: center;
          position: relative;
          transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .logo-wrapper--navbar {
          height: 48px;
        }
        .logo-wrapper--footer {
          height: 88px;
        }
        .logo-wrapper--icon {
          height: 44px;
        }
        
        /* Smooth scale-down in scrolled navbar */
        .nav--scrolled .logo-wrapper--navbar {
          height: 40px;
        }

        .logo-img-asset {
          height: 100%;
          width: auto;
          display: block;
          object-fit: contain;
          transition: filter 0.3s ease;
        }
        
        /* Dark Theme: show dark assets, hide light assets */
        html[data-theme="dark"] .logo-img-asset--light {
          display: none !important;
        }
        html[data-theme="dark"] .logo-img-asset--dark {
          display: block !important;
        }
        
        /* Light Theme: show light assets, hide dark assets */
        html[data-theme="light"] .logo-img-asset--light {
          display: block !important;
        }
        html[data-theme="light"] .logo-img-asset--dark {
          display: none !important;
        }
        
        /* Fallback if theme-attribute is not loaded yet (Defaults to light mode) */
        html:not([data-theme]) .logo-img-asset--light {
          display: block;
        }
        html:not([data-theme]) .logo-img-asset--dark {
          display: none;
        }
      `}} />

      <div
        className={`logo-wrapper logo-wrapper--${variant} ${className}`}
        style={wrapperStyle}
      >
        <img
          src={lightSrc}
          alt="Indian Skating Academy Logo"
          className="logo-img-asset logo-img-asset--light"
        />
        <img
          src={darkSrc}
          alt="Indian Skating Academy Logo"
          className="logo-img-asset logo-img-asset--dark"
        />
      </div>
    </>
  );
}
