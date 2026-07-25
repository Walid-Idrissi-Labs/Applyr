# Applyr

Applyr is a job application tracking SaaS with a Laravel API backend and a React SPA frontend. It supports application lifecycle management, task tracking, document storage, AI-assisted resume generation, and browser extensions for importing job listings directly from job boards.

---

## Tech Stack

### Backend
- **Framework:** Laravel 13 (PHP 8.4+)
- **Database:** SQLite (local) / PostgreSQL (production)
- **Authentication:** Laravel Sanctum (token-based API auth)
- **PDF:** DomPDF (generation), Smalot/PdfParser + Tesseract OCR (extraction)
- **Mail:** Brevo SMTP
- **AI:** OpenRouter API (`openai/gpt-oss-20b:free`)

### Frontend
- **Framework:** React 19.1
- **Build Tool:** Vite 6.3
- **Routing:** React Router v7.6
- **Styling:** Tailwind CSS 3.4 + custom neu-card component system
- **State:** React Context API (AuthContext, ThemeContext)
- **HTTP Client:** Axios 1.9 (token interceptor)
- **Charts:** Chart.js 4.4 + react-chartjs-2 5.3
- **Icons:** Lucide React 0.511

### Extensions
- Vanilla JavaScript/HTML/CSS
- Chrome (Manifest V3) and Firefox support

---

## Architecture

Applyr follows a decoupled SPA + API architecture. The React frontend consumes the Laravel API exclusively via REST. There is no server-side rendering and no shared domain between the two.

### Frontend (app/)
The frontend is a standalone React application built with Vite. It communicates with the backend through a configured Axios instance that automatically attaches Sanctum tokens on every request and handles 401 responses by redirecting to login.

State is managed through React Context:
- `AuthContext` holds the authenticated user and exposes login/logout/profile methods
- `ThemeContext` toggles between light and dark modes

Vite proxies `/api` requests to the Laravel backend in development, eliminating CORS concerns locally.

### Backend (laravel/)
The Laravel backend exposes a pure REST API. All routes are stateless and protected by Sanctum middleware, except for authentication endpoints and the public AI job extraction endpoint used by the browser extensions.

Request validation is handled in Form Request classes. API Resources transform Eloquent models into JSON responses with consistent structure.

### Database Design

The schema is normalized around a central `applications` table. Status transitions are logged to `status_histories` via Eloquent model events. Documents and tasks are nested under applications as one-to-many relationships. Tags use a many-to-many pivot. Resumes belong to both a user and optionally an application, enabling per-application tailoring.

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require a valid Sanctum token via the `Authorization: Bearer <token>` header.

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register a new user account |
| POST | `/login` | No | Login and receive a Sanctum token |
| POST | `/logout` | Yes | Invalidate the current token |
| GET | `/user` | Yes | Return the authenticated user |
| PUT | `/profile` | Yes | Update name and email |
| PUT | `/password` | Yes | Change password |
| POST | `/forgot-password` | No | Send a password reset email |
| POST | `/reset-password` | No | Reset password with a token |
| POST | `/email/verify` | No | Verify email address |
| POST | `/email/verification` | Yes | Resend verification email |

### Applications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/applications` | Yes | List all applications (filterable, paginated) |
| GET | `/applications/dashboard` | Yes | Return dashboard statistics |
| POST | `/applications` | Yes | Create a new application |
| GET | `/applications/{id}` | Yes | Get a single application with relations |
| PUT | `/applications/{id}` | Yes | Update an application |
| DELETE | `/applications/{id}` | Yes | Delete an application and its relations |
| PATCH | `/applications/{id}/status` | Yes | Update only the status (logs to status_histories) |

**Query parameters for `GET /applications`:**
- `status` - filter by application status
- `search` - search by company name or position
- `tags` - filter by tag IDs (comma-separated)
- `sort` - field to sort by (e.g. `applied_at`, `created_at`)
- `order` - `asc` or `desc`
- `per_page` - items per page (default 15)

**Application statuses:** `wishlist`, `applied`, `interview`, `technical test`, `offer`, `rejected`, `accepted`

### Tasks (nested under applications)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/applications/{id}/tasks` | Yes | List tasks for an application |
| POST | `/applications/{id}/tasks` | Yes | Create a task |
| PUT | `/applications/{id}/tasks/{taskId}` | Yes | Update a task |
| DELETE | `/applications/{id}/tasks/{taskId}` | Yes | Delete a task |

### Documents (nested under applications)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/applications/{id}/documents` | Yes | List documents |
| POST | `/applications/{id}/documents` | Yes | Upload a document (multipart form) |
| GET | `/applications/{id}/documents/{docId}/download` | Yes | Stream file download |
| DELETE | `/applications/{id}/documents/{docId}` | Yes | Delete a document |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notifications` | Yes | List all notifications |
| GET | `/notifications/unread-count` | Yes | Return unread count |
| PATCH | `/notifications/{id}/read` | Yes | Mark a notification as read |
| POST | `/notifications/mark-all-read` | Yes | Mark all as read |
| DELETE | `/notifications/{id}` | Yes | Delete a notification |
| DELETE | `/notifications` | Yes | Delete all notifications |

### Tags

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tags` | Yes | List all tags for the authenticated user |
| POST | `/tags` | Yes | Create a tag |
| DELETE | `/tags/{id}` | Yes | Delete a tag |

### Resumes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/resumes` | Yes | List all resumes |
| POST | `/resumes` | Yes | Create a resume |
| GET | `/resumes/{id}` | Yes | Get a single resume |
| PUT | `/resumes/{id}` | Yes | Update a resume |
| DELETE | `/resumes/{id}` | Yes | Delete a resume |
| GET | `/resumes/{id}/export-pdf` | Yes | Export resume as PDF |
| POST | `/resumes/extract` | Yes | Extract text from an uploaded PDF (OCR fallback) |
| POST | `/resumes/{id}/generate` | Yes | Generate or refine resume content via AI |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/ai/extract-job` | No | Extract job metadata from raw HTML (used by extensions) |

### Admin

All admin routes are prefixed with `/api/admin` and require an authenticated user with `is_admin = true`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/stats` | Admin | Platform-wide statistics |
| GET | `/users` | Admin | Paginated user list |
| POST | `/users` | Admin | Create a new user (sends password email) |
| PUT | `/users/{id}` | Admin | Update a user |
| PATCH | `/users/{id}/deactivate` | Admin | Deactivate a user account |
| PATCH | `/users/{id}/activate` | Admin | Activate a deactivated user |
| PATCH | `/users/{id}/grant-admin` | Admin | Grant admin privileges |
| PATCH | `/users/{id}/revoke-admin` | Admin | Revoke admin privileges |
| DELETE | `/users/{id}` | Admin | Delete user and all associated data |
| GET | `/ai-logs` | Admin | AI usage log with token counts |

---

## Application Status Lifecycle

Applications move through a defined lifecycle:

```
wishlist -> applied -> interview -> technical test -> offer
                  \                  \                  \
                   -> rejected        -> rejected        -> accepted
```

Every status change is recorded in `status_histories` with a timestamp, the old status, and the new status.

---

## Project Structure

```
Applyr/
├── app/                          # React SPA frontend
│   ├── src/
│   │   ├── api/                  # Axios instance with interceptors
│   │   ├── components/           # Shared UI components
│   │   ├── context/              # AuthContext, ThemeContext
│   │   ├── hooks/                # Custom React hooks
│   │   ├── pages/                # Page-level components (14 pages)
│   │   ├── constants/            # App-wide constants (statuses, etc.)
│   │   ├── App.jsx               # Router definition
│   │   └── main.jsx              # Entry point
│   ├── public/                   # Static assets, favicons
│   └── package.json
│
├── laravel/                      # Laravel API backend
│   ├── app/
│   │   ├── Console/Commands/     # Artisan commands (SendReminders)
│   │   ├── Http/
│   │   │   ├── Controllers/      # 11 API controllers
│   │   │   └── Middleware/       # EnsureUserIsActive
│   │   ├── Mail/                 # 5 mailables
│   │   ├── Models/               # 9 Eloquent models
│   │   └── Providers/
│   ├── config/                   # Laravel config files
│   ├── database/
│   │   ├── migrations/           # 14 migration files
│   │   ├── seeders/
│   │   └── database.sqlite
│   ├── routes/
│   │   ├── api.php               # All API routes
│   │   ├── web.php
│   │   └── console.php           # Scheduled tasks
│   ├── bootstrap/app.php         # Middleware pipeline configuration
│   └── composer.json
│
├── extension/                     # Browser extensions
│   ├── extension-chrome/          # Chrome (Manifest V3)
│   └── extension-firefox/         # Firefox
│
├── mockup/                        # UI mockups and prototypes
└── APPLYR_GUIDE.md               # Full project specification
```

---

## Models & Relationships

| Model | Relationship | Related Model | Notes |
|-------|-------------|---------------|-------|
| User | hasMany | Application | |
| User | hasMany | Notification | |
| User | hasMany | Resume | |
| User | hasMany | AiLog | |
| Application | belongsTo | User | |
| Application | belongsToMany | Tag | Many-to-many via `application_tag` pivot |
| Application | hasMany | StatusHistory | Created automatically on status change |
| Application | hasMany | Task | |
| Application | hasMany | Document | |
| Application | hasMany | Resume | Per-application resume variants |
| Task | belongsTo | Application | Cascade delete |
| Document | belongsTo | Application | Cascade delete |
| Notification | belongsTo | User | |
| Tag | belongsToMany | Application | |
| StatusHistory | belongsTo | Application | No default timestamps |
| Resume | belongsTo | User | |
| Resume | belongsTo | Application | Nullable - base resumes have no application |
| AiLog | belongsTo | User | No default timestamps |

---

## Pages

The frontend consists of 14 pages:

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public marketing page |
| Login | `/login` | Authentication |
| Forgot Password | `/forgot-password` | Password reset request |
| Reset Password | `/reset-password` | Password reset form |
| Verify Email | `/verify-email` | Email verification |
| Dashboard | `/dashboard` | KPI cards, charts, recent activity |
| Applications | `/applications` | List and board view of all applications |
| Application Detail | `/applications/:id` | Full detail with tasks, documents, history |
| Resumes | `/resumes` | Resume list with generation UI |
| Resume Preview | `/resumes/:id/preview` | A4 preview with PDF export |
| Notifications | `/notifications` | Notification center |
| Profile | `/profile` | User profile and settings |
| Admin Dashboard | `/admin` | Platform statistics |
| User Management | `/admin/users` | User CRUD and role management |

---

## Scheduled Tasks

A single scheduled command runs daily at 08:00:

- `app:send-reminders` - Queries all applications where `reminder_date` is today and sends email reminders to the respective users.

The scheduler is driven by Laravel's Task Scheduling in `routes/console.php`.

---

## Middleware

`EnsureUserIsActive` is applied globally to all API routes via the middleware stack in `bootstrap/app.php`. If a user's `is_active` flag is false, all their Sanctum tokens are revoked and they receive a 403 response.

---

## AI Integration

AI calls are made through OpenRouter using the `openai/gpt-oss-20b:free` model. Two operations use AI:

1. **Job extraction** (`POST /api/ai/extract-job`) - Accepts raw HTML from a job board page and returns structured JSON (company name, position, description, detected language). This endpoint is public to support the browser extension workflow.

2. **Resume generation** (`POST /api/resumes/{id}/generate`) - Accepts a prompt instructing the AI to rewrite or refine the resume content. All AI calls are logged to the `ai_logs` table with the model, token count, prompt, and response for cost tracking and audit.

---

## Browser Extensions

The extensions inject a button into supported job board pages. When clicked, the extension sends the page HTML to `/api/ai/extract-job`, displays the parsed result in a popup form for user correction, and can create a new application in Applyr directly.

To load the extensions for local development:
- **Chrome:** Navigate to `chrome://extensions`, enable Developer mode, click Load unpacked, and select `extension/extension-chrome`
- **Firefox:** Navigate to `about:debugging#/runtime/this-firefox`, click Load Temporary Add-on, and select any file in `extension/extension-firefox`

---

## License

This project is licensed.

---

