<?php

namespace App\Http\Controllers;

use App\Models\AiLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiController extends Controller
{
    public function extractJob(Request $request): JsonResponse
    {
        // Only the first 15k chars are ever sent upstream, so cap the accepted
        // payload well below that headroom instead of buffering megabytes.
        $validated = $request->validate([
            'html' => ['required', 'string', 'max:100000'],
            'url' => ['nullable', 'url', 'max:2048'],
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
                ->timeout(60)
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                ]);

            if ($response->failed()) {
                // Keep the upstream body in the logs, not in the HTTP response:
                // it can echo provider details back to the caller.
                Log::warning('OpenRouter job extraction failed', [
                    'user_id' => $request->user()->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json(['message' => 'AI service error'], 502);
            }

            $data = $response->json();

            $content = $data['choices'][0]['message']['content'] ?? '';

            $content = trim($content);
            $content = preg_replace('/^```json\s*/i', '', $content);
            $content = preg_replace('/^```\s*/', '', $content);
            $content = trim($content);

            $extracted = json_decode($content, true);

            // Log every completed call, not just the ones that parsed cleanly —
            // the credits are spent either way and this is the audit trail the
            // admin AI-log screen reads.
            AiLog::create([
                'user_id' => $request->user()->id,
                'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                'tokens_used' => $data['usage']['total_tokens'] ?? 0,
                'purpose' => 'job_extraction',
                'prompt' => $prompt,
                'response' => $content,
                'created_at' => now(),
            ]);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'company' => '',
                    'position' => '',
                    'description' => substr($content, 0, 500),
                    'language' => 'en',
                ]);
            }

            return response()->json($extracted);
        } catch (\Exception $e) {
            Log::error('AI job extraction threw', [
                'user_id' => $request->user()->id,
                'exception' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'AI request failed. Please try again.'], 500);
        }
    }
}