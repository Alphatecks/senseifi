// Models - Data structures and types
// This directory contains the data models and interfaces used throughout the application

export interface BaseModel {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Example model - replace with your actual models
export interface ExampleModel extends BaseModel {
  name: string;
  description?: string;
}

