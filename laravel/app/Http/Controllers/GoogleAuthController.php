<?php

namespace App\Http\Controllers;

use App\Models\OAuthIdentity;
use App\Models\OAuthLoginCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * Send the browser to Google. Socialite stores a random state value in the
     * Laravel session, then checks it when Google returns to the callback.
     */
    public function redirect(): RedirectResponse
    {
        abort_unless($this->isConfigured(), 503, 'Google sign-in is not configured.');

        return Socialite::driver('google')->redirect();
    }

    /**
     * Verify Google’s response, then pass a short-lived, single-use code back
     * to the SPA. We never put a Sanctum bearer token in a redirect URL.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            $googleId = $googleUser->getId();
            $email = strtolower(trim((string) $googleUser->getEmail()));
            $emailIsVerified = filter_var(
                $googleUser->getRaw()['email_verified'] ?? false,
                FILTER_VALIDATE_BOOLEAN
            );

            if (! $googleId || ! filter_var($email, FILTER_VALIDATE_EMAIL) || ! $emailIsVerified) {
                Log::warning('Google OAuth response did not include a verified identity.');

                return $this->redirectToFrontendWithError('identity_unavailable');
            }

            [$user, $plainCode] = DB::transaction(function () use ($googleId, $email, $googleUser) {
                $identity = OAuthIdentity::query()
                    ->where('provider', 'google')
                    ->where('provider_user_id', $googleId)
                    ->lockForUpdate()
                    ->first();

                if ($identity) {
                    $user = $identity->user;
                } else {
                    // A verified Google email may safely connect to the matching
                    // local account, avoiding duplicate accounts and lost data.
                    $user = User::query()->where('email', $email)->lockForUpdate()->first();

                    if (! $user) {
                        $user = User::create([
                            'name' => $googleUser->getName() ?: Str::before($email, '@'),
                            'email' => $email,
                            // A Google-only account starts without a local
                            // password and may set one later from its profile.
                            'password' => null,
                            'is_active' => true,
                        ]);
                        $user->forceFill(['email_verified_at' => now()])->save();
                    }

                    OAuthIdentity::create([
                        'user_id' => $user->id,
                        'provider' => 'google',
                        'provider_user_id' => $googleId,
                    ]);
                }

                if (! $user->is_active) {
                    return [$user, null];
                }

                OAuthLoginCode::query()->where('expires_at', '<', now())->delete();

                $plainCode = Str::random(64);
                OAuthLoginCode::create([
                    'user_id' => $user->id,
                    'code_hash' => hash('sha256', $plainCode),
                    'expires_at' => now()->addMinutes(config('services.google.login_code_expire')),
                ]);

                return [$user, $plainCode];
            });

            if (! $plainCode) {
                return $this->redirectToFrontendWithError('account_inactive');
            }

            return redirect(rtrim(config('app.frontend_url'), '/').'/oauth/callback?code='.urlencode($plainCode));
        } catch (\Throwable $exception) {
            // OAuth failures include a rejected state token, denied consent,
            // and provider/network failures. Do not expose their internals.
            Log::warning('Google OAuth callback failed.', ['exception' => $exception->getMessage()]);

            return $this->redirectToFrontendWithError('google_sign_in_failed');
        }
    }

    /**
     * Exchange the callback code for the same Sanctum token returned by the
     * email/password login endpoint.
     */
    public function exchange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'size:64'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $loginCode = OAuthLoginCode::query()
                ->where('code_hash', hash('sha256', $validated['code']))
                ->lockForUpdate()
                ->first();

            if (! $loginCode || $loginCode->expires_at->isPast()) {
                if ($loginCode) {
                    $loginCode->delete();
                }

                return null;
            }

            $user = $loginCode->user;
            $loginCode->delete();

            return $user->is_active ? $user : null;
        });

        if (! $user) {
            return response()->json(['message' => 'This Google sign-in link is invalid or has expired.'], 422);
        }

        return response()->json([
            'user' => $user,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    private function isConfigured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'))
            && filled(config('services.google.redirect'));
    }

    private function redirectToFrontendWithError(string $error): RedirectResponse
    {
        return redirect(rtrim(config('app.frontend_url'), '/').'/oauth/callback?error='.urlencode($error));
    }
}
