import React from 'react';

export interface RobloxSection {
  id: string;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  typicalPromptPlaceholder: string;
}

export interface GeminiResponse { // For single script generation
  script: string;
  explanation: string;
  htmlPreview?: string; // Optional HTML preview for StarterGui
}

// For Universal script generation
export interface UniversalScriptItem {
  sectionName: string; // e.g., "ServerScriptService", "StarterGui"
  script: string;
  explanation: string;
  htmlPreview?: string; // Optional HTML preview for StarterGui scripts
}

export interface UniversalGeminiResponse {
  scripts: UniversalScriptItem[];
}