# Cantine Management System - Frontend

## Description
Frontend application for the Cantine Management System, providing a user interface for stock management, meal planning, beneficiary tracking, and attendance recording.

## Features
- User authentication
- Role-based access control
- Stock management interface
- Recipe management
- Meal planning
- Beneficiary tracking
- Attendance recording

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env.example to .env and update values
# Required variables:
# - NEXT_PUBLIC_API_URL (default: http://localhost:4000/api)
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Project Structure
- `app/`: Next.js application pages and layouts
- `components/`: React components organized by feature and UI elements
- `contexts/`: React context providers (auth-context)
- `hooks/`: Custom React hooks
- `lib/`: Utility functions
- `public/`: Static assets
- `services/`: API service functions
- `styles/`: Global CSS styles

## Technologies
- Next.js 15.2.4
- React 19
- TailwindCSS
- Shadcn UI (based on Radix UI)
- TypeScript