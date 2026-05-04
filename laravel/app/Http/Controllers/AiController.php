<?php

namespace App\Http\Controllers;

use App\Models\AiLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class AiController extends Controller
{
    public function extractJob(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'html' => ['required', 'string'],
            'url' => ['nullable', 'url'],
        ]);

        $apiKey = config('services.openrouter.api_key');

        if (!$apiKey) {
            return response()->json(['message' => 'AI not configured'], 500);
        }

        $prompt = "Extract job information from the following HTML page content. Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
    \"company\": \"Company Name\",
    \"position\": \"Job Title\",
    \"description\": \"Job description summary\",
    \"language\": \"en\"
}

HTML Content:
" . substr($validated['html'], 0, 15000);

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

            $content = $data['choices'][0]['message']['content'] ?? '';

            $content = trim($content);
            $content = preg_replace('/^```json\s*/i', '', $content);
            $content = preg_replace('/^```\s*/', '', $content);
            $content = trim($content);

            $extracted = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'company' => '',
                    'position' => '',
                    'description' => substr($content, 0, 500),
                    'language' => 'en',
                ]);
            }

            if ($request->user()) {
                AiLog::create([
                    'user_id' => $request->user()->id,
                    'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                    'tokens_used' => $data['usage']['total_tokens'] ?? 0,
                    'purpose' => 'job_extraction',
                    'prompt' => $prompt,
                    'response' => $content,
                    'created_at' => now(),
                ]);
            }

            return response()->json($extracted);
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI error: ' . $e->getMessage()], 500);
        }
    }
}