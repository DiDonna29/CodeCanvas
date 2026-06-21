
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
  Layout, 
  Play, 
  Code, 
  Eye, 
  Trash2, 
  Settings, 
  Zap, 
  ChevronRight, 
  ChevronDown,
  Columns,
  Rows,
  Maximize,
  Sparkles,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { usePersistedState } from "@/hooks/use-persisted-state";
import PreviewFrame from "@/components/PreviewFrame";
import AIChatPanel from "@/components/AIChatPanel";

// Dynamically import CodeEditor to prevent SSR errors with CodeMirror
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-card flex items-center justify-center text-muted-foreground">Loading editor...</div>
});

type ViewLayout = "split-v" | "split-h" | "preview-only" | "code-only";
type DevicePreview = "mobile" | "tablet" | "desktop";

const DEFAULT_HTML = `<!-- Welcome to CodeCanvas -->
<div class="container">
  <h1>Hello to BigDevSoon 👋</h1>
  <p>Create code that matters! 🤩</p>
  <button id="cta">Click Me</button>
</div>`;

const DEFAULT_CSS = `body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #24282D;
  color: white;
  font-family: 'Inter', sans-serif;
}

.container {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

h1 {
  color: #85BBEE;
  margin-bottom: 0.5rem;
}

button {
  background: #7F7FE5;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}`;

const DEFAULT_JS = `document.getElementById('cta').addEventListener('click', () => {
  alert('Keep building awesome stuff! 🚀');
});`;

export default function CodeCanvas() {
  const [html, setHtml] = usePersistedState("cc-html", DEFAULT_HTML);
  const [css, setCss] = usePersistedState("cc-css", DEFAULT_CSS);
  const [js, setJs] = usePersistedState("cc-js", DEFAULT_JS);
  
  const [activeTab, setActiveTab] = useState("html");
  const [layout, setLayout] = useState<ViewLayout>("split-v");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    if (layout === "split-v") {
      const newPos = (e.clientX / window.innerWidth) * 100;
      setSplitPosition(Math.min(Math.max(newPos, 15), 85));
    } else if (layout === "split-h") {
      const newPos = (e.clientY / window.innerHeight) * 100;
      setSplitPosition(Math.min(Math.max(newPos, 15), 85));
    }
  }, [isResizing, layout]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "default";
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const clearProject = () => {
    if (confirm("Are you sure you want to clear your code? This cannot be undone.")) {
      setHtml("");
      setCss("");
      setJs("");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-headline font-bold text-lg tracking-tight hidden sm:inline-block">CodeCanvas</span>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => setLayout("split-v")} className={layout === "split-v" ? "bg-accent/20 text-accent" : ""}>
              <Columns className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Side-by-Side</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLayout("split-h")} className={layout === "split-h" ? "bg-accent/20 text-accent" : ""}>
              <Rows className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Stack</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary border-primary/20 hover:bg-primary/10"
            onClick={() => setIsAiOpen(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Project Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearProject} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Clear All Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDevice("desktop")}>
                <Monitor className="w-4 h-4 mr-2" /> Desktop View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDevice("tablet")}>
                <Tablet className="w-4 h-4 mr-2" /> Tablet View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDevice("mobile")}>
                <Smartphone className="w-4 h-4 mr-2" /> Mobile View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 hidden sm:flex">
            <Zap className="w-4 h-4 mr-2" /> Deploy
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main 
        className={`flex flex-1 relative overflow-hidden ${layout === "split-h" ? "flex-col" : "flex-row"}`}
      >
        {/* Editor Side */}
        <div 
          className="flex flex-col bg-card overflow-hidden" 
          style={{ 
            width: layout === "split-v" ? `${splitPosition}%` : "100%",
            height: layout === "split-h" ? `${splitPosition}%` : "100%",
          }}
        >
          <Tabs defaultValue="html" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
            <div className="flex items-center justify-between px-2 bg-background/50 border-b border-border">
              <TabsList className="bg-transparent h-10 gap-2 p-0">
                <TabsTrigger 
                  value="html" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs h-full px-4"
                >
                  index.html
                </TabsTrigger>
                <TabsTrigger 
                  value="css" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs h-full px-4"
                >
                  styles.css
                </TabsTrigger>
                <TabsTrigger 
                  value="javascript" 
                  className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none text-xs h-full px-4"
                >
                  script.js
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-7 w-7">
                   <Play className="w-3.5 h-3.5 text-muted-foreground" />
                 </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              <TabsContent value="html" className="h-full m-0 p-0 absolute inset-0">
                <CodeEditor value={html} language="html" onChange={setHtml} />
              </TabsContent>
              <TabsContent value="css" className="h-full m-0 p-0 absolute inset-0">
                <CodeEditor value={css} language="css" onChange={setCss} />
              </TabsContent>
              <TabsContent value="javascript" className="h-full m-0 p-0 absolute inset-0">
                <CodeEditor value={js} language="javascript" onChange={setJs} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Resizer */}
        <div 
          className={`z-20 flex items-center justify-center hover:bg-primary/20 transition-colors cursor-col-resize select-none bg-border/40
            ${layout === "split-v" ? "w-1 h-full cursor-col-resize" : "h-1 w-full cursor-row-resize"}
          `}
          onMouseDown={(e) => {
            setIsResizing(true);
            document.body.style.cursor = layout === "split-v" ? "col-resize" : "row-resize";
          }}
        >
          <div className={`${layout === "split-v" ? "w-4 h-8" : "w-8 h-4"} flex items-center justify-center`}>
            {layout === "split-v" ? <Columns className="w-3 h-3 text-muted-foreground" /> : <Rows className="w-3 h-3 text-muted-foreground" />}
          </div>
        </div>

        {/* Preview Side */}
        <div 
          className="flex-1 flex flex-col bg-background p-4 relative"
          style={{ 
            width: layout === "split-v" ? `${100 - splitPosition}%` : "100%",
            height: layout === "split-h" ? `${100 - splitPosition}%` : "100%",
          }}
        >
          <div className="mb-3 flex items-center justify-between text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Live Preview
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded">
                <button onClick={() => setDevice("mobile")} className={`hover:text-primary transition-colors ${device === "mobile" ? "text-primary" : ""}`}>
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDevice("tablet")} className={`hover:text-primary transition-colors ${device === "tablet" ? "text-primary" : ""}`}>
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDevice("desktop")} className={`hover:text-primary transition-colors ${device === "desktop" ? "text-primary" : ""}`}>
                  <Monitor className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center bg-[#1e2023] rounded-xl overflow-hidden border border-border/50 shadow-2xl">
            <PreviewFrame 
              html={html} 
              css={css} 
              js={js} 
              device={device}
            />
          </div>
        </div>
      </main>

      {/* AI Assistant Panel */}
      <AIChatPanel 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
        html={html}
        css={css}
        js={js}
        activeTab={activeTab as any}
      />
      
      {/* Footer Status Bar */}
      <footer className="h-6 border-t border-border bg-card flex items-center justify-between px-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Autosave active
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span>Spaces: 2</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{layout === "split-v" ? "Vertical Split" : "Horizontal Split"}</span>
          <span>V1.0.0</span>
        </div>
      </footer>
    </div>
  );
}
