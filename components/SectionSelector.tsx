
import React from 'react';
import type { RobloxSection } from '../types';

interface SectionSelectorProps {
  sections: RobloxSection[];
  selectedSection: RobloxSection | null;
  onSelect: (section: RobloxSection) => void;
  highlightedSectionIds?: Set<string>; // New prop
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({ sections, selectedSection, onSelect, highlightedSectionIds }) => {
  return (
    <div className="py-2 md:py-0">
      <h3 className="text-xs font-medium uppercase text-ios-light-textSecondary dark:text-ios-dark-textSecondary px-4 pt-4 pb-2 md:hidden">
        Roblox Sections
      </h3>
      <ul className="space-y-0">
        {sections.map((section) => {
          const isHighlighted = highlightedSectionIds?.has(section.id);
          return (
            <li key={section.id} className="border-b border-ios-light-separator dark:border-ios-dark-separator last:border-b-0">
              <button
                onClick={() => onSelect(section)}
                className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors duration-150 ease-in-out
                            focus:outline-none group relative
                            ${selectedSection?.id === section.id 
                              ? 'bg-ios-blue/10 dark:bg-ios-blue/20' 
                              : 'hover:bg-ios-light-activeInput/50 dark:hover:bg-ios-dark-activeInput/50'}`}
                aria-current={selectedSection?.id === section.id ? "page" : undefined}
              >
                <div className={`p-1.5 rounded-md ${selectedSection?.id === section.id ? 'bg-ios-blue' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <section.icon 
                    className={`w-5 h-5 ${selectedSection?.id === section.id ? 'text-white' : 'text-ios-light-textSecondary dark:text-ios-dark-textSecondary group-hover:text-ios-blue'}`} 
                  />
                </div>
                
                <div className="flex-grow flex items-center">
                  <span className={`font-medium text-sm ${selectedSection?.id === section.id ? 'text-ios-blue dark:text-ios-blue' : 'text-ios-light-textPrimary dark:text-ios-dark-textPrimary'}`}>
                    {section.name}
                  </span>
                  {isHighlighted && (
                    <span 
                      className="ml-2 w-2 h-2 bg-ios-blue rounded-full shrink-0" 
                      aria-label="New script generated for this section"
                    ></span>
                  )}
                </div>

                 {selectedSection?.id === section.id && (
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-ios-blue shrink-0 ml-auto">
                     <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                   </svg>
                 )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
