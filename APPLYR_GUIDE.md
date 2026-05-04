# Applyr: SaaS Job Application Tracker - Comprehensive Project Specification

Applyr is a centralized SaaS platform for tracking job applications, generating tailored resumes, and managing the career search lifecycle using a decoupled **React** frontend and **Laravel API** backend.

---

## 1. Project Overview

### 1.1 Context and Origin
The job search process is often chaotic, managed through scattered spreadsheets and emails. Applyr provides job seekers with a professional, centralized tool to manage their applications, track status transitions, and never miss a follow-up.

### 1.2 Problem Statement
How can a user centralize all job applications, track their evolution through successive statuses, be reminded at the right time for follow-ups, and view clear statistical indicators of their progress?

### 1.3 Project Objectives
- **Centralize:** All applications in one web-accessible location.
- **Track Progress:** Manage a lifecycle of statuses with a dated history.
- **Notify:** Automated reminders via email and in-app alerts.
- **Analyze:** Dashboard with KPIs like response rate and success rate.
- **Search & Filter:** Efficient retrieval by company, position, status, or date.
- **Label:** Organize applications with custom tags.

---

## 2. Technical Stack & Architecture

- **Frontend:** React (SPA) hosted on **Vercel**. Frontend implementation MUST be identical to the provided UI mockups in `app/`.
- **Backend:** Laravel 12 (API only) hosted on **Render**. Code must be kept as simple and self-explanatory as possible, ideal for a school project.
- **Database:** PostgreSQL hosted on **Render**.
- **Styling:** Tailwind CSS.
- **AI Integration:** OpenRouter API (`openai/gpt-oss-20b:free`) for extraction and generation.
- **PDF Generation:** `dompdf` or `laravel-snappy`.
- **Email:** SMTP (Brevo for production and development).

---

## 3. Database Schema (Logical Data Model)

### Core Tables
- **users:** `id`, `name`, `email`, `password`, `is_admin` (Boolean), `created_at`.
- **applications:** `id`, `user_id` (FK), `company_name`, `position`, `status`, `applied_at`, `link`, `notes`, `source`, `reminder_date`, `posting_language`, `created_at`, `updated_at`.
- **status_histories:** `id`, `application_id` (FK), `old_status`, `new_status`, `changed_at`. (Created automatically on status change).
- **tasks:** `id`, `application_id` (FK), `text`, `is_done` (Boolean).
- **notifications:** `id`, `user_id` (FK), `message`, `read_at` (nullable), `created_at`.
- **documents:** `id`, `application_id` (FK), `file_path`, `file_type` (CV, Cover Letter, Job Posting), `file_name`, `file_size`.
- **tags:** `id`, `name` (Unique).
- **application_tag:** `application_id` (FK), `tag_id` (FK).
- **resumes:** `id`, `user_id` (FK), `application_id` (FK), `content` (Markdown/JSON draft), `language`, `is_finalized`.

---

## 4. User Features (Granular)

### 4.1 Dashboard
- **KPI Cards:** Display total applications, "In Progress" (Wishlist to Offer), "Rejections," and "Accepted."
- **Status Breakdown:** Pie chart (using Chart.js or similar) showing the distribution of application statuses.
- **Key Indicators:** "Response Rate" (Apps with non-Wishlist status / Total) and "Success Rate" (Accepted / Total).
- **Recent Activity:** A list of the 5 most recent status changes or reminders.

### 4.2 Application Management
- **View Modes:** Toggle between "List View" (table) and "Board View" (Kanban).
- **CRUD:** Full Create, Read, Update, Delete functionality.
- **Rich Detail View:**
  - **Information Card:** Displays company, role, date applied, source, tags, and link.
  - **Status History:** A vertical timeline showing every stage the application has passed through.
  - **Task Manager:** Simple checklists for sub-tasks (e.g., "Prepare for HR interview").
  - **Document Center:** Upload and view files (CVs, etc.) attached to the application.
  - **Notes:** A rich-text or plain-text area for interview notes and company info.

### 4.3 Notification Center
- Bell icon in the header showing unread count.
- List view of all notifications (Reminders, Extension imports, etc.).
- **Multi-channel:** Notifications are triggered in-app and via email (using free SMTP relay services).
- "Mark all as read" and "Delete" actions.

### 4.4 Profile & Settings
- Manage name and email.
- Change password.
- Theme toggle (Light/Dark mode).
- **Authentication:** Standard email/password registration with "Remember Me" and "Forgot Password" functionality.

---

## 5. Admin Features (SaaS Management)

### 5.1 Admin Dashboard (`/admin`)
- **System Overview:** Total users, total applications platform-wide, total AI processing tokens used.
- **User Growth Chart:** Monthly registration trends.

### 5.2 User Management
- **User Table:** Searchable list of all registered users with their registration date and application count.
- **Account Actions:**
  - **Deactivate/Activate:** Prevent a user from logging in without deleting their data.
  - **Role Management:** Grant or revoke Admin privileges.
  - **Delete User:** Permanently remove a user and all their associated data (Cascading delete).

### 5.3 System Logs
- View a history of AI API calls to monitor costs and performance.

---

## 6. AI & Extension Logic

### 6.1 Browser Extension (AI Extraction)
- **Input Channels:** Strictly limited to manual entry by the user and via the Browser Extension.
- **Process:**
  - User triggers extraction on a job page.
  - HTML is sent to the **Laravel API**.
  - Server calls **OpenRouter (`gpt-oss-20b:free`)**.
  - Resulting JSON (Company, Position, Desc, Language) is returned to the extension.
  - **Editable UI:** The extension displays a form with the results. User edits `name` or `description` if needed, then saves.

### 6.2 Iterative Resume Generation
- **Strategy:** Persistent storage of user data.
    - **Global/Base Resume:** Each user maintains a "master" profile (experience, skills, projects) which serves as the base context for AI generation.
    - **Targeted Resumes:** Users generate specific versions of their resume for each job application, localized by language and optimized based on the job description.
- **Workflow:** 
    - Generate (Draft) -> Review -> Refine (via prompt) -> Finalize -> Export (PDF).

---

## 7. Implementation Blueprint (Architecture & Deployment)

### A. Hosting Strategy
- **Frontend:** React SPA deployed to Vercel. Frontend implementation MUST be identical to the provided UI mockups in `app/`.
- **Backend:** Laravel API deployed to Render. Code must be kept as simple and self-explanatory as possible, ideal for a school project.
- **Database:** PostgreSQL managed service on Render.

### B. Styling
- Use **Tailwind CSS**.
- **Theming:** Themes must be modular and modifiable directly in the source code to allow for easy implementation of future themes.
- **Current Aesthetic:** Follow the "Neubrutalism" or "Clean Modern" style seen in current mockups (heavy borders, sharp shadows, bold typography). Frontend implementation MUST be identical to the provided UI mockups in `app/`.

### C. Logic
- **Reminders:** Scheduled task (Laravel Task Scheduling) runs daily at 8:00 AM.
- **State Management:** React Context API or similar state management library for the frontend.
