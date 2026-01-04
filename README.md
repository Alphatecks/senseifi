# Senseifi Frontend

Frontend application built with Next.js, TypeScript, and Tailwind CSS using MVVM architecture pattern.

## Architecture

This project follows the **MVVM (Model-View-ViewModel)** architecture pattern:

- **Models** (`/models`): Data structures, interfaces, and types
- **Views** (`/views`): React components (presentational layer)
- **ViewModels** (`/viewmodels`): Business logic, state management, and data transformation

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React 18**: UI library

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── models/                 # Data models and interfaces
├── views/                  # React components (Views)
│   └── components/        # Reusable components
├── viewmodels/            # Business logic and state management
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── styles/                # Additional stylesheets
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your environment variables.

