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
        $file = $request->file('file');
        
        // Debug: Log exhaustive request info safely
        \Illuminate\Support\Facades\Log::info("Extraction debug info", [
            'content_type' => $request->header('Content-Type'),
            'has_file_method' => $request->hasFile('file'),
            'file_details' => $file ? [
                'name' => $file->getClientOriginalName(),
                'error' => $file->getError(),
                'valid' => $file->isValid(),
            ] : 'no file object',
        ]);

        if ($file && !$file->isValid()) {
            $error = $file->getError();
            $msg = 'The file failed to upload.';
            if ($error === UPLOAD_ERR_INI_SIZE) {
                $msg = 'The file exceeds the server limit of 2MB (upload_max_filesize).';
            }
            return response()->json(['message' => $msg, 'error_code' => $error], 422);
        }

        $validated = $request->validate([
            'text' => ['sometimes', 'string'],
            'file' => ['sometimes', 'file', 'mimes:pdf', 'max:2048'], // Reverting to 2MB to match server
        ]);

        $apiKey = config('services.openrouter.api_key');
        if (!$apiKey) return response()->json(['message' => 'AI not configured'], 500);

        $text = $request->input('text', '');

        if ($file && $file->isValid()) {
            $parser = new \Smalot\PdfParser\Parser();
            
            try {
                $pdf = $parser->parseFile($file->getPathname());
                $pages = $pdf->getPages();
                
                // Limit to 5 pages
                if (count($pages) > 5) {
                    return response()->json(['message' => 'PDF is too long. Please upload a maximum of 5 pages.'], 422);
                }

                $extractedText = $pdf->getText();
                
                // OCR Fallback if text is empty or too short (likely image-based)
                if (strlen(trim($extractedText)) < 150) {
                    try {
                        $extractedText = $this->performOcr($file->getPathname());
                    } catch (\Exception $ocrEx) {
                        // Log OCR failure but don't crash, might have some text anyway
                        \Illuminate\Support\Facades\Log::error("OCR failed: " . $ocrEx->getMessage());
                    }
                }

                if (empty(trim($extractedText))) {
                   return response()->json(['message' => 'No text could be extracted from this PDF. It might be password protected or purely image-based.'], 422);
                }

                $text = $extractedText;
            } catch (\Exception $e) {
                return response()->json(['message' => 'PDF processing failed: ' . $e->getMessage()], 500);
            }
        }

        if (empty(trim($text))) {
            return response()->json(['message' => 'No text could be found to structure. Please upload a file or paste text.'], 422);
        }

        $systemPrompt = "You are a professional resume architect. Your task is to take raw, messy career information and transform it into a clean, structured, and professional resume in Markdown format. \n\n CRITICAL: Do NOT invent information. Use ONLY what is provided. Organize it logically into: Professional Summary, Experience, Education, and Skills.\n\n Output strictly the Markdown resume.";

        try {
            $response = Http::withHeader('Authorization', "Bearer {$apiKey}")
                ->timeout(120) // 2 minutes
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => config('services.openrouter.model', 'openai/gpt-oss-20b:free'),
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => "RAW CAREER INFO:\n" . substr($text, 0, 12000)],
                    ],
                ]);

            if ($response->failed()) return response()->json(['message' => 'AI service error'], 500);

            $generatedContent = $response->json()['choices'][0]['message']['content'] ?? '';

            return response()->json(['content' => $generatedContent]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'AI error: ' . $e->getMessage()], 500);
        }
    }

    private function performOcr(string $filePath): string
    {
        $tempDir = storage_path('app/temp_ocr_' . uniqid());
        mkdir($tempDir, 0777, true);
        
        $outputBase = $tempDir . '/page';
        
        // Convert first 5 pages to images (300 DPI for better OCR)
        shell_exec("pdftoppm -f 1 -l 5 -png -r 300 " . escapeshellarg($filePath) . " " . escapeshellarg($outputBase));
        
        $files = glob($tempDir . '/*.png');
        $fullText = "";
        
        foreach ($files as $file) {
            $outputFile = $file . '_text';
            shell_exec("tesseract " . escapeshellarg($file) . " " . escapeshellarg($outputFile) . " -l eng+fra");
            
            if (file_exists($outputFile . '.txt')) {
                $fullText .= file_get_contents($outputFile . '.txt') . "\n";
            }
        }
        
        shell_exec("rm -rf " . escapeshellarg($tempDir));
        
        return $fullText;
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

        $systemPrompt = "You are an expert professional resume writer. Your task is to output a perfectly formatted resume in Markdown. \n\n CRITICAL RULES:\n 1. Output ONLY the resume content itself.\n 2. DO NOT include any introductory text, concluding remarks, or 'Notes' about the changes you made.\n 3. DO NOT include any commentary like 'This resume highlights...' or 'I have optimized...'.\n 4. You may ONLY use information explicitly present in the provided source material.\n 5. Output strictly valid Markdown.";

        $userPrompt = "SOURCE MATERIAL:\n{$baseContent}\n\n";
        
        if ($application) {
            $userPrompt .= "TARGET JOB:\nCompany: {$application->company_name}\nPosition: {$application->position}\nDescription: {$application->notes}\n\n";
        }

        $userPrompt .= "INSTRUCTIONS:\n{$instructions}\n\nTARGET LANGUAGE: " . ($resume->language ?? 'en');

        try {
            $response = Http::withHeader('Authorization', "Bearer {$apiKey}")
                ->timeout(120) // 2 minutes
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