<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = Tag::orderBy('name')->get();

        return response()->json($tags);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:tags,name'],
        ]);

        $tag = Tag::create($validated);

        return response()->json($tag, 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $tag = Tag::findOrFail($id);

        $tag->applications()->detach();

        $tag->delete();

        return response()->json(['message' => 'Tag deleted']);
    }
}