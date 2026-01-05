# Health Time Clinic

A comprehensive clinic management system built with Next.js.

## Features

- **Doctor Dashboard**: Overview of clinic activities.
- **Patient Management**: Create, read, update, and delete patient records.
- **Measurement Tracking**: Track patient weight, waist, hips, and BMI over time.
- **Authentication**: Secure login for doctors.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: SQLite (via better-sqlite3)
- **Styling**: CSS Modules / Inline Styles
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js installed

### Setup

1.  **Database Setup**:
    - Run the setup script to create the local SQLite database (`healthtime.db`):
      ```bash
      node scripts/setup-db.js
      ```

2.  **Run the Application**:
    ```bash
    npm install
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

### Default Credentials

- **Username**: `doctor`
- **Password**: `healthtime`
