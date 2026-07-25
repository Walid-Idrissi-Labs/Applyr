<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Named rate limiters used by the throttle middleware.
     */
    protected function configureRateLimiting(): void
    {
        // Backstop applied to every API route. Generous on purpose: it exists to
        // stop scripted hammering, not to get in a real user's way.
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(180)->by('api:user:'.$request->user()->id)
                : Limit::perMinute(60)->by('api:ip:'.$request->ip());
        });

        // Credential endpoints: login, register, password reset, email verify.
        // Keyed per email+IP so one attacker cannot lock a real user out of
        // their own account, plus a wider per-IP ceiling to stop account
        // farming and mail bombing.
        RateLimiter::for('auth', function (Request $request) {
            $email = strtolower(trim((string) $request->input('email')));

            return [
                Limit::perMinute(5)
                    ->by('auth:cred:'.sha1($email.'|'.$request->ip()))
                    ->response($this->tooManyRequests('Too many attempts. Please wait a minute and try again.')),
                Limit::perHour(30)
                    ->by('auth:ip:'.$request->ip())
                    ->response($this->tooManyRequests('Too many attempts from this network. Please try again later.')),
            ];
        });

        // Anything that spends OpenRouter tokens. Every one of these calls costs
        // real money, so the limits are tight and layered: burst, daily per
        // account, and a per-IP ceiling so registering throwaway accounts does
        // not multiply the damage.
        RateLimiter::for('ai', function (Request $request) {
            $user = $request->user();

            // Should be unreachable (these routes sit behind auth:sanctum), but
            // fail closed rather than handing an anonymous caller free credits.
            if (! $user) {
                return Limit::perHour(3)
                    ->by('ai:anon:'.$request->ip())
                    ->response($this->tooManyRequests('Authentication is required for AI features.'));
            }

            return [
                Limit::perMinute(5)
                    ->by('ai:burst:'.$user->id)
                    ->response($this->tooManyRequests('You are sending AI requests too quickly. Please wait a moment.')),
                Limit::perDay(50)
                    ->by('ai:daily:'.$user->id)
                    ->response($this->tooManyRequests('You have reached your daily AI limit. It resets in 24 hours.')),
                Limit::perHour(60)
                    ->by('ai:ip:'.$request->ip())
                    ->response($this->tooManyRequests('Too many AI requests from this network. Please try again later.')),
            ];
        });
    }

    /**
     * Build a 429 handler whose body matches the shape the frontend reads.
     */
    protected function tooManyRequests(string $message): callable
    {
        return function (Request $request, array $headers) use ($message) {
            return response()->json(['message' => $message], 429, $headers);
        };
    }
}
