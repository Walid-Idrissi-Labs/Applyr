<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Application;
use App\Models\AiLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\UserCreatedByAdmin;

class AdminController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'is_admin' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $plainPassword = Str::random(12);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($plainPassword),
            'is_admin' => $validated['is_admin'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        try {
            Mail::to($user->email)->send(new UserCreatedByAdmin($user, $plainPassword));
        } catch (\Exception $e) {
            // Ignore mail errors for local testing if mailer is not configured
        }

        return response()->json($user, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
        ]);

        $user->update($validated);

        return response()->json($user);
    }
    public function stats(): JsonResponse
    {
        $totalUsers = User::count();
        $totalApplications = Application::count();
        $totalAiTokens = AiLog::sum('tokens_used');

        $monthlyUsers = User::selectRaw("DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count")
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        return response()->json([
            'total_users' => $totalUsers,
            'total_applications' => $totalApplications,
            'total_ai_tokens' => $totalAiTokens,
            'monthly_users' => $monthlyUsers,
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::withCount('applications');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                #sqlite optimized
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
                #postgres optimized
                #$q->where('company_name', 'ilike', "%{$search}%")
                #->orWhere('position', 'ilike', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function deactivate(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->update(['is_active' => false]);

        return response()->json($user);
    }

    public function activate(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->update(['is_active' => true]);

        return response()->json($user);
    }

    public function grantAdmin(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->update(['is_admin' => true]);

        return response()->json($user);
    }

    public function revokeAdmin(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->update(['is_admin' => false]);

        return response()->json($user);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function aiLogs(Request $request): JsonResponse
    {
        $logs = AiLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
}