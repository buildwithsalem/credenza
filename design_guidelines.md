# Credenza Design Guidelines

## Design Approach
**Reference-Based Approach** drawing inspiration from productivity leaders (Notion, Linear, Asana) with emphasis on clarity, focus, and data visualization. The aesthetic should feel calm, professional, and conducive to learning.

## Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Display/Headers**: Inter Bold (text-4xl to text-6xl)
- **Body Text**: Inter Regular (text-base to text-lg)
- **Small Text/Labels**: Inter Medium (text-sm to text-xs)
- **Data/Numbers**: Inter SemiBold for emphasis

## Layout System
**Spacing Units**: Consistently use Tailwind spacing of `4`, `6`, `8`, `12`, `16`, `20`, and `24` for all margins, padding, and gaps.

**Grid Strategy**:
- Dashboard: 3-column grid on desktop (lg:grid-cols-3), 1 column mobile
- Session cards: 2-column grid (md:grid-cols-2)
- Stats overview: 4-column grid for key metrics (lg:grid-cols-4, md:grid-cols-2)

**Container Widths**: Use max-w-7xl for main content areas with px-6 horizontal padding.

## Core Components

### Navigation
- **Top Navigation Bar**: Sticky header with logo left, main nav center, user profile right
- Height: h-16
- Include: Dashboard, Sessions, Goals, Insights, Settings
- Avatar/profile in top-right with dropdown menu

### Dashboard Layout
**Hero Section**: 
- Medium height (h-80) with gradient treatment
- Welcome message with user's current streak prominently displayed
- "Quick Log Session" CTA button with blurred background overlay
- Background: Abstract study/learning themed imagery (desk setup, books, modern study space)

**Stats Grid** (immediately below hero):
- 4 cards displaying: Total Hours Studied, Current Streak, Goals Completed, Sessions This Week
- Each card: Large number (text-3xl font-bold), small label below
- Spacing: gap-6

**Main Content Area** (2-column layout on desktop):
- **Left Column (2/3 width)**:
  - Recent Sessions list with timeline view
  - Each session card shows: subject badge, duration, timestamp, notes preview
  - "View All Sessions" link at bottom
  
- **Right Column (1/3 width)**:
  - Active Goals panel with progress bars
  - Quick insights widget ("You study most effectively in the morning")
  - Streak calendar mini-visualization

### Session Logging Interface
**Modal/Overlay Design**:
- Centered modal (max-w-2xl) with smooth backdrop blur
- Form fields: Subject (dropdown), Duration (time picker), Date, Notes (textarea)
- Large "Log Session" primary button
- Auto-save draft functionality indicator

### Progress Tracking Page
**Chart Section**:
- Full-width container with tabs: Daily, Weekly, Monthly
- Primary chart: Bar/line chart showing study hours over time
- Secondary chart: Subject breakdown (donut chart)
- Charts use smooth animations on load

**Subject Cards Grid**:
- 3-column grid showing each subject with total time, sessions count, avg session length
- Include small sparkline showing trend

### Goals Management
**Goal Cards**:
- Large cards (p-8) with progress visualization
- Goal type badge (daily/weekly/monthly)
- Circular progress indicator showing percentage
- Target vs. actual numbers clearly displayed
- "Edit Goal" and "Complete" action buttons

### Insights Dashboard
**Pattern Cards**:
- Timeline showing study patterns by time of day (heatmap style)
- Most productive days of week visualization
- Subject mastery progress with skill trees or progression bars
- Recommendations panel with actionable suggestions

## Images
**Hero Image**: Modern study environment - clean desk with laptop, books, natural light, plants. Warm, inviting, focused atmosphere. Place as full background of hero section with overlay.

**Empty States**: Illustrated graphics for "No sessions yet", "Set your first goal" - friendly, encouraging style.

**Subject Icons**: Use Heroicons library via CDN for subject categories (book, calculator, globe, etc.)

## Component Specifications

**Cards**: 
- Rounded corners (rounded-lg to rounded-xl)
- Subtle elevation with shadow-md
- Padding: p-6 for content cards

**Buttons**:
- Primary: Large (px-8 py-3), rounded-lg, font-medium
- Secondary: Outlined style, same sizing
- When on images: backdrop-blur-md with semi-transparent background

**Forms**:
- Input fields: Generous padding (px-4 py-3), rounded-md, full border
- Labels: text-sm font-medium, mb-2
- Focus states: ring treatment

**Progress Bars**:
- Height: h-2 to h-3
- Rounded ends (rounded-full)
- Smooth transitions on value changes

**Badges**:
- Small, rounded-full, px-3 py-1, text-xs font-medium
- Use for subject tags, goal types, streak indicators

## Data Visualization
- Use Chart.js library for all charts
- Consistent spacing: mb-8 between chart sections
- Legend positioning: bottom for horizontal space efficiency
- Tooltips: Show on hover with detailed breakdowns

## Accessibility
- All form inputs have associated labels
- Charts include ARIA labels
- Keyboard navigation for all interactive elements
- Focus indicators on all focusable elements
- Sufficient contrast ratios throughout

## Animations
**Minimal, Purposeful Use**:
- Page transitions: Subtle fade-in (200ms)
- Chart animations: Smooth entry on load (400ms ease-out)
- Modal open/close: Scale and fade (250ms)
- No scroll-triggered animations
- No continuous/looping animations