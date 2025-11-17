# GEMINI.MD: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

## 1. Project Overview & Purpose

- **Primary Goal:** This is a full-stack monorepo built to serve as a template for creating web applications with a shared UI library. The project includes a main web application, a customer-facing widget, and an embeddable component.
- **Business Domain:** The application appears to be in the customer support or user engagement sector. The database schema includes concepts like "contact sessions," and "widget settings," suggesting a tool for businesses to interact with their users.

## 2. Core Technologies & Stack

- **Languages:** TypeScript
- **Frameworks & Runtimes:**
  - Runtime: Node.js (v20+)
  - Web Framework: Next.js (v15+)
  - Backend Framework: Convex (v1.25+)
- **Databases:** The project uses the database provided by the Convex platform. The schema is defined programmatically in `packages/backend/convex/schema.ts`.
- **Key Libraries/Dependencies:**
  - **UI:** `shadcn/ui`, React, Tailwind CSS, Radix UI
  - **Backend:** `@convex-dev/agent`
  - **Authentication:** `@clerk/nextjs`
  - **State Management:** `jotai`
  - **Schema Validation:** `zod`
  - **Error Monitoring:** `@sentry/nextjs`
- **Package Manager(s):** pnpm (v10.18.2)
- **Monorepo Orchestration:** Turborepo

## 3. Architectural Patterns

- **Overall Architecture:** The project follows a full-stack, type-safe monorepo architecture.
  - **Frontend:** A Next.js application using the App Router.
  - **Backend:** A serverless backend powered by Convex. This is not a traditional REST or GraphQL API; the frontend client calls backend functions in a type-safe, RPC-like manner.
- **Directory Structure Philosophy:** The repository is organized into `apps` and `packages`, a standard Turborepo convention.
  - `/apps`: Contains deployable applications.
  - `Admin`: The main admin-facing web application.
  - `web`: The main user-facing web application.
  - `widget`: A Next.js application for the embeddable widget.
  - `embed`: A vanilla TypeScript application for the embeddable script.
  - `/packages`: Contains shared code intended for use across the `apps`.
    - `backend`: All Convex backend logic, including schema, mutations, queries, and actions.
    - `ui`: The shared `shadcn/ui` component library.
    - `eslint-config`, `typescript-config`: Shared configurations for linting and TypeScript.

## 4. Coding Conventions & Style Guide

- **Formatting:** The project uses `prettier` for code formatting, enforced via the `format` script in the root `package.json`.
- **Naming Conventions:**
  - `variables`, `functions`, `database fields`: camelCase (`myVariable`, `contactSessionId`)
  - `React Components`: PascalCase (`MyComponent`)
  - `files`: kebab-case (`my-component.tsx`) is preferred, following Next.js conventions.
- **API Design:** The API is defined by the functions exported from files within `packages/backend/convex/`. These functions are directly imported and used by the frontend via the generated Convex client, providing end-to-end type safety.
- **Error Handling:** The project is configured with Sentry for error monitoring. Frontend code should use `try...catch` blocks or `.then/.catch` for handling asynchronous operations with the Convex backend.

## 5. Key Files & Entrypoints

- **Main Entrypoint(s):**

  - Admin App: `apps/admin/app/layout.tsx` and `apps/admin/app/page.tsx`.
  - Widget App: `apps/widget/app/layout.tsx` and `apps/widget/app/page.tsx`.
  - Embed App: `apps/embed/app/layout.tsx` and `apps/embed/app/page.tsx`.
  - Web App: `apps/web/app/layout.tsx` and `apps/web/app/page.tsx`.
  - Backend Logic: All `*.ts` files within `packages/backend/convex/`.

- **Configuration:**
  - Monorepo: `turbo.json`, `pnpm-workspace.yaml`.
  - Backend Schema: `packages/backend/convex/schema.ts`.
  - Admin App: `apps/admin/next.config.mjs`.
  - Widget App: `apps/widget/next.config.mjs`.
  - Embed App: `apps/embed/next.config.mjs`.
  - Frontend: `apps/web/next.config.mjs`.
- Tooling: `.eslintrc.js`, `tsconfig.json` (and shared configs in `packages/*-config`).
- **CI/CD Pipeline:** (Inferred) No CI/CD configuration file (e.g., `.github/workflows`) was found in the project structure. This should be created or located.

## 6. Development & Testing Workflow

- **Local Development Environment:** To run the entire project for development, execute the following command from the root directory:
  ```bash
  pnpm dev
  ```
  This uses `turbo dev` to start the Next.js development server for the web app and the Convex development server simultaneously.
- **Building the project:** To build the entire project, execute the following command from the root directory:
  ```bash
  pnpm build
  ```
- **Testing:** (Inferred) No testing framework, test files (`*.test.ts`), or test scripts were identified in the project. A testing strategy (e.g., using Jest or Vitest) needs to be established. New features should be accompanied by corresponding tests.

## 7. Specific Instructions for AI Collaboration

- **Contribution Guidelines:** A formal `CONTRIBUTING.md` was not found. All changes should be made in a feature branch and submitted as a pull request.
- **Dependencies:** To add or remove a dependency, use the `pnpm add` or `pnpm remove` command with the `-F` (filter) flag to target the specific workspace.

  ```bash
  # Example: Add a library to the 'web' app
  pnpm add zod -F web

  # Example: Remove a library from the 'web' app
  pnpm remove zod -F web

  # Example: Add a dev dependency to the 'ui' package
  pnpm add -D tailwindcss -F @workspace/ui
  ```

- **Backend Modifications:** The backend is managed by Convex. To alter backend functionality:
  1.  Modify the TypeScript files in `packages/backend/convex/`.
  2.  The `pnpm dev` command automatically pushes changes to your Convex dev deployment. If not using `dev`, you may need to run `npx convex push` manually to ensure the generated API files are up to date.
- **UI Components:** The `packages/ui` library contains shared `shadcn/ui` components. To add a new component to this library, run the `shadcn/ui` `add` command from the repository root, targeting the `web` app's config, which is set up to point to the shared UI package.
  ```bash
  pnpm dlx shadcn-ui@latest add button -c apps/web
  ```
- **Commit Messages:** It is recommended to follow the [Conventional Commits specification](https://www.conventionalcommits.org/). This practice ensures a clean and understandable commit history. (e.g., `feat:`, `fix:`, `docs:`, `refactor:`).

# 8. Agent Directives: Shell Command Execution Policy

## High-Volume Command Filtering

To conserve tokens and reduce latency, when executing any shell command that may produce large output (e.g., test runners, build logs, verbose commands, or long scripts):

1.  **ALWAYS** redirect standard output and standard error to a file in the temporary directory (e.g., `pnpm run test > output.txt 2>&1`).
2.  **NEVER** allow the raw, unpiped output to enter the chat context.
3.  **CONDITIONAL READING:** You must only read the content of the file if the command returns a **non-zero exit code**.
4.  If the exit code is **zero (0)**, simply state: "Command successful" and provide a brief, one-sentence summary of the command's intent.
5.  If the exit code is **non-zero (>0)**, read the contents of the file and use that specific log data to propose a fix.
