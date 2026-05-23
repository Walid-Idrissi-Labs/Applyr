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
        $resume = $request->user()
            ->resumes()
            ->with(['application.resumes'])
            ->findOrFail($id);

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

    public function extract(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => ['sometimes', 'string'],
            'file' => ['sometimes', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        $apiKey = config('services.openrouter.api_key');
        if (!$apiKey) return response()->json(['message' => 'AI not configured'], 500);

        $text = $request->input('text', '');

        // If file provided, we would parse it here. For now, we'll assume text is passed or use a placeholder.
        // In a real app, you'd use a PDF parser library.
        
        $systemPrompt = "You are a professional resume architect. Your task is to take raw, messy career information and transform it into a clean, structured, and professional resume in Markdown format. \n\n CRITICAL: Do NOT invent information. Use ONLY what is provided. Organize it logically into: Professional Summary, Experience, Education, and Skills.\n\n Output strictly the Markdown resume.";

        try {
            $response = Http::withHeader('Authorization', "Bearer {$apiKey}")
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => "RAW CAREER INFO:\n" . substr($text, 0, 10000)],
                    ],
                ]);

            if ($response->failed()) return response()->json(['message' => 'AI service error'], 500);

            $generatedContent = $response->json()['choices'][0]['message']['content'] ?? '';

            return response()->json(['content' => $generatedContent]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI error: ' . $e->getMessage()], 500);
        }
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

        // Check if we are refining an existing draft or starting fresh
        $isRefinement = $resume->content && $resume->content !== 'Generating...';
        
        if ($isRefinement) {
            $baseContent = $resume->content;
            $instructions = $request->input('notes', 'Improve the resume based on best practices.');
        } else {
            // Fresh generation from Global Base Resume
            $baseResume = $user->resumes()->whereNull('application_id')->latest()->first();
            $baseContent = $baseResume ? $baseResume->content : 'No base resume provided.';
            $instructions = "Tailor this resume to perfectly match the provided job description. Naturally integrate relevant keywords, move the most relevant experience to the top, and trim irrelevant information.";
        }

        $systemPrompt = "You are an expert career coach and professional resume writer. Your task is to architect a perfect resume. \n\n CRITICAL CONSTRAINT: You may ONLY use information explicitly present in the provided source material. Do NOT invent, infer, or add any content that is not already there (certifications, skills, projects, etc.). Your job is to reframe and reorganize what is already there.\n\n Output strictly the tailored resume in clean Markdown format with no conversational filler.";

        $userPrompt = "SOURCE MATERIAL:\n{$baseContent}\n\n";
        
        if ($application) {
            $userPrompt .= "TARGET JOB:\nCompany: {$application->company_name}\nPosition: {$application->position}\nDescription: {$application->notes}\n\n";
        }

        $userPrompt .= "INSTRUCTIONS:\n{$instructions}\n\nTARGET LANGUAGE: " . ($resume->language ?? 'en');

        try {
            $response = Http::withHeader('Authorization', "Bearer {$apiKey}")
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $userPrompt],
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
                'purpose' => $isRefinement ? 'resume_refinement' : 'resume_generation',
                'prompt' => $systemPrompt . "\n\n" . $userPrompt,
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