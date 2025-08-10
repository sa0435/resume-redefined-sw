# Overview

Resume Refine is an AI-powered resume analysis application that provides comprehensive feedback and scoring for resumes. The application features a space-themed UI with cosmic animations and offers personalized resume critiques, ATS optimization suggestions, and detailed feedback across multiple categories including grammar, formatting, content, and skills analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Full-Stack Architecture
The application follows a modern full-stack architecture with a clear separation between frontend and backend components:

- **Frontend**: React-based single-page application built with Vite
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Frontend Architecture
The client application is built using React with TypeScript and follows a component-based architecture:

- **UI Framework**: Extensive use of Radix UI primitives wrapped in custom shadcn/ui components
- **Styling System**: Tailwind CSS with custom CSS variables for theming, featuring a dark space theme
- **Component Structure**: Organized into reusable UI components and page-specific components
- **Custom Components**: Specialized components like `MagicBento`, `CosmicProgress`, `GalaxyBackground`, and `SplitText` for enhanced visual effects
- **Form Handling**: React Hook Form with Zod validation
- **Animation**: GSAP for complex animations and CSS transitions for basic interactions

## Backend Architecture
The server follows a modular Express.js architecture:

- **Route Structure**: Centralized route registration in `routes.ts`
- **Storage Layer**: Abstract storage interface (`IStorage`) with in-memory implementation (`MemStorage`)
- **Service Layer**: OpenAI integration service for AI-powered resume analysis
- **Middleware**: Request logging, error handling, and body parsing
- **Development Setup**: Vite integration for hot module reloading in development

## Database Design
Using Drizzle ORM with PostgreSQL for type-safe database operations:

- **Users Table**: Basic user authentication with username/password
- **Resume Analyses Table**: Stores analysis results with JSON feedback structure
- **Schema Validation**: Zod schemas for runtime validation and type inference
- **Migration System**: Drizzle Kit for schema migrations

## AI Integration
OpenAI GPT-4o integration for resume analysis:

- **Analysis Categories**: Grammar, ATS compatibility, formatting, content, and skills
- **Scoring System**: 0-100 scoring across all categories with overall score calculation
- **Contextual Analysis**: Optional job description input for targeted feedback
- **Structured Response**: JSON-formatted feedback with actionable suggestions

## Development Experience
Optimized for modern development workflows:

- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Quality**: ESBuild for fast server bundling
- **Hot Reloading**: Development server with live reload capabilities
- **Path Aliases**: Configured import aliases for clean code organization

## UI/UX Design System
Space-themed design with emphasis on visual appeal:

- **Color Palette**: Cosmic purple, stellar cyan, and galaxy pink with dark backgrounds
- **Typography**: JetBrains Mono for a technical/coding aesthetic
- **Interactive Elements**: Hover effects, click animations, and smooth transitions
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: Proper ARIA labels and keyboard navigation support

# External Dependencies

## Database & ORM
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle ORM**: Type-safe database queries and schema management
- **Drizzle Kit**: Database migration and schema management tools

## AI Services
- **OpenAI API**: GPT-4o model for resume analysis and feedback generation

## UI & Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **GSAP**: Advanced animation library for complex visual effects
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer

## State Management & HTTP
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition

## Additional Libraries
- **date-fns**: Date manipulation and formatting
- **clsx & class-variance-authority**: Conditional className utilities
- **nanoid**: Unique ID generation
- **connect-pg-simple**: PostgreSQL session store (for future session management)
