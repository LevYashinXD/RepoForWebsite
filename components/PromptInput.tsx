
import React from 'react';
import { SendIcon } from './Icons';

interface PromptInputProps {
  prompt: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, onChange, onSubmit, isLoading, disabled }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && !disabled) {
        onSubmit();
      }
    }
  };
  
  return (
    <div className="space-y-3">
      <label htmlFor="prompt-input" className="block text-sm font-medium text-ios-light-textSecondary dark:text-ios-dark-textSecondary">
        Describe what the script should do:
      </label>
      <textarea
        id="prompt-input"
        rows={4}
        className="w-full p-3 bg-ios-light-panel dark:bg-ios-dark-panel border border-ios-light-border dark:border-ios-dark-border rounded-ios-sm shadow-sm focus:ring-1 focus:ring-ios-blue focus:border-ios-blue text-ios-light-textPrimary dark:text-ios-dark-textPrimary placeholder-ios-light-placeholder dark:placeholder-ios-dark-placeholder disabled:opacity-60 disabled:cursor-not-allowed text-base sm:text-sm"
        placeholder="e.g., 'Make a part that follows the player' or 'Create a GUI button that gives 10 gold'"
        value={prompt}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading || disabled}
      />
      <button
        onClick={onSubmit}
        disabled={isLoading || disabled || !prompt.trim()}
        className="w-full flex items-center justify-center px-4 py-2.5 bg-ios-blue hover:bg-opacity-85 text-white font-medium rounded-ios text-base sm:text-sm shadow-sm transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-ios-blue focus:ring-offset-2 focus:ring-offset-ios-light-bgSecondary dark:focus:ring-offset-ios-dark-bgSecondary disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
        aria-label="Generate Script"
      >
        <SendIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Generating...' : 'Generate Script'}
      </button>
    </div>
  );
};
