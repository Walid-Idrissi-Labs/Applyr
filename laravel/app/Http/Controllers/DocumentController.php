<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    public function index(Request $request, int $applicationId): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $documents = Document::where('application_id', $applicationId)->get();

        return response()->json($documents);
    }

    public function store(Request $request, int $applicationId): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $validated = $request->validate([
            'file' => ['required', 'file', 'max:10240'],
            'file_type' => ['required', 'string', 'in:cv,cover_letter,job_posting,other'],
        ]);

        $file = $validated['file'];
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'application_id' => $applicationId,
            'file_path' => $path,
            'file_type' => $validated['file_type'],
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json($document, 201);
    }

    public function download(Request $request, int $applicationId, int $id): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $document = Document::where('application_id', $applicationId)->findOrFail($id);

        if (!Storage::disk('public')->exists($document->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('public')->download(
            $document->file_path,
            $document->file_name
        );
    }

    public function destroy(Request $request, int $applicationId, int $id): JsonResponse
    {
        $request->user()->applications()->findOrFail($applicationId);

        $document = Document::where('application_id', $applicationId)->findOrFail($id);

        Storage::disk('public')->delete($document->file_path);

        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }
}