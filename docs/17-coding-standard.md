# Coding Standards

Developers and automated processes contributing to NOCAP must adhere to the following naming, formatting, and structural guidelines.

## 1. TypeScript Coding Rules
* **Strict Configuration**: Ensure `tsconfig` enables strict checking (e.g. `"strict": true`, `"noImplicitAny": true`, `"strictNullChecks": true`).
* **Explicit Typing**: Avoid using the `any` type. Always declare interface profiles or use structural unions for complex responses.
* **Asynchronous Patterns**: Use `async/await` structures for async calls. Avoid nested `.then()` execution trees.

## 2. API Route Declarations (Next.js App Router)
* **Response Standards**: API endpoints return standard Next.js `NextResponse` payloads.
* **Dynamic Routing**: Dynamic variables map via standard App Router naming patterns (e.g. `src/app/api/v1/wallet/[addr]/status/route.ts`).
* **SSE Response Streams**: Streamed responses instantiate a native `ReadableStream` writing encoded JSON lines.

## 3. Naming Conventions
* **Directories & Files**: Use kebab-case for naming files and directories (e.g. `wallet-profiles.ts`), or standard Next.js App Router structure.
* **Variables & Functions**: Use camelCase for variables and function names.
* **Classes & Interfaces**: Use PascalCase for naming classes and interfaces (e.g., UAIM schemas, adapter interfaces).
* **Database Columns**: Use snake_case for Postgres table headers mapping to camelCase fields via Drizzle ORM mappings.
