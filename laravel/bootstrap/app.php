<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // The rate limiters key off $request->ip(). Behind a load balancer or
        // Cloudflare that would be the proxy's IP for everyone, so set
        // TRUSTED_PROXIES in production (comma separated, or * if the app is
        // only reachable through the proxy). Left unset, IPs come straight from
        // REMOTE_ADDR, which is correct for a same-host nginx/php-fpm setup.
        if ($proxies = env('TRUSTED_PROXIES')) {
            $middleware->trustProxies(
                at: $proxies === '*' ? '*' : array_map('trim', explode(',', $proxies))
            );
        }

        $middleware->statefulApi();
        // Laravel no longer throttles the api group by default; the 'api'
        // limiter is defined in AppServiceProvider.
        $middleware->throttleApi();
        $middleware->appendToGroup('api', \App\Http\Middleware\EnsureUserIsActive::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function ($request, \Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
