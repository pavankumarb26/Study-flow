# StudyFlow — Deep Work & Study Tracker

StudyFlow is a modern, premium SaaS-grade productivity and study time tracking web application. It is designed to track actual deep study time with exact millisecond accuracy, zero drift, and full support for pauses, browser restarts, tab hibernation, and calendar midnight crossing.

---

## Features

### 1. Robust Study Timer & State Recovery
- **Timestamp & Interval Based**: Unlike naive `setInterval` counters that drift or stop when tabs sleep, StudyFlow records precise active start/end timestamps.
- **Accurate Tab & Sleep Handling**: Reopening a tab, waking a sleeping laptop, or switching windows calculates elapsed active duration dynamically from system time.
- **Pause & Break Isolation**: Paused periods are never counted toward study time.
- **Accidental Closure Recovery**: Running and paused session states persist immediately in `localStorage` and resume without losing a single second.
- **Safety Threshold**: Sessions under 5 seconds are prevented from saving as empty sessions.

### 2. Midnight Splitting & Daily Reset
- **Active Interval Splitting**: When an active study session crosses midnight (e.g. 11:30 PM to 1:15 AM), the active duration is sliced into its respective local calendar days:
  - Day 1 (11:30 PM – 12:00 AM) receives 30 minutes.
  - Day 2 (12:00 AM – 1:15 AM) receives 75 minutes.
- **Paused Midnight Crossing**: If a timer is paused across midnight, paused time contributes 0 milliseconds to both days.
- **Automatic Day Rollover**: Today's study time resets to `00:00:00` when a new day arrives, without deleting historical records.
- **Continuous Date Boundaries**: Date computations use continuous local timestamps (`00:00:00.000` to the next day's `00:00:00.000`) ensuring 100% mathematical precision.

### 3. Analytics & Dashboard
- **Aggregate Stat Cards**: Today's total, This week's total (Monday to Sunday), and This month's total.
- **Daily Goal Progress Bar**: Visual progress indicator towards your customizable target (in hours), with celebration badge when completed.
- **7-Day Study Bar Chart**: Interactive Recharts bar chart showing daily focus hours for the last 7 days.
- **Subject Distribution Chart**: Interactive donut breakdown by subject with percentages and hours.
- **Recent Sessions Feed**: Quick view of recent sessions with subjects, start/end timestamps, and duration.

### 4. Subject Organization
- Supported default subjects:
  - `DSA`
  - `AI/ML`
  - `RAG & LLMs`
  - `College Subjects`
  - `Other`
- Supports custom subject creation on the fly with consistent color palette assignment.

### 5. Study History & Logs
- Filter sessions by date range (Today, Last 7 Days, Last 30 Days, All Time, or Custom Date Range).
- Filter sessions by subject.
- Search sessions by notes or subject keywords.
- Summary statistics for filtered views (total filtered time, session count, average duration).
- Delete session with safety confirmation modal (immediately recalculates all statistics).
- Manual past study logging modal.

### 6. Settings & Data Portability
- Customizable daily study goal (in hours/day).
- Theme toggle: Dark (default), Light, and System.
- Sound effects toggle (synthesized via Web Audio API, no external audio files required).
- JSON backup export & restore for data ownership.
- Clear all data with safety confirmation modal.

---

## Tech Stack
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Persistence**: Browser `localStorage` (with error boundary and fallback)

---

## Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```
