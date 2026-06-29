# Iceberg 5.0 — Copilot Instructions

This workspace is the **Iceberg 5.0 Unified Platform** — a multi-tenant SaaS consolidating Hub, Viewer, Eureka Hub, Eureka Viewer, MDM, and UAM.

## Project structure

| Repository | Purpose | Stack |
|---|---|---|
| `Iceberg-ShellApp` | MFE host (Shell) | Angular 21, native-federation, NG-ZORRO |
| `Iceberg-Hub` | Data authoring (UI + API) | Angular 21 MFE + .NET 10 API |
| `MDM` | Master data management (UI + API) | Angular 21 MFE + .NET 10 API |
| `Iceberg-Viewer` | Data viewer | Angular 21 MFE |
| `Iceberg-Shared` | Shared libraries | TypeScript + C# |
| `UAM` | User access management | .NET API |

## Angular 21 conventions

### Always use
- Standalone components (`standalone: true`)
- New control flow: `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`)
- `inject()` function (NOT constructor injection)
- Angular Signals for component state (NOT BehaviorSubject)
- Functional guards and interceptors (NOT class-based)
- Lazy-loaded routes via `loadComponent` or `loadChildren`
- NG-ZORRO for all UI components
- Apache ECharts for all charts
- Jest for unit tests, Playwright for e2e

### Never use
- NgModules (except Module Federation entry)
- `HttpClient` directly in components (use services)
- `any` type
- `*ngIf`, `*ngFor`, `*ngSwitch` directives
- `console.log` in production code
- Angular Material or Bootstrap
- Commented-out code

## Module Federation

- Shell is the host using `@angular-architects/native-federation`
- MFEs expose `./Routes` from `app.routes.ts`
- Shared singletons: `@angular/core`, `@angular/common`, `@angular/router`, `ng-zorro-antd`, `angular-auth-oidc-client`
- Remote MFEs do NOT initiate login — Shell handles auth

## Authentication

- OIDC via `angular-auth-oidc-client`
- Shell redirects to STS for login
- MFEs read token from Shell's shared singleton
- Tokens stored in localStorage (MVP)

## Multi-tenancy

- Three-layer enforcement: Auth Middleware → Connection Middleware → PostgreSQL RLS
- Tenant context from JWT `c_id` claim (future: `tenant_id`)
- Read operations via Security Barrier Views
- All code paths must propagate tenant context

## JIRA integration

When a user mentions a JIRA ticket (e.g., PROJ-123), fetch it:

```bash
curl -s -X GET \
  "$JIRA_BASE_URL/rest/api/3/issue/PROJ-123" \
  -H "Authorization: Bearer $JIRA_PAT" \
  -H "Accept: application/json"
```

Requires `JIRA_BASE_URL` and `JIRA_PAT` environment variables.

## .NET conventions

- .NET 10, async/await everywhere
- CQRS via MediatR (thin controllers)
- FluentValidation for input validation
- FluentResults `Result<T>` for expected errors
- Entity Framework Core with Npgsql
- Raw SQL migrations (NOT EF Core migrations)
- xUnit + Testcontainers for integration tests
- No AutoMapper — manual mapping
