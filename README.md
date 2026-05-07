# Applyr

**Applyr** is a comprehensive, modern job application tracking system designed to streamline and organize the entire job hunting process. 

By combining a robust backend, a responsive Single Page Application (SPA), and integrated browser extensions, Applyr provides an all-in-one workspace where users can track their ongoing job applications, manage related tasks, store documents, and leverage AI to automatically extract job details directly from job boards.

---

## 🚀 Key Features

### For Users
- **Application Tracking:** Monitor the status of your job applications from initial submission to final offer. Manage metadata such as company, position, salary range, and URLs.
- **Task Management:** Create, manage, and check off to-do items linked to specific job applications (e.g., "Send follow-up email", "Prepare for technical interview").
- **Document & Resume Storage:** Securely upload, store, and manage resumes tailored for different roles. Support for generating hyper-tailored resumes using OpenRouter AI based on your global base resume and specific job descriptions, and exporting them cleanly as PDFs using browser-native printing.
- **AI Job Extraction:** Automatically pull job descriptions, requirements, and metadata from supported job boards using our dedicated Chrome/Firefox browser extensions.
- **Smart Notifications:** Stay on top of your application pipeline with an integrated notification center.
- **Dark Mode Support:** A sleek, fully responsive "neu-card" design system that supports both light and dark themes.

### For Administrators
- **Platform Analytics:** A dedicated dashboard to monitor platform health, active user counts, application creation statistics, and AI token usage.
- **User Management:** Create, edit, activate, deactivate, or completely delete user accounts. Securely provision new users with automated password emails.
- **Role-Based Access Control:** Seamlessly switch between "Admin Mode" and "User Mode" to test features without losing your administrative privileges.

---

## 🛠 Tech Stack

Applyr is structured as a monorepo consisting of three main environments:

**Backend (Laravel)**
- **Framework:** Laravel 11 (PHP 8.2+)
- **Database:** MySQL / PostgreSQL / SQLite
- **Authentication:** Laravel Sanctum (Token-based API auth)
- **Features:** Eloquent ORM, customized Mailables, API Resources, and protected routing.

**Frontend (React)**
- **Framework:** React 19 
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS (Utility-first CSS with custom "neu-card" component classes)
- **State Management:** React Context API
- **HTTP Client:** Axios (with automatic token interception)
- **Markdown Rendering:** react-markdown (for precise AI output formatting)
- **Charts:** Chart.js / react-chartjs-2

**Browser Extensions**
- Vanilla JavaScript / HTML / CSS
- Built for Chrome (Manifest V3) and Firefox

---

## 💻 Getting Started (Local Development)

### Prerequisites
- **PHP** (8.2 or higher)
- **Composer**
- **Node.js** (v18 or higher) and **npm**
- A local database server (MySQL, PostgreSQL, or SQLite)

### 1. Backend Setup (Laravel)
Open your terminal and navigate to the `/laravel` directory:

```bash
cd laravel

# Install PHP dependencies
composer install

# Copy the environment configuration file
cp .env.example .env

# Generate a new application key
php artisan key:generate

# Configure your database credentials in the .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# ...

# Run database migrations
php artisan migrate

# Start the local development server
php artisan serve
```
The backend API will typically run on `http://localhost:8000`.

### 2. Frontend Setup (React)
Open a new terminal window and navigate to the `/app` directory:

```bash
cd app

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
The frontend will typically run on `http://localhost:5173`. Vite is configured to proxy API requests directly to your local Laravel server to prevent CORS issues.

### 3. Creating an Admin Account
To access the Admin Panel locally, you can create a test administrator account using Laravel Tinker. In your `/laravel` directory:

```bash
php artisan tinker
```
Then paste the following command:
```php
App\Models\User::create([
    'name' => 'Admin User',
    'email' => 'admin@example.com',
    'password' => Hash::make('password123'),
    'is_admin' => true,
    'is_active' => true
]);
```
You can now log into the frontend at `http://localhost:5173/login` using these credentials.

---

## 🧩 Project Structure

- `/laravel/`: The core backend API. Handles business logic, database interactions, authentication, and AI integrations.
- `/app/`: The React Single Page Application (SPA). Consumes the Laravel API and provides the user interface.
- `/extension/`: Browser extensions (`extension-chrome` / `extension-firefox`) that allow users to interact with Applyr directly from external job boards.
