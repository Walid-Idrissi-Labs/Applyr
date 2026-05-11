<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\WelcomeMail;
use App\Mail\PasswordResetMail;
use App\Mail\EmailVerificationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user,
                'token' => $token,
            ];
        });

        $user = $result['user'];
        $token = $result['token'];

        try {
            Mail::to($user->email)->send(new WelcomeMail(
                userName: $user->name,
            ));
        } catch (\Throwable $e) {
            // Email failure should not break registration
        }

        $this->dispatchEmailVerification($user);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function sendEmailVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $this->dispatchEmailVerification($user);

        return response()->json(['message' => 'Verification link sent.']);
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'token' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No account found for this email.'],
            ]);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email already verified.',
                'user' => $user,
            ]);
        }

        $record = DB::table('email_verification_tokens')->where('email', $validated['email'])->first();

        if (!$record || !Hash::check($validated['token'], $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['The verification token is invalid.'],
            ]);
        }

        $expireMinutes = (int) config('auth.email_verification.expire', 60);
        $expiresAt = now()->subMinutes($expireMinutes);

        if (!$record->created_at || Carbon::parse($record->created_at)->lt($expiresAt)) {
            DB::table('email_verification_tokens')->where('email', $validated['email'])->delete();
            throw ValidationException::withMessages([
                'token' => ['The verification token has expired.'],
            ]);
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        DB::table('email_verification_tokens')->where('email', $validated['email'])->delete();

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => $user,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user()->load('notifications'));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
        ]);

        $user = $request->user();
        $originalEmail = $user->email;

        $user->update($validated);

        if (array_key_exists('email', $validated) && $validated['email'] !== $originalEmail) {
            $user->forceFill(['email_verified_at' => null])->save();
            $this->dispatchEmailVerification($user);
        }

        return response()->json($user);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (!Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $request->user()->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user) {
            $token = \Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $validated['email']],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            $resetUrl = $frontendUrl . '/reset-password?token=' . urlencode($token) . '&email=' . urlencode($validated['email']);
            $expireMinutes = (int) config('auth.passwords.users.expire', 60);

            try {
                Mail::to($user->email)->send(new PasswordResetMail(
                    userName: $user->name,
                    resetUrl: $resetUrl,
                    expireMinutes: $expireMinutes,
                ));
            } catch (\Throwable $e) {
                // Email failure should not reveal account status
            }
        }

        return response()->json(['message' => 'If an account exists, a reset link has been sent.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $validated['email'])->first();

        if (!$record || !Hash::check($validated['token'], $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['The reset token is invalid.'],
            ]);
        }

        $expireMinutes = (int) config('auth.passwords.users.expire', 60);
        $expiresAt = now()->subMinutes($expireMinutes);

        if (!$record->created_at || Carbon::parse($record->created_at)->lt($expiresAt)) {
            DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();
            throw ValidationException::withMessages([
                'token' => ['The reset token has expired.'],
            ]);
        }

        $user = User::where('email', $validated['email'])->first();
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['No account found for this email.'],
            ]);
        }
        $user->update(['password' => Hash::make($validated['password'])]);

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return response()->json(['message' => 'Password reset successfully']);
    }

    private function dispatchEmailVerification(User $user): void
    {
        $token = Str::random(64);

        DB::table('email_verification_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $frontendUrl = rtrim(config('app.frontend_url') ?? config('app.url'), '/');
        $verifyUrl = $frontendUrl . '/verify-email?token=' . urlencode($token) . '&email=' . urlencode($user->email);
        $expireMinutes = (int) config('auth.email_verification.expire', 60);

        try {
            Mail::to($user->email)->send(new EmailVerificationMail(
                userName: $user->name,
                verifyUrl: $verifyUrl,
                expireMinutes: $expireMinutes,
            ));
        } catch (\Throwable $e) {
            // Email failure should not break verification flow
        }
    }
}