# IConsole

A modern web-based management console for cloud infrastructure, built with Next.js, React, and TypeScript. IConsole provides a unified interface to manage virtual machines, networks, projects, users, and more—streamlining cloud operations for administrators and end-users alike.

---

## Table of Contents

- [IConsole](#iconsole)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
  - [Technology Stack](#technology-stack)
  - [Installation \& Setup](#installation--setup)
    - [Prerequisites](#prerequisites)
    - [Steps](#steps)
  - [Configuration \& Environment Variables](#configuration--environment-variables)
  - [Project Structure](#project-structure)
    - [Key Directories](#key-directories)
  - [Component \& Feature Documentation](#component--feature-documentation)
    - [Main Pages (`src/app/`)](#main-pages-srcapp)
    - [Reusable Components (`src/components/`)](#reusable-components-srccomponents)
      - [Example: Using a UI Button](#example-using-a-ui-button)
  - [API Integration](#api-integration)
    - [Example: Making an API Request](#example-making-an-api-request)
  - [Deployment Guide](#deployment-guide)
    - [Build for Production](#build-for-production)
    - [Deploy to Vercel](#deploy-to-vercel)
  - [Security Notes](#security-notes)
  - [Screenshots \& Visuals](#screenshots--visuals)
  - [License](#license)

---

## Project Overview

**IConsole** is designed to simplify and centralize the management of cloud resources. It offers:

- **Dashboard**: Overview of resources and system status
- **Instance Management**: Create, view, scale, and migrate virtual machines
- **Image & Network Management**: Manage VM images and network configurations
- **Project & User Management**: Organize resources by project and control user access
- **Responsive UI**: Works seamlessly on desktop and mobile devices

> **Note:** This project is under active development. Features and UI may evolve.

---

## Technology Stack

| Technology   | Description                        |
| ------------ | ---------------------------------- |
| Next.js      | React framework (v14+, App Router) |
| React        | UI library                         |
| TypeScript   | Static typing for JavaScript       |
| Tailwind CSS | Utility-first CSS framework        |
| ESLint       | Linting and code quality           |
| Prettier     | Code formatting                    |
| Bun          | Fast JavaScript runtime            |

---

## Installation & Setup

### Prerequisites

- [Bun](https://bun.sh/) **or** [Node.js](https://nodejs.org/) installed

### Steps

1. **Clone the repository:**

   ```sh
   git clone https://github.com/mAmineChniti/IConsole.git
   cd IConsole
   ```

2. **Install dependencies:**

   ```sh
   bun install
   # or
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in the required values (see [Configuration & Environment Variables](#configuration--environment-variables)).

4. **Run the development server:**

   ```sh
   bun run dev
   # or
   npm run dev
   ```

5. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Configuration & Environment Variables

Create a `.env.local` file in the project root. The following environment variable is required:

```env
# Backend API base URL
NEXT_PUBLIC_BACKEND=https://your-backend-url.example.com
```

> **Note:** Prefix variables with `NEXT_PUBLIC_` to expose them to the browser (required by Next.js).

---

## Project Structure

```sh
IConsole/
├── public/                # Static assets (favicon, images)
├── src/
│   ├── app/               # Next.js app directory (routing, pages)
│   │   ├── layout.tsx     # Root layout
│   │   ├── dashboard/     # Main dashboard & feature pages
│   │   └── login/         # Login page
│   ├── components/        # Reusable UI components
│   │   └── ui/            # Atomic UI elements (button, card, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions & API requests
│   ├── styles/            # Global styles (Tailwind, CSS)
│   └── types/             # TypeScript interfaces & schemas
├── package.json           # Project metadata & scripts
├── bun.lock               # Bun lockfile
├── tsconfig.json          # TypeScript config
└── ...
```

### Key Directories

- **`src/app/`**: Main application pages, organized by feature (e.g., `/dashboard/instances/`)
- **`src/components/`**: Shared and feature-specific React components
- **`src/components/ui/`**: Low-level UI primitives (buttons, dialogs, etc.)
- **`src/hooks/`**: Custom hooks for state and logic reuse
- **`src/lib/`**: API request helpers and utility functions
- **`src/types/`**: TypeScript types for API and data models

---

## Component & Feature Documentation

### Main Pages (`src/app/`)

- `/dashboard/overview/`: Resource summary and system health
- `/dashboard/instances/`: List and manage VMs
- `/dashboard/create-instance/`: Create new VMs
- `/dashboard/images/`: Manage VM images
- `/dashboard/networks/`: Network configuration and management
- `/dashboard/volumes/`: Create, view, and delete block storage volumes
- `/dashboard/snapshots/`: Manage volume snapshots
- `/dashboard/volume-types/`: Define and manage volume types
- `/dashboard/projects/`: Project organization and access control
- `/dashboard/users/`: User management (create, edit, assign roles)
- `/dashboard/scale/`: Scale resources up or down
- `/dashboard/migrate-vm/`: VM migration workflows
- `/login/`: User authentication page

### Reusable Components (`src/components/`)

- `Sidebar`: Main navigation sidebar
- `Instances`: Table/list of virtual machines
- `Projects`: Project management UI
- `Users`: User list and management dialogs
- `Networks`: Network overview and forms
- `ImportVM`, `ImageStep`, `FlavorStep`, `DetailsStep`, `SummaryStep`: Multi-step forms for VM operations
- `ui/`: Buttons, dialogs, cards, popovers, tooltips, etc.

#### Example: Using a UI Button

```tsx
import { Button } from "@/components/ui/button";

<Button onClick={handleClick}>Create Instance</Button>;
```

---

## API Integration

> **Note:** This project does not expose public API routes in `/api`. All API interactions are handled via client-side requests in `src/lib/requests.ts`.

- `src/lib/requests.ts`: Contains functions for making HTTP requests to backend services
- `src/types/RequestInterfaces.ts` & `ResponseInterfaces.ts`: Define request/response shapes

### Example: Making an API Request

```ts
import { ProjectService } from "@/lib/requests";

const projects = await ProjectService.listDetails();
```

---

## Deployment Guide

IConsole can be deployed to Vercel, Docker, or any platform supporting Next.js apps.

### Build for Production

```sh
bun run build
# or
npm run build
```

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com/)
3. Set environment variables in the Vercel dashboard
4. Deploy

---

## Security Notes

- **Authentication:** User authentication is handled via the `/login` page. Ensure secure handling of credentials and tokens.
- **Role-Based Access:** User roles and permissions are managed in the dashboard. Restrict sensitive actions to authorized users only.
- **Environment Variables:** Never commit secrets or sensitive data. Use `.env.local` for local development and configure secrets in your deployment platform.
- **Dependencies:** Keep dependencies up to date to avoid vulnerabilities.

---

## Screenshots & Visuals

> Place screenshots in the `docs/` or `public/` directory and embed them below for clarity.

| Screenshot                        | Description                                |
| --------------------------------- | ------------------------------------------ |
| ![Landing Page](docs/landing.png) | Landing or Home page overview              |
| ![Sidebar](docs/sidebar.png)      | Navigation menu/sidebar                    |
| ![Dashboard](docs/dashboard.png)  | Main dashboard with data tables            |
| ![Form](docs/form.png)            | Key component (e.g., create instance form) |
| ![Mobile](docs/mobile.png)        | Responsive/mobile view                     |
| ![Admin](docs/admin.png)          | Admin or user management page              |
| ![Graph](docs/graph.png)          | Data visualization/graph page              |

---

## License

This project is licensed under the [MIT License](LICENSE).
