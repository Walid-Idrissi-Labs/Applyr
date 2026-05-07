<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\StatusHistory;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->applications()->with('tags');

        $status = $request->has('status') ? $this->normalizeStatus($request->status) : null;

        if ($status && $status !== 'all') {
            $query->whereRaw('LOWER(status) = ?', [$status]);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                #sqlite optimized
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
                #postgres optimized
                #$q->where('company_name', 'ilike', "%{$search}%")
                #->orWhere('position', 'ilike', "%{$search}%");
            });
        }

        if ($request->has('tag_id')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tags.id', $request->tag_id);
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = $request->get('per_page', 15);
        $applications = $query->paginate($perPage);

        return response()->json($applications);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
            'applied_at' => ['nullable', 'date'],
            'link' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
            'source' => ['nullable', 'string'],
            'reminder_date' => ['nullable', 'date'],
            'posting_language' => ['sometimes', 'string'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['exists:tags,id'],
        ]);

        if (isset($validated['status'])) {
            $validated['status'] = $this->normalizeStatus($validated['status']);
        }

        $validated['user_id'] = $request->user()->id;

        $application = Application::create($validated);

        if (!isset($validated['status'])) {
            StatusHistory::create([
                'application_id' => $application->id,
                'old_status' => null,
                'new_status' => 'wishlist',
                'changed_at' => now(),
            ]);
        } else {
            StatusHistory::create([
                'application_id' => $application->id,
                'old_status' => null,
                'new_status' => $validated['status'],
                'changed_at' => now(),
            ]);
        }

        if (!empty($validated['tag_ids'])) {
            $application->tags()->attach($validated['tag_ids']);
        }

        return response()->json($application->load('tags'), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $application = $request->user()
            ->applications()
            ->with(['tags', 'statusHistories', 'tasks', 'documents', 'resume'])
            ->findOrFail($id);

        return response()->json($application);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $application = $request->user()->applications()->findOrFail($id);

        $validated = $request->validate([
            'company_name' => ['sometimes', 'string', 'max:255'],
            'position' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string'],
            'applied_at' => ['nullable', 'date'],
            'link' => ['nullable', 'url'],
            'notes' => ['nullable', 'string'],
            'source' => ['nullable', 'string'],
            'reminder_date' => ['nullable', 'date'],
            'posting_language' => ['sometimes', 'string'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['exists:tags,id'],
        ]);

        if (isset($validated['status'])) {
            $normalizedStatus = $this->normalizeStatus($validated['status']);
            $currentStatus = $this->normalizeStatus($application->status);

            if ($normalizedStatus !== $currentStatus) {
                StatusHistory::create([
                    'application_id' => $application->id,
                    'old_status' => $currentStatus,
                    'new_status' => $normalizedStatus,
                    'changed_at' => now(),
                ]);
            }

            $validated['status'] = $normalizedStatus;
        }

        $application->update($validated);

        if (isset($validated['tag_ids'])) {
            $application->tags()->sync($validated['tag_ids']);
        }

        return response()->json($application->load('tags', 'statusHistories'));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $application = $request->user()->applications()->findOrFail($id);

        foreach ($application->documents as $doc) {
            Storage::disk('public')->delete($doc->file_path);
        }

        $application->delete();

        return response()->json(['message' => 'Application deleted']);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $application = $request->user()->applications()->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        $oldStatus = $this->normalizeStatus($application->status);
        $newStatus = $this->normalizeStatus($validated['status']);

        $application->update(['status' => $newStatus]);

        StatusHistory::create([
            'application_id' => $application->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_at' => now(),
        ]);

        Notification::create([
            'user_id' => $request->user()->id,
            'type' => 'status_change',
            'message' => "Application for {$application->company_name} moved from {$oldStatus} to {$newStatus}",
        ]);

        return response()->json($application->load('tags', 'statusHistories'));
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $total = $user->applications()->count();

        $statusCounts = $user->applications()
            ->selectRaw('LOWER(status) as status, COUNT(*) as count')
            ->groupByRaw('LOWER(status)')
            ->pluck('count', 'status');

        $wishlistCount = $statusCounts->get('wishlist', 0);
        $appliedCount = $statusCounts->get('applied', 0);
        $interviewCount = $statusCounts->get('interview', 0);
        $technicalTestCount = $statusCounts->get('technical test', 0);
        $offerCount = $statusCounts->get('offer', 0);
        $rejectedCount = $statusCounts->get('rejected', 0);
        $acceptedCount = $statusCounts->get('accepted', 0);

        $responseRate = $total > 0
            ? round((($total - $wishlistCount - $appliedCount) / $total) * 100, 1)
            : 0;

        $successRate = $total > 0
            ? round(($acceptedCount / $total) * 100, 1)
            : 0;

        $recentActivity = StatusHistory::whereHas('application', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->with('application:id,company_name,position')
            ->orderBy('changed_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'total' => $total,
            'status_counts' => [
                'wishlist' => $wishlistCount,
                'applied' => $appliedCount,
                'interview' => $interviewCount,
                'technical test' => $technicalTestCount,
                'offer' => $offerCount,
                'rejected' => $rejectedCount,
                'accepted' => $acceptedCount,
            ],
            'response_rate' => $responseRate,
            'success_rate' => $successRate,
            'recent_activity' => $recentActivity,
        ]);
    }

    private function normalizeStatus(?string $status): ?string
    {
        if ($status === null) {
            return null;
        }

        return strtolower(trim($status));
    }
}