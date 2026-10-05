# Friday AI Desk — Client

Friday AI Desk Client is the frontend application for the Friday AI Desk platform. It provides the user-facing dashboard, onboarding experience, CRM/desk modules, settings, reports, reservations, guests, rooms, finance, invoices, requests, calendar, and related workflows.

## Repository

- Repository: `friday-desk-client`
- Application type: Frontend / SPA
- Build tool: Vite
- Primary framework: React
- Deployment: Vercel

## Tech Stack

- React
- Vite
- JavaScript / JSX
- CSS
- ESLint
- Vercel
- TeleCMI integration services

## Main Modules

The current client includes modules such as:

- Dashboard
- Friday AI
- Onboarding
- Calendar
- Finance
- Guests
- Help
- Invoices
- Reports
- Requests
- Reservations
- Rooms
- Settings

## Project Structure

```text
Client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── settings/
│   ├── core/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   ├── Dashboard.jsx
│   ├── Friday.jsx
│   ├── Onboarding.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Js-goodapakam/friday-desk-client.git
cd friday-desk-client
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file:

```text
.env.local
```

Keep secrets and environment-specific credentials out of Git. The `.gitignore` is configured to exclude `.env` and `.env.*` files while allowing an optional `.env.example`.

Add only the variables required by the application and your TeleCMI integration.

### 4. Start the development server

```bash
npm run dev
```

The Vite development server will provide the local application URL, normally:

```text
http://localhost:5173
```

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

The Client is deployed on Vercel.

Recommended deployment flow:

```text
Developer
   │
   ▼
GitHub — friday-desk-client
   │
   ▼
Vercel
   │
   ▼
Friday AI Desk Client
```

After connecting the GitHub repository to Vercel, pushes to the configured production branch can be deployed automatically.

## Git Workflow

Recommended branches:

```text
main
develop
feature/*
```

Use `main` for production-ready code. Use `develop` for integration and feature branches for individual development work.

Example:

```bash
git checkout -b feature/new-module
git add .
git commit -m "Add new module"
git push -u origin feature/new-module
```

## Related Backend

The backend/API is maintained separately:

**Friday AI Desk Server**

`https://github.com/Js-goodapakam/friday-desk-server`

## Security

Do not commit:

- `.env`
- `.env.local`
- `.env.production`
- API credentials
- Passwords
- Access tokens
- Private keys
- Customer data exports
- Local build output
- `node_modules`

The repository `.gitignore` excludes environment files, build output, dependencies, Vercel metadata, logs, and CSV data exports.

## Status

Friday AI Desk Client is maintained as the frontend repository for the Friday AI Desk platform.
