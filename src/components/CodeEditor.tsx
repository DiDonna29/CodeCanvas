"use client";

import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

interface CodeEditorProps {
  value: string;
  language: "html" | "css" | "javascript";
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const getExtensions = () => {
    switch (language) {
      case "html":
        return [html()];
      case "css":
        return [css()];
      case "javascript":
        return [javascript({ jsx: true })];
      default:
        return [html()];
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
      <CodeMirror
        value={value}
        height="100%"
        theme={vscodeDark}
        extensions={getExtensions()}
        onChange={(val) => onChange(val)}
        className="flex-1 text-sm font-code"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          crosshairCursor: true,
          highlightSelectionMatches: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentUnit: "  ",
        }}
      />
    </div>
  );
}
