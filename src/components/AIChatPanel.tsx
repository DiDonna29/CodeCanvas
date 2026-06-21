
"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Sparkles, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiCodeAssistant } from "@/ai/flows/ai-code-assistant";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  js: string;
  activeTab: "html" | "css" | "javascript";
}

export default function AIChatPanel({ isOpen, onClose, html, css, js, activeTab }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your CodeCanvas AI assistant. How can I help you improve your code today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await aiCodeAssistant({
        userQuery: input,
        htmlCode: html,
        cssCode: css,
        jsCode: js,
        activeEditor: activeTab
      });

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.aiResponse
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-card border-l border-border z-[100] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary w-5 h-5" />
          <span className="font-bold">AI Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {msg.role === "assistant" ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-muted text-foreground rounded-tl-none"
              }`}>
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="bg-muted text-foreground rounded-2xl rounded-tl-none px-4 py-2 text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border bg-background">
        <div className="relative">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI for suggestions..."
            className="pr-12 bg-card border-border focus:ring-primary h-11"
          />
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-1 top-1 h-9 w-9 text-primary"
          >
            <Send size={18} />
          </Button>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          Powered by CodeCanvas AI Assistant
        </p>
      </div>
    </div>
  );
}
