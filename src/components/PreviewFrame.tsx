
"use client";

import React, { useEffect, useRef } from "react";

interface VirtualFile {
  id: string;
  name: string;
  content: string;
}

interface PreviewFrameProps {
  files: VirtualFile[];
  device: "mobile" | "tablet" | "desktop";
}

export default function PreviewFrame({ files, device }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updatePreview = () => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      const indexHtml = files.find(f => f.name === "index.html")?.content || "<body><h1>No index.html found</h1></body>";
      const cssContent = files.filter(f => f.name.endsWith(".css")).map(f => f.content).join("\n");
      const jsContent = files.filter(f => f.name.endsWith(".js")).map(f => f.content).join("\n");

      // Injecting CSS and JS into the index.html content
      const parser = new DOMParser();
      const doc = parser.parseFromString(indexHtml, "text/html");

      // Inject CSS
      const styleTag = doc.createElement("style");
      styleTag.textContent = cssContent;
      doc.head.appendChild(styleTag);

      // Inject JS
      const scriptTag = doc.createElement("script");
      scriptTag.textContent = `
        try {
          ${jsContent}
        } catch (err) {
          console.error('JS Error:', err);
        }
      `;
      doc.body.appendChild(scriptTag);

      const combinedContent = doc.documentElement.outerHTML;
      const blob = new Blob([combinedContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframe.src = url;

      return () => URL.revokeObjectURL(url);
    };

    const timeout = setTimeout(updatePreview, 500);
    return () => clearTimeout(timeout);
  }, [files]);

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
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4 bg-background">
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
