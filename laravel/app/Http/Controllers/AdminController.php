<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Application;
use App\Models\AiLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
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