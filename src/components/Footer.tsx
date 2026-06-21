
"use client";

import React from "react";
import { Instagram, Github, Linkedin, ExternalLink, Copyright } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface FooterProps {
  language: "es" | "en";
}

const translations = {
  es: {
    developed: "Desarrollado por",
    rights: "Todos los derechos reservados",
    portfolio: "Portafolio (Próximamente)",
  },
  en: {
    developed: "Developed by",
    rights: "All rights reserved",
    portfolio: "Portfolio (Coming Soon)",
  },
};

export default function Footer({ language }: FooterProps) {
  const t = translations[language];

  return (
    <footer className="w-full bg-card border-t border-border py-4 px-6 z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Author Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground order-2 md:order-1">
          <Copyright className="w-4 h-4" />
          <p>
            {t.developed} <span className="font-bold text-primary">"John Di Donna"</span> @2024. {t.rights}.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-3 order-1 md:order-2">
          <Button variant="ghost" size="icon" asChild className="hover:text-[#E4405F] hover:bg-[#E4405F]/10">
            <a href="https://www.instagram.com/john.didonna/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:text-primary hover:bg-primary/10">
            <a href="https://github.com/DiDonna29" target="_blank" rel="noopener noreferrer" title="GitHub">
              <Github className="w-5 h-5" />
            </a>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hover:text-[#0A66C2] hover:bg-[#0A66C2]/10">
            <a href="https://www.linkedin.com/in/john-di-donna-607263295/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <Linkedin className="w-5 h-5" />
            </a>
          </Button>
          <Separator orientation="vertical" className="h-4 hidden sm:block" />
          <Button variant="outline" size="sm" className="text-xs border-accent/30 hover:border-accent hover:bg-accent/10 opacity-50 cursor-not-allowed">
            <ExternalLink className="w-3.5 h-3.5 mr-2" />
            {t.portfolio}
          </Button>
        </div>
      </div>
    </footer>
  );
}
