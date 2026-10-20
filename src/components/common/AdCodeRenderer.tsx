import React, { useMemo } from 'react';

interface AdCodeRendererProps {
  code: string;
  format?: '728x90' | '300x250' | 'native' | 'responsive';
  className?: string;
  label?: string;
}

export const AdCodeRenderer: React.FC<AdCodeRendererProps> = ({
  code,
  format = 'responsive',
  className = '',
  label = 'Sponsored Advertisement',
}) => {
  const trimmedCode = (code || '').trim();

  const dimensions = useMemo(() => {
    switch (format) {
      case '728x90':
        return { height: '100px', maxWidth: '728px', minHeight: '90px' };
      case '300x250':
        return { height: '260px', maxWidth: '300px', minHeight: '250px' };
      case 'native':
        return { height: '150px', maxWidth: '100%', minHeight: '120px' };
      case 'responsive':
      default:
        return { height: '110px', maxWidth: '100%', minHeight: '90px' };
    }
  }, [format]);

  if (!trimmedCode) return null;

  // Build sandboxed iframe srcDoc content that executes script tags safely
  const srcDoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <style>
    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    a {
      text-decoration: none;
      display: inline-block;
    }
  </style>
</head>
<body>
  ${trimmedCode}
</body>
</html>`;

  return (
    <div className={`relative flex flex-col items-center justify-center my-4 overflow-hidden ${className}`}>
      {/* Discreet Ad Tag */}
      <div className="w-full flex items-center justify-between pb-1 px-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          {label}
        </span>
        <span className="text-[9px] text-slate-400 font-mono">Ad</span>
      </div>

      {/* Ad Container Box */}
      <div
        className="w-full bg-slate-50 rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-xs overflow-hidden"
        style={{ minHeight: dimensions.minHeight }}
      >
        <iframe
          srcDoc={srcDoc}
          title="Adsterra Advertisement"
          sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-forms"
          className="w-full border-0 overflow-hidden"
          style={{ height: dimensions.height, maxWidth: dimensions.maxWidth }}
          scrolling="no"
          loading="lazy"
        />
      </div>
    </div>
  );
};
