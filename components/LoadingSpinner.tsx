
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center p-8 space-y-3 bg-ios-light-bgSecondary dark:bg-ios-dark-bgSecondary rounded-ios shadow-sm border border-ios-light-border dark:border-ios-dark-border">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-ios-blue"></div>
      <p className="text-sm text-ios-light-textSecondary dark:text-ios-dark-textSecondary">Generating script, please wait...</p>
    </div>
  );
};
