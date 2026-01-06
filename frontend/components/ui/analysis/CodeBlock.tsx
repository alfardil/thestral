"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect } from "react";

interface CodeBlockProps {
  code: string;
  language: string;
}

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "jsx",
  "tsx",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "go",
  "rust",
  "php",
  "ruby",
  "swift",
  "kotlin",
  "scala",
  "sql",
  "html",
  "css",
  "json",
  "yaml",
  "xml",
  "bash",
  "shell",
  "sh",
  "markdown",
  "md",
  "diff",
  "text",
  "plaintext",
];

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative rounded-lg overflow-hidden my-4 bg-[#18181B] p-4">
        <div className="absolute top-0 right-0 px-4 py-1 text-xs text-white/50 bg-white/5 rounded-bl">
          {language}
        </div>
        <pre className="text-sm font-mono text-white/90 whitespace-pre-wrap break-words overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  const normalizedLanguage = language.toLowerCase();
  const isValidLanguage = SUPPORTED_LANGUAGES.includes(normalizedLanguage);
  const displayLanguage = isValidLanguage ? normalizedLanguage : "text";

  try {
    return (
      <div className="relative rounded-lg overflow-hidden my-4">
        <div className="absolute top-0 right-0 px-4 py-1 text-xs text-white/50 bg-white/5 rounded-bl z-10">
          {language}
        </div>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={displayLanguage}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              borderRadius: "0.5rem",
              background: "#18181B",
              padding: "1rem",
              fontSize: "0.875rem",
              lineHeight: "1.5",
            }}
            className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            PreTag="div"
            codeTagProps={{
              style: {
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              },
            }}
            wrapLongLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="relative rounded-lg overflow-hidden my-4 bg-[#18181B] p-4">
        <div className="absolute top-0 right-0 px-4 py-1 text-xs text-white/50 bg-white/5 rounded-bl">
          {language}
        </div>
        <pre className="text-sm font-mono text-white/90 whitespace-pre-wrap break-words overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    );
  }
}
