# 🛡️ LingoSphere — Admin Portal

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

**Next-generation, high-performance back-office administration suite for the LingoSphere language learning ecosystem.**

[Live Admin Portal](https://admin.lingosphere.online) • [API Documentation](https://api.lingosphere.online)

</div>

---

## 📖 Overview

**LingoSphere Admin Portal** is a purpose-built, responsive administrative application designed to manage every facet of the LingoSphere learning platform. It empowers instructors, academic administrators, and system operators with real-time analytics, course authoring tools, question bank editors, role-based access governance, and cloud media delivery controls.

Powered by **React 19**, **Vite 8**, **Tailwind CSS v4**, and **TanStack Query & Table**, this portal offers lightning-fast rendering, fluid data grid interactions, and robust security integration.

---

## ✨ Key Features

- **👥 Identity & Access Management (RBAC)**: Fine-grained permission matrices, dynamic role assignment (`Admin`, `Instructor`, `Moderator`, `Student`), and active user session monitoring.
- **📚 Course & Curriculum Studio**: Rich course builder with support for multi-module hierarchies, lecture resources, Cloudflare R2 video uploads, and HLS adaptive streaming settings.
- **📝 Exam & Question Bank Management**: Comprehensive TOEIC and general English test builder covering Listening (Parts 1–4 with audio cues) and Reading (Parts 5–7 with comprehension passages), scoring keys, and timed attempt limits.
- **🗂️ Vocabulary & Flashcard Vault**: Curate vocabulary sets, manage phonetic data, attach native audio pronunciations, and inspect spaced repetition parameters.
- **💬 Community & Moderation Center**: Real-time moderation tools to monitor public study discussions, flag inappropriate content, resolve user reports, and maintain platform integrity.
- **📊 Operations Dashboard & Telemetry**: Visual metrics for student enrollments, completion rates, daily active learners, revenue trends, and platform health.
- **🔔 Notification Broadcaster**: Send targeted in-app announcements, system-wide maintenance banners, and event dispatches.
- **🌐 Dual-Language Support**: Seamless English and Vietnamese localization via `i18next`.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Core Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) |
| **Styling & Theming** | [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI Primitives](https://www.radix-ui.com/) + [Ant Design 6](https://ant.design/) |
| **Data Fetching & Caching** | [TanStack React Query v5](https://tanstack.com/query/latest) + [Axios](https://axios-http.com/) |
| **Data Grid & Tables** | [TanStack Table v8](https://tanstack.com/table/latest) (Virtual scrolling, sorting, column filters) |
| **Form Management** | [TanStack Form](https://tanstack.com/form/latest) + [Zod 4](https://zod.dev/) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Icons & Motion** | [Lucide React](https://lucide.dev/) + [Motion (Framer)](https://motion.dev/) |
| **Internationalization** | [i18next](https://www.i18next.com/) + `react-i18next` |

---

## 📁 Project Structure

```text
frontend-admin/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Shared presentation components (Buttons, Modals, Forms, Inputs)
│   ├── config/             # Environment, API, and runtime configurations
│   ├── contexts/           # Global React contexts (Auth, Theme, Notifications)
│   ├── features/           # Domain-driven modular features
│   │   ├── auth/           # Login, Session verification, Password reset
│   │   ├── community/      # Forum moderation and comment controls
│   │   ├── courses/        # Curriculum builder, lecture manager
│   │   ├── dashboard/      # Platform analytics, summaries, and graphs
│   │   ├── exams/          # TOEIC test suites, questions, question banks
│   │   ├── media/          # Cloudflare R2 uploads & asset management
│   │   ├── notifications/  # Notification center & broadcast tools
│   │   ├── practice/       # Practice sets & exercise authoring
│   │   ├── progress/       # Student tracking & completion logs
│   │   ├── rbac/           # Roles, permissions, access matrices
│   │   ├── settings/       # System preferences & localization
│   │   ├── system/         # Healthcheck, logs, and gateway status
│   │   ├── users/          # User accounts, status, and profile edits
│   │   └── vocabulary/     # Lexical databases, audio wordbanks
│   ├── hooks/              # Custom reusable React hooks
│   ├── i18n/               # Multi-language dictionary files (en / vi)
│   ├── layouts/            # Dashboard layout, Sidebar, Top Navigation, Auth layout
│   ├── lib/                # Utility helpers, date formatters, Axios instance
│   ├── routes/             # App routing tree and Protected Route guards
│   ├── services/           # HTTP API client services matching Backend Gateway contracts
│   ├── store/              # Client-side state management
│   ├── types/              # TypeScript interfaces, DTOs, and schema types
│   ├── App.tsx             # Root Application component
│   ├── main.tsx            # Application entrypoint
│   └── index.css           # Global Tailwind CSS directives and theme variables
├── .env.example            # Environment variables blueprint
├── package.json            # Dependencies and npm run scripts
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment rewrites & build triggers
└── vite.config.ts          # Vite build configuration and path aliases (@/*)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Package Manager**: `npm` (v10+), `yarn`, or `pnpm`

### 1. Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/your-org/lingo-sphere.git
cd lingo-sphere/frontend-admin
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root of `frontend-admin` based on `.env.example`:

```bash
cp .env.example .env
```

Populate the required configuration variables:

```env
# URL pointing to LingoSphere API Gateway
VITE_API_BASE_URL=https://api.lingosphere.online/api/v1

# Public CDN URL for Cloudflare R2 asset storage (audio, video, images)
VITE_R2_PUBLIC_URL=https://cdn.lingosphere.online
```

### 3. Launch Development Server

Start Vite in development mode with Hot Module Replacement (HMR):

```bash
npm run dev
```

The portal will be accessible at: `http://localhost:5173` (or the port specified by Vite in console output).

---

## 📦 Scripts & Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the development server with HMR. |
| `npm run build` | Validates TypeScript types (`tsc -b`) and generates optimized production bundle in `/dist`. |
| `npm run preview` | Spins up a local preview server of the production build. |
| `npm run lint` | Lints source files using ESLint. |

---

## 🌐 Deployment

The portal is configured for continuous deployment on **Vercel**:
- Single-page application (SPA) routing is preserved using the URL rewrite configuration in `vercel.json`:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- Automated builds on Vercel are triggered when commits land on the `main` branch.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for complete details.

<div align="center">
  <sub>Built with ❤️ by the LingoSphere Engineering Team.</sub>
</div>
