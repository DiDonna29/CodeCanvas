
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Play, 
  Code, 
  Eye, 
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
  ChevronDown,
  Download,
  Plus,
  Upload,
  FileCode,
  X,
  Edit2,
  Trash2,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { usePersistedState } from "@/hooks/use-persisted-state";
import PreviewFrame from "@/components/PreviewFrame";
import AIChatPanel from "@/components/AIChatPanel";
import { cn } from "@/lib/utils";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#1e1e1e] flex items-center justify-center text-muted-foreground">Loading editor...</div>
});

type ViewLayout = "split-v" | "split-h";
type DevicePreview = "mobile" | "tablet" | "desktop";
type Language = "es" | "en";
type Theme = "light" | "dark";

interface VirtualFile {
  id: string;
  name: string;
  content: string;
}

const DEFAULT_FILES: VirtualFile[] = [
  {
    id: "1",
    name: "index.html",
    content: `<!-- Welcome to CodeCanvas -->
<div class="container">
  <h1>CodeCanvas Studio</h1>
  <p>Construye el futuro del desarrollo web con IA.</p>
  <button id="cta">Empezar ahora</button>
</div>`,
  },
  {
    id: "2",
    name: "styles.css",
    content: `body {
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
}`,
  },
  {
    id: "3",
    name: "script.js",
    content: `document.getElementById('cta')?.addEventListener('click', () => {
  alert('¡Bienvenido a la nueva era del desarrollo! 🚀');
});`,
  }
];

export default function CodeCanvas() {
  const [files, setFiles] = usePersistedState<VirtualFile[]>("cc-files", DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = usePersistedState<string>("cc-active-file", "1");
  const [language, setLanguage] = usePersistedState<Language>("cc-lang", "es");
  const [theme, setTheme] = usePersistedState<Theme>("cc-theme", "dark");
  
  const [layout, setLayout] = useState<ViewLayout>("split-v");
  const [device, setDevice] = useState<DevicePreview>("desktop");
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

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

  const handleCreateFile = () => {
    const newFile: VirtualFile = {
      id: Date.now().toString(),
      name: `new-file-${files.length + 1}.html`,
      content: "",
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) return;
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      setActiveFileId(newFiles[0].id);
    }
  };

  const handleRenameFile = (id: string) => {
    if (!newName.trim()) return;
    setFiles(files.map(f => f.id === id ? { ...f, name: newName } : f));
    setEditingFileId(null);
    setNewName("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newFile: VirtualFile = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content,
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsText(file);
    });
  };

  const handleDownloadAction = async (format: "individual" | "zip") => {
    if (format === "zip") {
      const zip = new JSZip();
      files.forEach(f => zip.file(f.name, f.content));
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "codecanvas-project.zip");
    } else {
      files.forEach(f => {
        const blob = new Blob([f.content], { type: "text/plain;charset=utf-8" });
        saveAs(blob, f.name);
      });
    }
    setDownloadDialogOpen(false);
  };

  const handleDownloadRequest = () => {
    if (files.length > 5) {
      handleDownloadAction("zip");
    } else {
      setDownloadDialogOpen(true);
    }
  };

  const updateActiveFileContent = (newContent: string) => {
    setFiles(files.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const getLanguageFromFilename = (name: string) => {
    if (name.endsWith(".html")) return "html";
    if (name.endsWith(".css")) return "css";
    if (name.endsWith(".js")) return "javascript";
    return "html";
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-body transition-colors duration-300">
      <aside className="w-12 bg-secondary/50 border-r border-border flex flex-col items-center py-4 gap-4 z-50">
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
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
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

      {isExplorerOpen && (
        <aside className="w-64 bg-secondary/30 border-r border-border flex flex-col animate-in slide-in-from-left duration-200">
          <div className="h-10 flex items-center px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b">
            {language === "es" ? "Explorador" : "Explorer"}
          </div>
          <div className="p-3 space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs font-semibold" onClick={handleCreateFile}>
              <Plus size={14} /> {language === "es" ? "Nuevo Archivo" : "New File"}
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs font-semibold" onClick={() => fileInputRef.current?.click()}>
              <Upload size={14} /> {language === "es" ? "Subir Archivos" : "Upload Files"}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileUpload} />
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 h-8 text-xs font-semibold" onClick={handleDownloadRequest}>
              <Download size={14} /> {language === "es" ? "Descargar Todo" : "Download All"}
            </Button>
          </div>
          <Separator />
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-2">
              <div className="flex items-center gap-1 py-1 px-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-tighter">
                <ChevronDown size={14} />
                <span>workspace</span>
              </div>
              <div className="space-y-0.5">
                {files.map((file) => (
                  <div key={file.id} className="group relative">
                    {editingFileId === file.id ? (
                      <div className="px-2 py-1">
                        <Input 
                          autoFocus
                          className="h-6 text-xs"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          onBlur={() => handleRenameFile(file.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameFile(file.id)}
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => setActiveFileId(file.id)}
                        className={cn(
                          "flex items-center gap-2 w-full py-1.5 px-3 rounded-md text-xs transition-colors pr-16",
                          activeFileId === file.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <FileCode size={14} className={cn(
                          file.name.endsWith(".html") ? "text-orange-500" : 
                          file.name.endsWith(".css") ? "text-blue-400" : 
                          file.name.endsWith(".js") ? "text-yellow-500" : "text-muted-foreground"
                        )} />
                        <span className="truncate">{file.name}</span>
                      </button>
                    )}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-background/80 backdrop-blur-sm p-0.5 rounded border">
                      <button 
                        onClick={() => { setEditingFileId(file.id); setNewName(file.name); }}
                        className="p-1 hover:text-primary transition-colors"
                      >
                        <Edit2 size={10} />
                      </button>
                      <button 
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 hover:text-destructive transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-10 bg-secondary/20 border-b border-border flex items-center justify-between px-2">
          <div className="flex h-full items-center overflow-x-auto no-scrollbar">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={cn(
                  "h-full px-4 text-xs flex items-center gap-2 border-r border-border transition-colors relative min-w-max",
                  activeFileId === file.id 
                    ? "bg-background text-foreground after:absolute after:top-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <FileCode size={12} className={cn(
                  file.name.endsWith(".html") ? "text-orange-500" : 
                  file.name.endsWith(".css") ? "text-blue-400" : 
                  file.name.endsWith(".js") ? "text-yellow-500" : ""
                )} />
                {file.name}
                {files.length > 1 && (
                  <X 
                    size={10} 
                    className="ml-2 opacity-0 group-hover:opacity-100 hover:text-destructive" 
                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.id); }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 px-2">
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
            <Button 
              size="sm" 
              onClick={handleDownloadRequest}
              className="h-7 bg-primary text-primary-foreground text-[10px] font-bold px-3 transition-transform active:scale-95"
            >
              <Download className="w-3 h-3 mr-1" />
              {language === "es" ? "DESPLEGAR" : "DEPLOY"}
            </Button>
          </div>
        </header>

        <div className={cn("flex-1 flex relative", layout === "split-h" ? "flex-col" : "flex-row")}>
          <div 
            className="overflow-hidden bg-[#1e1e1e]" 
            style={{ 
              width: layout === "split-v" ? `${splitPosition}%` : "100%",
              height: layout === "split-h" ? `${splitPosition}%` : "100%",
            }}
          >
            <div className="h-full w-full">
              <CodeEditor 
                value={activeFile.content} 
                language={getLanguageFromFilename(activeFile.name)} 
                onChange={updateActiveFileContent} 
              />
            </div>
          </div>

          <div 
            className={cn(
              "z-30 flex items-center justify-center hover:bg-primary/40 transition-colors select-none bg-black/40",
              layout === "split-v" ? "w-1 h-full cursor-col-resize" : "h-1 w-full cursor-row-resize"
            )}
            onMouseDown={() => setIsResizing(true)}
          >
            <div className={cn("bg-muted-foreground/20 rounded-full", layout === "split-v" ? "w-0.5 h-12" : "h-0.5 w-12")} />
          </div>

          <div 
            className="flex-1 bg-background flex flex-col p-4 overflow-hidden"
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
              <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border">
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
            
            <div className="flex-1 relative flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden border border-border shadow-2xl">
              <PreviewFrame 
                files={files}
                device={device} 
              />
            </div>
          </div>
        </div>

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
              <span>{activeFile.name}</span>
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

      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{language === "es" ? "Opciones de Descarga" : "Download Options"}</DialogTitle>
            <DialogDescription>
              {language === "es" 
                ? "¿Cómo deseas descargar los archivos de tu proyecto?" 
                : "How would you like to download your project files?"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="flex-col gap-2 h-24" onClick={() => handleDownloadAction("individual")}>
              <Files className="w-8 h-8" />
              <span>{language === "es" ? "Individuales" : "Individual Files"}</span>
            </Button>
            <Button variant="outline" className="flex-col gap-2 h-24" onClick={() => handleDownloadAction("zip")}>
              <Download className="w-8 h-8" />
              <span>{language === "es" ? "Archivo ZIP" : "ZIP Archive"}</span>
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setDownloadDialogOpen(false)}>
              {language === "es" ? "Cancelar" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AIChatPanel isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} html={files.find(f => f.name === "index.html")?.content || ""} css={files.find(f => f.name === "styles.css")?.content || ""} js={files.find(f => f.name === "script.js")?.content || ""} activeTab={getLanguageFromFilename(activeFile.name) as any} />
    </div>
  );
}
