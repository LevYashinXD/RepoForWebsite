
import React, { useEffect, useRef } from 'react';
import { CopyIcon, CheckIcon } from './Icons';
import hljs from 'highlight.js/lib/core';
import lua from 'highlight.js/lib/languages/lua';

// Register the Lua language with highlight.js
hljs.registerLanguage('lua', lua);

interface GeneratedScriptDisplayProps {
  script: string;
  explanation: string;
  sectionName: string;
  onCopy: () => void;
  isCopied: boolean;
  htmlPreview?: string | null; // New prop for HTML preview
}

export const GeneratedScriptDisplay: React.FC<GeneratedScriptDisplayProps> = ({ script, explanation, sectionName, onCopy, isCopied, htmlPreview }) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      if (script) {
        codeRef.current.textContent = script;
        try {
          hljs.highlightElement(codeRef.current);
        } catch (error) {
          console.error("Syntax highlighting failed:", error);
          // Fallback: The code will be displayed without highlighting
          // or with whatever highlighting was applied before the error.
        }
      } else {
        codeRef.current.textContent = "// No script generated.";
        try {
          hljs.highlightElement(codeRef.current); // Highlight the placeholder text too
        } catch (error) {
          console.error("Syntax highlighting for placeholder failed:", error);
        }
      }
    }
  }, [script]);

  if (!script && !explanation && !htmlPreview) return null;

  return (
    <div className="bg-ios-light-bgSecondary dark:bg-ios-dark-bgSecondary p-4 sm:p-6 rounded-ios shadow-sm border border-ios-light-border dark:border-ios-dark-border space-y-5">
      {script && (
        <div>
          <h3 className="text-lg font-semibold text-ios-light-textPrimary dark:text-ios-dark-textPrimary mb-2">
            Script for <span className="text-ios-blue">{sectionName}</span>
          </h3>
          <div className="relative bg-gray-800 dark:bg-black p-3.5 rounded-ios-sm border border-ios-light-border dark:border-ios-dark-border">
            <button
              onClick={onCopy}
              className="absolute top-2 right-2 z-10 p-1.5 bg-gray-700/70 dark:bg-gray-200/20 hover:bg-gray-600/70 dark:hover:bg-gray-100/30 rounded-md text-gray-200 dark:text-gray-300 transition-colors focus:outline-none focus:ring-1 focus:ring-ios-blue"
              title="Copy script"
              aria-label={isCopied ? "Script copied" : "Copy script to clipboard"}
            >
              {isCopied ? <CheckIcon className="w-5 h-5 text-ios-green" /> : <CopyIcon className="w-5 h-5" />}
            </button>
            <pre className="whitespace-pre-wrap break-all text-sm font-mono overflow-x-auto max-h-96 custom-code-scrollbar">
              <code ref={codeRef} className="language-lua hljs">
                {/* Content is set by useEffect to enable highlighting */}
              </code>
            </pre>
          </div>
        </div>
      )}

      {explanation && (
        <div>
          <h3 className="text-lg font-semibold text-ios-light-textPrimary dark:text-ios-dark-textPrimary mb-2">Explanation for {sectionName} script</h3>
          <div className="bg-ios-light-panel dark:bg-ios-dark-panel p-3.5 rounded-ios-sm border border-ios-light-border dark:border-ios-dark-border text-ios-light-textPrimary dark:text-ios-dark-textPrimary text-sm leading-relaxed">
            <p>{explanation}</p>
          </div>
        </div>
      )}

      {htmlPreview && sectionName === 'StarterGui' && (
        <div>
          <h3 className="text-lg font-semibold text-ios-light-textPrimary dark:text-ios-dark-textPrimary mb-2">
            GUI Preview for <span className="text-ios-blue">{sectionName}</span>
          </h3>
          <div className="bg-ios-light-panel dark:bg-ios-dark-panel p-3.5 rounded-ios-sm border border-ios-light-border dark:border-ios-dark-border">
            {/* The AI is instructed to provide a root div with specific dimensions and styles */}
            <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
          </div>
           <p className="mt-2 text-xs text-ios-light-textSecondary dark:text-ios-dark-textSecondary">
            Note: This is a simplified HTML-based visual preview and may not perfectly represent all aspects of the Roblox GUI.
          </p>
        </div>
      )}
    </div>
  );
};
