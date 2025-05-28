
import React, { useState, useCallback, useEffect } from 'react';
import { ROBLOX_SECTIONS, AppIcon as AppTitleIcon } from './constants';
import type { RobloxSection, GeminiResponse } from './types';
import { SectionSelector } from './components/SectionSelector';
import { PromptInput } from './components/PromptInput';
import { GeneratedScriptDisplay } from './components/GeneratedScriptDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SunIcon, MoonIcon, AlertTriangleIcon, InfoIcon } from './components/Icons';
import { generateLuaScript, generateUniversalScripts } from './services/geminiService';

const App: React.FC = () => {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [scriptExplanation, setScriptExplanation] = useState<string>('');
  const [htmlPreviewForCurrentScript, setHtmlPreviewForCurrentScript] = useState<string | null>(null);
  
  const [generatedUniversalContent, setGeneratedUniversalContent] = useState<Record<string, { script: string, explanation: string, htmlPreview?: string }>>({});
  const [highlightedSectionIds, setHighlightedSectionIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const storedPreference = localStorage.getItem('darkMode');
      if (storedPreference) return storedPreference === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [apiKeyExists, setApiKeyExists] = useState<boolean>(false);
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  const selectedSection = selectedSectionId ? ROBLOX_SECTIONS.find(s => s.id === selectedSectionId) : null;

  useEffect(() => {
    if (process.env.API_KEY) {
      setApiKeyExists(true);
    } else {
      setApiKeyExists(false);
      setError("API_KEY environment variable is not set. Please configure it to use the AI features.");
    }
  }, []);
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  const findSectionDetailsByName = (name: string): RobloxSection | undefined => {
    const normalizedName = name.toLowerCase().trim();
    return ROBLOX_SECTIONS.find(s => s.name.toLowerCase() === normalizedName || s.id.toLowerCase() === normalizedName);
  };

  const handleSectionSelect = useCallback((section: RobloxSection) => {
    setSelectedSectionId(section.id);
    setError(null);
    setCopiedScriptId(null);
    setHtmlPreviewForCurrentScript(null); // Clear previous preview

    const universalContentForSection = generatedUniversalContent[section.id];
    if (universalContentForSection) {
      setGeneratedScript(universalContentForSection.script);
      setScriptExplanation(universalContentForSection.explanation);
      if (section.id === 'StarterGui' && universalContentForSection.htmlPreview) {
        setHtmlPreviewForCurrentScript(universalContentForSection.htmlPreview);
      }
      setHighlightedSectionIds(prev => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    } else {
      if (section.id !== 'Universal') {
        setGeneratedScript('');
        setScriptExplanation('');
      }
    }
    setUserPrompt(section.typicalPromptPlaceholder || '');
  }, [generatedUniversalContent]);


  const handleGenerateScript = async () => {
    if (!selectedSection || !userPrompt.trim() || !apiKeyExists) {
      setError("Please select a section, enter a prompt, and ensure API_KEY is configured.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setCopiedScriptId(null);
    
    setGeneratedScript('');
    setScriptExplanation('');
    setHtmlPreviewForCurrentScript(null);

    try {
      if (selectedSection.id === 'Universal') {
        const universalResult = await generateUniversalScripts(userPrompt);
        
        const newUniversalContentUpdates: Record<string, { script: string, explanation: string, htmlPreview?: string }> = {};
        const newHighlightedIdsUpdates = new Set<string>();
        let warnings = "";

        for (const item of universalResult.scripts) {
          const targetSectionDetails = findSectionDetailsByName(item.sectionName);
          if (targetSectionDetails) {
            newUniversalContentUpdates[targetSectionDetails.id] = { 
              script: item.script, 
              explanation: item.explanation,
              htmlPreview: item.htmlPreview // Will be undefined if not StarterGui or not provided
            };
            newHighlightedIdsUpdates.add(targetSectionDetails.id);
          } else {
            console.warn(`Universal script generated for unknown section: ${item.sectionName}`);
            warnings += ` Note: A script for an unrecognized section "${item.sectionName}" was generated and ignored.`;
          }
        }
        setGeneratedUniversalContent(prev => ({ ...prev, ...newUniversalContentUpdates }));
        setHighlightedSectionIds(prev => new Set([...prev, ...newHighlightedIdsUpdates]));
        
        if (warnings) {
            setError(prevError => (prevError ? prevError + ";" : "") + warnings.trim());
        }
        setUserPrompt(ROBLOX_SECTIONS.find(s => s.id === 'Universal')?.typicalPromptPlaceholder || '');

      } else { 
        const result: GeminiResponse = await generateLuaScript(userPrompt, selectedSection.name);
        setGeneratedScript(result.script);
        setScriptExplanation(result.explanation);
        if (selectedSection.id === 'StarterGui' && result.htmlPreview) {
          setHtmlPreviewForCurrentScript(result.htmlPreview);
        }
        
        setHighlightedSectionIds(prev => {
            const next = new Set(prev);
            next.delete(selectedSection.id);
            return next;
        });
        setGeneratedUniversalContent(prev => {
            const next = {...prev};
            delete next[selectedSection.id]; // Clear any old universal content for this specific section if we just generated a single one
            return next;
        });
      }
    } catch (err) {
      console.error("Error generating script(s):", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the script(s).");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (scriptContent: string, id: string) => {
    if (scriptContent) {
      navigator.clipboard.writeText(scriptContent)
        .then(() => {
          setCopiedScriptId(id);
          setTimeout(() => setCopiedScriptId(null), 2000);
        })
        .catch(err => {
          console.error('Failed to copy script: ', err);
          setError("Failed to copy script to clipboard.");
        });
    }
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen flex flex-col bg-ios-light-bg dark:bg-ios-dark-bg text-ios-light-textPrimary dark:text-ios-dark-textPrimary transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-ios-light-panel/80 dark:bg-ios-dark-panel/80 backdrop-blur-md border-b border-ios-light-border dark:border-ios-dark-border">
        <div className="container mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AppTitleIcon className="w-7 h-7 text-ios-blue" />
            <h1 className="text-lg font-semibold">Roblox LuaU Script Genie</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-ios-light-activeInput dark:hover:bg-ios-dark-activeInput focus:outline-none focus:ring-2 focus:ring-ios-blue"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5 text-ios-yellow" /> : <MoonIcon className="w-5 h-5 text-ios-blue" />}
          </button>
        </div>
      </header>

      {!apiKeyExists && (
        <div className="m-4 p-3 bg-ios-red/10 border border-ios-red text-ios-red rounded-ios flex items-center space-x-2 text-sm dark:bg-ios-red/20 dark:text-ios-red">
          <AlertTriangleIcon className="w-5 h-5"/>
          <span>Critical: API_KEY environment variable is not set. AI features are disabled.</span>
        </div>
      )}

      <div className="flex-grow flex flex-col md:flex-row container mx-auto p-0 md:p-4 gap-0 md:gap-4">
        <aside className="w-full md:w-72 lg:w-80 bg-ios-light-panel dark:bg-ios-dark-panel md:rounded-ios md:border border-ios-light-border dark:border-ios-dark-border overflow-y-auto md:max-h-[calc(100vh-6rem-2rem)] shrink-0">
          <SectionSelector
            sections={ROBLOX_SECTIONS}
            selectedSection={selectedSection}
            onSelect={handleSectionSelect}
            highlightedSectionIds={highlightedSectionIds}
          />
        </aside>

        <main className="flex-grow flex flex-col gap-4 p-4 md:p-0">
          {selectedSection ? (
            <>
              <div className="bg-ios-light-bgSecondary dark:bg-ios-dark-bgSecondary p-4 sm:p-6 rounded-ios shadow-sm border border-ios-light-border dark:border-ios-dark-border">
                <div className="flex items-center mb-3">
                  {React.createElement(selectedSection.icon, { className: "w-7 h-7 mr-2.5 text-ios-blue" })}
                  <h2 className="text-xl font-semibold text-ios-light-textPrimary dark:text-ios-dark-textPrimary">{selectedSection.name}</h2>
                </div>
                <p className="text-sm text-ios-light-textSecondary dark:text-ios-dark-textSecondary mb-4">{selectedSection.description}</p>
                <PromptInput
                  prompt={userPrompt}
                  onChange={setUserPrompt}
                  onSubmit={handleGenerateScript}
                  isLoading={isLoading}
                  disabled={!apiKeyExists}
                />
              </div>

              {isLoading && <LoadingSpinner />}
              
              {error && !isLoading && (
                <div className="p-3 bg-ios-red/10 border border-ios-red text-ios-red rounded-ios flex items-center space-x-2 text-sm dark:bg-ios-red/20 dark:text-ios-red">
                  <AlertTriangleIcon className="w-5 h-5" />
                  <span>Error: {error}</span>
                </div>
              )}

              {(generatedScript || scriptExplanation) && !isLoading && selectedSection.id !== 'Universal' && (
                <GeneratedScriptDisplay
                  script={generatedScript}
                  explanation={scriptExplanation}
                  sectionName={selectedSection.name}
                  onCopy={() => handleCopyToClipboard(generatedScript, `single-${selectedSection.id}`)}
                  isCopied={copiedScriptId === `single-${selectedSection.id}`}
                  htmlPreview={htmlPreviewForCurrentScript}
                />
              )}
              
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center bg-ios-light-bgSecondary dark:bg-ios-dark-bgSecondary p-6 rounded-ios shadow-sm border border-ios-light-border dark:border-ios-dark-border md:min-h-[300px]">
              <InfoIcon className="w-12 h-12 text-ios-blue mb-4" />
              <p className="text-lg text-ios-light-textSecondary dark:text-ios-dark-textSecondary">Select a section to begin.</p>
              <p className="text-sm text-ios-light-textTertiary dark:text-ios-dark-textTertiary mt-1">Choose a Roblox Studio section from the sidebar.</p>
            </div>
          )}
        </main>
      </div>
      <footer className="text-center p-4 text-xs text-ios-light-textTertiary dark:text-ios-dark-textTertiary border-t border-ios-light-border dark:border-ios-dark-border mt-auto">
        Powered by Gemini AI. For educational and illustrative purposes. Always review generated code.
      </footer>
    </div>
  );
};

export default App;