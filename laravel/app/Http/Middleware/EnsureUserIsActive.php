<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            $token = $user->currentAccessToken();

            if ($token) {
                $token->delete();
            } else {
                $user->tokens()->delete();
            }

            return response()->json([
                'message' => 'This account has been deactivated.',
            ], 401);
        }

        return $next($request);
    }
}
