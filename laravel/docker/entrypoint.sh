#!/bin/sh
set -e

export PORT="${PORT:-8080}"
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

php artisan config:cache
php artisan migrate --force

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
