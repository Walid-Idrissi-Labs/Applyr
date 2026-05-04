<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function index(Request $request, int $applicationId): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $tasks = Task::where('application_id', $applicationId)->orderBy('created_at')->get();

        return response()->json($tasks);
    }

    public function store(Request $request, int $applicationId): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $validated = $request->validate([
            'text' => ['required', 'string'],
        ]);

        $task = Task::create([
            'application_id' => $applicationId,
            'text' => $validated['text'],
        ]);

        return response()->json($task, 201);
    }

    public function update(Request $request, int $applicationId, int $id): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $task = Task::where('application_id', $applicationId)->findOrFail($id);

        $validated = $request->validate([
            'text' => ['sometimes', 'string'],
            'is_done' => ['sometimes', 'boolean'],
        ]);

        $task->update($validated);

        return response()->json($task);
    }

    public function destroy(Request $request, int $applicationId, int $id): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $task = Task::where('application_id', $applicationId)->findOrFail($id);

        $task->delete();

        return response()->json(['message' => 'Task deleted']);
    }
}