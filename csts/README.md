# Client Support Ticketing System

## Overview

This is a modern, full-stack client support ticketing system designed to help companies manage client complaints, service requests, and technical issues in an organized way. It features distinct, role-based dashboards for clients, support staff, and administrators, and integrates Google's Gemini AI to provide intelligent reply suggestions for support staff.

## Features

- **Role-Based Access Control**: Separate, secure login portals and dashboards for Clients, Staff, and Administrators.
- **Client Dashboard**: Clients can create new tickets, view their ticket history, and provide feedback on resolutions.
- **Staff Dashboard**: Staff can view all tickets, provide updates, and close tickets after client confirmation.
- **Admin Dashboard**: Admins have full oversight, with the ability to manage all tickets, clients, and staff members.
- **Interactive Ticket Lifecycle**: A clear workflow from "Open" to "Closed", including client confirmation of resolution.
- **AI-Powered Smart Replies**: Staff can generate contextual reply suggestions using the Google Gemini API to improve response time and quality.
- **Advanced Filtering**: Staff and Admins can search and filter the ticket list by status and priority.
- **Full-Stack Architecture**: Built with a React frontend, a Node.js/Express backend, and a MySQL database.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **AI Integration**: Google Gemini API

## Project Structure

The project is organized as a monorepo with three main directories:
- `/frontend`: Contains the Vite-powered React application.
- `/backend`: Contains the Node.js/Express API server.
- `/database`: Contains the MySQL database schema.

---

## Setup and Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- A running [MySQL](https://www.mysql.com/) server instance.

### 1. Installation

Clone the repository. You will need to install dependencies for the backend and frontend separately.

**Backend Installation:**
Navigate to the backend directory and install its dependencies:
```bash
cd backend
npm install
```

**Frontend Installation:**
From a new terminal, or after returning to the root (`cd ..`), navigate to the frontend directory and install its dependencies:
```bash
cd frontend
npm install
```

### 2. Database Setup

1.  Connect to your MySQL server.
2.  Create a new database for the application. For example: `CREATE DATABASE support_desk;`
3.  Run the SQL commands located in `database/schema.txt` to create the necessary tables (`Users`, `Tickets`, `Ticket_Updates`).

### 3. Backend Setup

1.  Navigate to the backend directory: `cd backend`
2.  Create a `.env` file by copying the example: `cp .env.example .env`
3.  Edit the `.env` file with your database credentials and a secure admin password:
    ```env
    # Database Configuration
    DB_HOST=localhost
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_NAME=support_desk

    # Server Configuration
    PORT=3001

    # Security
    ADMIN_PASSWORD=your_super_secret_admin_password
    ```

### 4. Frontend Setup

1.  Navigate to the frontend directory: `cd frontend`
2.  Create a `.env` file by copying the example: `cp .env.example .env`
3.  Edit the `.env` file with your Google Gemini API Key:
    ```env
    # Google Gemini API Key
    VITE_API_KEY=your_gemini_api_key_here
    ```

---

## Running the Application

You can run both the frontend and backend servers concurrently from the **root directory** with a single command:

```bash
npm run dev
```

Alternatively, you can run them in separate terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

- The frontend will be available at `http://localhost:5173` (or the next available port).
- The backend API will be running on `http://localhost:3001`.

## Available Routes & Login Credentials

- **Client Login**: `http://localhost:5173/login`
- **Staff Login**: `http://localhost:5173/staff/login`
- **Admin Login**: `http://localhost:5173/admin/login`

After setting up the database, you will need to create users. The Admin is the only one who can create new users. Use the Admin dashboard to create your first Client and Staff accounts. The default password for any user created via the UI is `password123`.

---

## Project Clean Up

To ensure your project structure is clean and free of redundant files from previous refactoring steps, you can safely remove the following files and directories if they exist in your project's root:

- `index.tsx`
- `metadata.json`
- `index.html`
- `App.tsx`
- `types.ts`
- `constants.ts`
- `services/` (entire directory)
- `components/` (entire directory)

Additionally, the following files within the `frontend` directory are obsolete and should be removed:

- `frontend/src/components/Dashboard.tsx` (This generic component was replaced by role-specific dashboards.)
- `frontend/src/pages/AdminAuth.tsx` (This was replaced by `frontend/src/pages/AdminLogin.tsx`.)
