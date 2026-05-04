# Deployment Guide for Applyr (Laravel + Frontend)

This guide will help you deploy the Applyr project (Laravel backend and frontend) to a production environment.

---

## 1. Prerequisites
- **Server:** Linux (Ubuntu, Arch, etc.)
- **Web Server:** Nginx or Apache
- **PHP:** 8.1 or higher (with extensions: pdo, mbstring, tokenizer, xml, ctype, json, bcmath, openssl, iconv, fileinfo, curl)
- **Composer**
- **Node.js & npm**
- **MySQL** (or compatible DB)

---

## 2. Clone the Repository
```
git clone <your-repo-url>
cd walid_attempt/Applyr
```

---

## 3. Backend (Laravel) Setup
```
cd laravel
composer install
cp .env.example .env
# Edit .env for your production DB and settings
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Permissions
```
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

---

## 4. Frontend Setup
```
cd ../app
npm install
npm run build
```
- The build output will be in `app/dist` or as configured in Vite.
- Configure your web server to serve the frontend from this directory.

---

## 5. Web Server Configuration
- **Laravel:** Point your web server root to `laravel/public`
- **Frontend:** Serve static files from `app/dist` (or your build output)
- **SSL:** (Recommended) Set up HTTPS with Let's Encrypt or similar.

---

## 6. Environment & Security
- Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
- Set proper permissions for sensitive files
- Use strong DB credentials

---

## 7. Queue/Jobs (Optional)
If you use queues:
```
php artisan queue:work --daemon --timeout=60 --tries=3
```

---

## 8. Cron Jobs (Optional)
For scheduled tasks, add to your crontab:
```
* * * * * cd /path/to/laravel && php artisan schedule:run >> /dev/null 2>&1
```

---

## 9. Troubleshooting
- Check logs in `laravel/storage/logs`
- Use `php artisan config:clear` if you change environment variables

---

## 10. Useful Commands
- `php artisan migrate --force` (run migrations in production)
- `php artisan cache:clear` (clear cache)
- `npm run build` (build frontend for production)

---

## 11. Browser Extensions
- Load `extension/extension-chrome` or `extension/extension-firefox` as unpacked extensions in your browser for development/testing.

---

## 12. Support
For issues, check the README or contact the project maintainer.
