// Views - React Components
// This directory contains all React components (Views)
// Views should be presentational and use ViewModels for business logic

import React from 'react';

// Example component - replace with your actual components
export interface ExampleComponentProps {
  title: string;
  description?: string;
}

export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  description,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      {description && (
        <p className="mt-2 text-gray-600">{description}</p>
      )}
    </div>
  );
};

