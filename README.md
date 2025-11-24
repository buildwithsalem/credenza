# Credenza - Study Session Tracker & Learning Analytics

## Overview

Credenza is a full-stack web application designed to help students track their study sessions, set learning goals, and gain insights into their study patterns. The application provides a clean, productivity-focused interface for logging study sessions, monitoring progress toward goals, and visualizing learning analytics through charts and statistics.

The application is built as a monorepo with a React frontend and Express backend, using TypeScript throughout. It follows modern web development practices with a focus on type safety, developer experience, and user interface polish.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, chosen for fast hot module replacement and optimized builds
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management, data fetching, and caching

**UI Component System**
- Shadcn UI component library with Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows the "New York" style variant from Shadcn
- Custom color system using HSL values with CSS variables for theming
- Inter font family from Google Fonts for all typography

**State Management Strategy**
- Server state managed through TanStack Query with infinite stale time (no automatic refetching)
- Local UI state managed with React hooks (useState, useContext)
- Theme state persisted to localStorage via custom ThemeProvider context
- Form state managed by React Hook Form with Zod schema validation

**Key Design Decisions**
- Component aliasing configured for clean imports (@/components, @/lib, @/hooks)
- No Server-Side Rendering (SSR) - pure client-side React application
- Dark/light theme support via CSS class-based theming system
- Mobile-responsive design with Tailwind breakpoints (md:, lg:)
- Design follows productivity app aesthetics inspired by Notion, Linear, and Asana

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript with ESM modules for type safety and modern JavaScript features
- Separate entry points for development (index-dev.ts) and production (index-prod.ts)

**Development vs Production**
- Development mode uses Vite middleware for HMR and dynamic HTML transformation
- Production mode serves pre-built static assets from dist/public
- Custom logging middleware tracks API request duration and responses

**API Design**
- RESTful JSON API with conventional HTTP methods (GET, POST)
- Centralized error handling with consistent error response format
- Request body validation using Zod schemas with human-readable error messages (via zod-validation-error)
- Raw request body capture for potential webhook integrations

**Storage Layer**
- In-memory storage implementation (MemStorage class) for development/demo purposes
- Interface-based design (IStorage) allows for future database integration without changing route handlers
- Database schema defined using Drizzle ORM with PostgreSQL dialect
- Drizzle Kit configured for migrations with schema in shared/schema.ts

### Data Model & Schema

**Core Entities**
- **Sessions**: Study sessions with subject, duration (minutes), date, and optional notes
- **Goals**: Time-based goals with type (daily/weekly/monthly), target hours, title, and date range
- **Statistics**: Calculated metrics (total hours, current streak, weekly sessions, goals completed)
- **Insights**: Analyzed data including subject breakdown, time patterns, and study trends

**Schema Design Decisions**
- UUIDs for primary keys (gen_random_uuid() in PostgreSQL)
- Timestamp fields for temporal data (session dates, goal ranges)
- Text fields for flexible content (subject names, notes, goal titles)
- Integer storage for durations in minutes (avoids floating-point precision issues)
- Zod schemas derived from Drizzle tables using createInsertSchema for type consistency

**Data Flow**
- Client submits form data → Validated against Zod schema → Sent to API
- API validates again server-side → Storage layer creates/retrieves data
- Response sent back as JSON → React Query caches and provides to components
- Statistics and insights calculated on-demand from session data

### External Dependencies

**Database**
- Neon Serverless PostgreSQL as the production database (configured via DATABASE_URL environment variable)
- Drizzle ORM for schema definition and future query building
- connect-pg-simple for PostgreSQL session storage capability (installed but not yet implemented)

**UI Libraries**
- Radix UI primitives: Comprehensive collection of headless, accessible components (dialog, dropdown, select, accordion, etc.)
- Recharts for data visualization (bar charts, line charts, pie charts)
- date-fns for date manipulation and formatting
- Embla Carousel for carousel/slider functionality
- cmdk for command palette patterns

**Form Management**
- React Hook Form for performant form state management
- @hookform/resolvers for Zod schema integration
- drizzle-zod for generating Zod schemas from database tables

**Development Tools**
- Replit-specific Vite plugins for runtime error overlay, cartographer, and dev banner (disabled in production)
- esbuild for bundling the production server
- TypeScript for type checking (noEmit mode, types handled by bundler)

**Styling & Theming**
- Tailwind CSS with PostCSS and Autoprefixer
- class-variance-authority (CVA) for variant-based component styling
- clsx and tailwind-merge (via cn utility) for conditional class composition

**API & Networking**
- Custom fetch-based API client with credential inclusion for session cookies
- TanStack Query for declarative data fetching with automatic cache management
- No explicit REST client library (uses native fetch API)