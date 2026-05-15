# Production Planning & Scheduling of Size (PPSS)

Production-grade ERP foundation for manufacturing production planning and scheduling by product size.

## Tech Stack

- Backend: Laravel 12
- Frontend: React + Vite
- Database: MySQL default, PostgreSQL compatible
- Authentication: Laravel Sanctum (API token)
- Authorization: Spatie Laravel Permission (RBAC)
- Queue: Database driver (Redis-ready)
- Cache: Redis-ready configuration
- Observability: Telescope, Debugbar (dev)
- Quality: Laravel Pint, IDE Helper, PSR-12

## Architecture

- API-first backend
- Strict MVC with dedicated API/Web controller namespaces
- Repository pattern via interfaces and bindings
- Service layer for business orchestration
- Form Request validation and DTO mapping
- API Resource transformers
- Event-driven + queue-ready login audit flow
- Modular route files for domain growth

### Backend Structure

```text
app/
+-- Actions/
+-- DTOs/
+-- Enums/
+-- Events/
+-- Exceptions/
+-- Helpers/
+-- Http/
�   +-- Controllers/
�   �   +-- API/
�   �   +-- Web/
�   +-- Middleware/
�   +-- Requests/
�   +-- Resources/
+-- Interfaces/
+-- Jobs/
+-- Listeners/
+-- Models/
+-- Policies/
+-- Repositories/
+-- Services/
+-- Traits/
```

### Route Structure

```text
routes/
+-- api.php
+-- web.php
+-- auth.php
+-- production.php
+-- planning.php
+-- inventory.php
```

### Frontend Structure

```text
resources/js/
+-- app.jsx
+-- bootstrap.js
+-- router/
+-- layouts/
+-- pages/
+-- components/
+-- services/
+-- hooks/
+-- store/
+-- utils/
```

## API Response Standard

Success:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "",
  "errors": {}
}
```

## Environment Configuration

Copy and configure environment:

```bash
cp .env.example .env
```

Required baseline values in `.env`:

```env
APP_TIMEZONE=Asia/Kolkata
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ppss
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=database
CACHE_STORE=redis

SANCTUM_STATEFUL_DOMAINS=localhost,localhost:5173,127.0.0.1,127.0.0.1:8000
VITE_API_BASE_URL=/api
```

PostgreSQL alternative:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ppss
DB_USERNAME=postgres
DB_PASSWORD=
DB_SSLMODE=prefer
```

## Installation Steps

1. Install PHP dependencies.
2. Install Node dependencies.
3. Generate app key.
4. Run migrations and seed roles/permissions.
5. Build frontend assets.

## Setup Commands

```bash
composer install
npm install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
```

## Development Commands

```bash
composer dev
# or run separately:
php artisan serve
php artisan queue:work --tries=3 --timeout=120
npm run dev
```

## Build Commands

```bash
npm run build
php artisan optimize
```

## Queue Setup

Database queue tables are included in migrations. Run worker in production process manager:

```bash
php artisan queue:work --tries=3 --timeout=120 --queue=default
```

## Telescope / Debug

- Telescope is installed and configured.
- Debugbar is development-only dependency.

## Permissions Setup

RBAC seed command:

```bash
php artisan db:seed --class=RolePermissionSeeder
```

Default roles:

- super-admin
- planner
- production-manager
- operator

## Authentication Endpoints

- POST `/api/auth/login`
- POST `/api/auth/logout` (Sanctum protected)
- GET `/api/auth/user` (Sanctum protected)

## Initial Frontend Pages

- Dashboard
- Login
- Production Orders
- Machine Planning
- Scheduling Board

## Terminal Command Checklist (Fresh Machine)

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
npm run build
php artisan serve
```
