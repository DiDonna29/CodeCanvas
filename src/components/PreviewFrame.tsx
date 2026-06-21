
"use client";

import React, { useEffect, useRef } from "react";

interface PreviewFrameProps {
  html: string;
  css: string;
  js: string;
  device: "mobile" | "tablet" | "desktop";
}

export default function PreviewFrame({ html, css, js, device }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updatePreview = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const combinedContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              ${css}
            </style>
          </head>
          <body>
            ${html}
            <script>
              try {
                ${js}
              } catch (err) {
                console.error('JS Error:', err);
              }
            </script>
          </body>
        </html>
      `;

      const blob = new Blob([combinedContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframe.src = url;

      return () => URL.revokeObjectURL(url);
    };

    const timeout = setTimeout(updatePreview, 300);
    return () => clearTimeout(timeout);
  }, [html, css, js]);

  const getDeviceStyles = () => {
    switch (device) {
      case "mobile":
        return { width: "375px", height: "667px", border: "12px solid #333", borderRadius: "24px" };
      case "tablet":
        return { width: "768px", height: "1024px", border: "12px solid #333", borderRadius: "24px" };
      default:
        return { width: "100%", height: "100%", border: "none", borderRadius: "0" };
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <div 
        className="bg-white transition-all duration-300 shadow-2xl relative"
        style={getDeviceStyles()}
      >
        <iframe
          ref={iframeRef}
          title="Preview"
          className="w-full h-full"
          sandbox="allow-scripts allow-modals"
        />
        {/* Device elements decoration */}
        {device !== "desktop" && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#333] rounded-b-xl flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#555] mr-1"></div>
            <div className="w-8 h-1 rounded-full bg-[#555]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
