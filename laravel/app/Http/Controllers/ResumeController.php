<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Models\AiLog;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class ResumeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $resumes = $request->user()
            ->resumes()
            ->with('application')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($resumes);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_id' => ['nullable', 'exists:applications,id'],
            'content' => ['required', 'string'],
            'language' => ['sometimes', 'string'],
        ]);

        $validated['user_id'] = $request->user()->id;

        $resume = Resume::create($validated);

        return response()->json($resume, 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $resume = $request->user()->resumes()->findOrFail($id);

        return response()->json($resume);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $resume = $request->user()->resumes()->findOrFail($id);

        $validated = $request->validate([
            'content' => ['sometimes', 'string'],
            'language' => ['sometimes', 'string'],
            'is_finalized' => ['sometimes', 'boolean'],
        ]);

        $resume->update($validated);

        return response()->json($resume);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $resume = $request->user()->resumes()->findOrFail($id);

        $resume->delete();

        return response()->json(['message' => 'Resume deleted']);
    }

    public function exportPdf(Request $request, int $id): JsonResponse
    {
        $resume = $request->user()->resumes()->findOrFail($id);

        $html = nl2br(e($resume->content));

        $pdf = Pdf::loadHTML($html);

        $filename = "resume_{$resume->id}_" . now()->format('Ymd') . '.pdf';

        $path = "pdfs/{$filename}";
        Storage::disk('public')->put($path, $pdf->output());

        return response()->json([
            'url' => Storage::url($path),
            'filename' => $filename,
        ]);
    }

    public function generateWithAi(Request $request, int $id): JsonResponse
    {
        $resume = $request->user()->resumes()->findOrFail($id);

        $apiKey = config('services.openrouter.api_key');

        if (!$apiKey) {
            return response()->json(['message' => 'AI not configured'], 500);
        }

        $application = $resume->application;
        $user = $request->user();

        $prompt = "Generate a tailored resume for the following job application:\n\n";
        $prompt .= "Company: {$application->company_name}\n";
        $prompt .= "Position: {$application->position}\n";
        $prompt .= "Job Description/Notes: {$application->notes}\n\n";
        $prompt .= "User Profile (Base Resume):\n{$resume->content}\n\n";
        $prompt .= "Generate an optimized resume in {$resume->language} language. Return only the resume content.";

        try {
            $response = Http::withHeader('Authorization', "Bearer {$apiKey}")
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if ($response->failed()) {
                return response()->json(['message' => 'AI service error', 'error' => $response->body()], 500);
            }

            $data = $response->json();

            $generatedContent = $data['choices'][0]['message']['content'] ?? $resume->content;

            $tokensUsed = $data['usage']['total_tokens'] ?? 0;

            AiLog::create([
                'user_id' => $user->id,
                'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                'tokens_used' => $tokensUsed,
                'purpose' => 'resume_generation',
                'prompt' => $prompt,
                'response' => $generatedContent,
                'created_at' => now(),
            ]);

            $resume->update(['content' => $generatedContent]);

            return response()->json($resume);
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI error: ' . $e->getMessage()], 500);
        }
    }
}