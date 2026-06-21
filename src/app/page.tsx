"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { 
  Play, 
  Code, 
  Eye, 
  Trash2, 
  Settings, 
  Zap, 
  Columns, 
  Rows, 
  Sparkles, 
  Smartphone, 
  Tablet, 
  Monitor,
  Globe,
  Files,
  Search,
  Github as GithubIcon,
  Layers,
  ChevronRight,
  ChevronDown,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { usePersistedState } from "@/hooks/use-persisted-state";
import PreviewFrame from "@/components/PreviewFrame";
import AIChatPanel from "@/components/AIChatPanel";
import { cn } from "@/lib/utils";

// Dynamically import CodeEditor to prevent SSR errors
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-muted-foreground">Loading editor...</div>
});

type ViewLayout = "split-v" | "split-h";
type DevicePreview = "mobile" | "tablet" | "desktop";
type Language = "es" | "en";

const DEFAULT_HTML = `<!-- Welcome to CodeCanvas -->
<div class="container">
  <h1>CodeCanvas Studio</h1>
  <p>Construye el futuro del desarrollo web con IA.</p>
  <button id="cta">Empezar ahora</button>
</div>`;

const DEFAULT_CSS = `body {
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0d0d0d;
  color: white;
  font-family: 'Inter', sans-serif;
}

.container {
  text-align: center;
  padding: 3rem;
  background: linear-gradient(145deg, #1a1a1a, #0a0a0a);
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

h1 {
  background: linear-gradient(to right, #00ffff, #7F7FE5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

button {
  background: #00ffff;
  color: #000;
  border: none;
  padding: 1rem 2rem;
  font-weight: bold;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
}`;

const DEFAULT_JS = `document.getElementById('cta').addEventListener('click', () => {
  alert('¡Bienvenido a la nueva era del desarrollo! 🚀');
});`;

export default function CodeCanvas() {
  const [html, setHtml] = usePersistedState("cc-html", DEFAULT_HTML);
  const [css, setCss] = usePersistedState("cc-css", DEFAULT_CSS);
  const [js, setJs] = usePersistedState("cc-js", DEFAULT_JS);
  const [language, setLanguage] = usePersistedState<Language>("cc-lang", "es");
  
  const [activeTab, setActiveTab] = useState("html");
  const [layout, setLayout] = useState<ViewLayout>("split-v");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    if (layout === "split-v") {
      const newPos = (e.clientX / window.innerWidth) * 100;
      setSplitPosition(Math.min(Math.max(newPos, 20), 80));
    } else {
      const newPos = (e.clientY / window.innerHeight) * 100;
      setSplitPosition(Math.min(Math.max(newPos, 20), 80));
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
    if (confirm(language === "es" ? "¿Estás seguro?" : "Are you sure?")) {
      setHtml(""); setCss(""); setJs("");
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d0d0d] text-foreground overflow-hidden font-body">
      {/* Activity Bar (Vertical Left) */}
      <aside className="w-12 bg-[#181818] border-r border-white/5 flex flex-col items-center py-4 gap-4 z-50">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mb-2">
          <Code className="text-primary w-5 h-5" />
        </div>
        <button 
          onClick={() => setIsExplorerOpen(!isExplorerOpen)}
          className={cn("p-2 transition-colors rounded-lg", isExplorerOpen ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
        >
          <Files size={20} />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <GithubIcon size={20} />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Layers size={20} />
        </button>
        <div className="mt-auto flex flex-col gap-4">
          <button 
            onClick={() => setIsAiOpen(true)}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all animate-pulse"
          >
            <Sparkles size={20} />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </aside>

      {/* Explorer Side Bar */}
      {isExplorerOpen && (
        <aside className="w-60 bg-[#121212] border-r border-white/5 flex flex-col animate-in slide-in-from-left duration-200">
          <div className="h-10 flex items-center px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {language === "es" ? "Explorador" : "Explorer"}
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-2">
              <div className="flex items-center gap-1 py-1 px-2 text-xs font-semibold text-muted-foreground/80">
                <ChevronDown size={14} />
                <span>CODECANVAS-PROJECT</span>
              </div>
              <div className="pl-4">
                <button 
                  onClick={() => setActiveTab("html")}
                  className={cn("flex items-center gap-2 w-full py-1.5 px-2 rounded-md text-xs transition-colors", activeTab === "html" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")}
                >
                  <span className="text-orange-500 font-bold">5</span> index.html
                </button>
                <button 
                  onClick={() => setActiveTab("css")}
                  className={cn("flex items-center gap-2 w-full py-1.5 px-2 rounded-md text-xs transition-colors", activeTab === "css" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")}
                >
                  <span className="text-blue-400 font-bold">#</span> styles.css
                </button>
                <button 
                  onClick={() => setActiveTab("javascript")}
                  className={cn("flex items-center gap-2 w-full py-1.5 px-2 rounded-md text-xs transition-colors", activeTab === "javascript" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")}
                >
                  <span className="text-yellow-400 font-bold">JS</span> script.js
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header/Tabs */}
        <header className="h-10 bg-[#121212] border-b border-white/5 flex items-center justify-between px-2">
          <div className="flex h-full items-center">
            {["html", "css", "javascript"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "h-full px-4 text-xs flex items-center gap-2 border-r border-white/5 transition-colors relative",
                  activeTab === tab 
                    ? "bg-[#1e1e1e] text-foreground after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                    : "text-muted-foreground hover:bg-white/5"
                )}
              >
                {tab === "html" && <span className="text-orange-500 text-[10px] font-bold">5</span>}
                {tab === "css" && <span className="text-blue-400 text-[10px] font-bold">#</span>}
                {tab === "javascript" && <span className="text-yellow-400 text-[10px] font-bold">JS</span>}
                {tab === "javascript" ? "script.js" : tab === "css" ? "styles.css" : "index.html"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Play size={14} fill="currentColor" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLanguage(language === "es" ? "en" : "es")}
              className="text-[10px] font-bold h-7"
            >
              <Globe className="w-3 h-3 mr-1" />
              {language === "es" ? "ES" : "EN"}
            </Button>
            <Button size="sm" className="h-7 bg-primary text-primary-foreground text-[10px] font-bold px-3">
              <Zap className="w-3 h-3 mr-1" />
              {language === "es" ? "DESPLEGAR" : "DEPLOY"}
            </Button>
          </div>
        </header>

        {/* Workspace Panels */}
        <div className={cn("flex-1 flex relative", layout === "split-h" ? "flex-col" : "flex-row")}>
          {/* Editor Area */}
          <div 
            className="overflow-hidden bg-[#1e1e1e]" 
            style={{ 
              width: layout === "split-v" ? `${splitPosition}%` : "100%",
              height: layout === "split-h" ? `${splitPosition}%` : "100%",
            }}
          >
            <div className="h-full w-full">
              {activeTab === "html" && <CodeEditor value={html} language="html" onChange={setHtml} />}
              {activeTab === "css" && <CodeEditor value={css} language="css" onChange={setCss} />}
              {activeTab === "javascript" && <CodeEditor value={js} language="javascript" onChange={setJs} />}
            </div>
          </div>

          {/* Draggable Divider */}
          <div 
            className={cn(
              "z-30 flex items-center justify-center hover:bg-primary/40 transition-colors select-none bg-black/40",
              layout === "split-v" ? "w-1 h-full cursor-col-resize" : "h-1 w-full cursor-row-resize"
            )}
            onMouseDown={() => setIsResizing(true)}
          >
            <div className={cn("bg-muted-foreground/20 rounded-full", layout === "split-v" ? "w-0.5 h-12" : "h-0.5 w-12")} />
          </div>

          {/* Preview Area */}
          <div 
            className="flex-1 bg-[#0d0d0d] flex flex-col p-4 overflow-hidden"
            style={{ 
              width: layout === "split-v" ? `${100 - splitPosition}%` : "100%",
              height: layout === "split-h" ? `${100 - splitPosition}%` : "100%",
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                <Eye size={12} />
                {language === "es" ? "Vista Previa" : "Live Preview"}
              </div>
              <div className="flex items-center gap-1 bg-[#181818] p-0.5 rounded-lg border border-white/5">
                <Button variant="ghost" size="icon" onClick={() => setDevice("mobile")} className={cn("h-6 w-6", device === "mobile" ? "text-primary bg-primary/10" : "text-muted-foreground")}>
                  <Smartphone size={12} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDevice("tablet")} className={cn("h-6 w-6", device === "tablet" ? "text-primary bg-primary/10" : "text-muted-foreground")}>
                  <Tablet size={12} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setDevice("desktop")} className={cn("h-6 w-6", device === "desktop" ? "text-primary bg-primary/10" : "text-muted-foreground")}>
                  <Monitor size={12} />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 relative flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
              <PreviewFrame html={html} css={css} js={js} device={device} />
            </div>
          </div>
        </div>

        {/* Professional Status Bar */}
        <footer className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] font-medium shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
              <GithubIcon size={12} />
              <span>main*</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap size={10} className="text-yellow-300" />
              <span>{language === "es" ? "Listo" : "Ready"}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
              <span>Ln 12, Col 42</span>
            </div>
            <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
              <span>Spaces: 2</span>
            </div>
            <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors">
              <span>UTF-8</span>
            </div>
            <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer transition-colors" onClick={() => setLayout(layout === "split-v" ? "split-h" : "split-v")}>
              {layout === "split-v" ? <Columns size={12} /> : <Rows size={12} />}
            </div>
          </div>
        </footer>
      </div>

      <AIChatPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} html={html} css={css} js={js} activeTab={activeTab as any} />
    </div>
  );
}
