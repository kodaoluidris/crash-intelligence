<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrashDocument;
use App\Models\CrashReport;
use App\Services\Extraction\CrashIngestionService;
use App\Services\Extraction\PdfExtractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CrashReportController extends Controller
{
    public function index(Request $request)
    {
        $reports = CrashReport::query()
            ->withCount('victims')
            ->when($request->filled('status'), fn ($q) => $q->where('report_status', $request->status))
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = '%' . $request->search . '%';
                $q->where(fn ($w) => $w->where('crash_id', 'ilike', $s)
                    ->orWhere('city', 'ilike', $s)
                    ->orWhere('county', 'ilike', $s));
            })
            ->latest()
            ->paginate(15);

        return response()->json($reports);
    }

    public function show(CrashReport $crashReport)
    {
        $crashReport->load([
            'vehicles',
            'victims.enrichment',
            'victims.vehicle',
            'documents',
            'creator:id,name,email',
        ]);

        return response()->json($crashReport);
    }

    public function store(Request $request, PdfExtractionService $extractor, CrashIngestionService $ingestion)
    {
        $request->validate([
            'pdf' => ['required', 'file', 'mimes:pdf', 'max:20480'], // 20MB
        ]);

        $file = $request->file('pdf');
        $path = $file->store('crash-pdfs', 'local');

        $report = CrashReport::create([
            'pdf_path' => $path,
            'report_status' => 'processing',
            'created_by' => $request->user()->id,
        ]);

        CrashDocument::create([
            'crash_report_id' => $report->id,
            'document_type' => 'pdf',
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'uploaded_by' => $request->user()->id,
        ]);

        try {
            $payload = $extractor->extract($path);
            $ingestion->ingest($report, $payload);
        } catch (\Throwable $e) {
            $report->update([
                'report_status' => 'failed',
                'processing_error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Upload saved but extraction failed.',
                'report' => $report->fresh(),
                'error' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Crash report processed.',
            'report' => $report->fresh(['vehicles', 'victims.enrichment']),
        ], 201);
    }

    public function destroy(CrashReport $crashReport)
    {
        if ($crashReport->pdf_path) {
            Storage::disk('local')->delete($crashReport->pdf_path);
        }
        $crashReport->delete();

        return response()->json(['message' => 'Report deleted.']);
    }
}
