<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrashVictim;
use App\Models\VictimStatus;
use Illuminate\Http\Request;

class VictimController extends Controller
{
    public const STATUSES = [
        'NEW', 'PDF_EXTRACTED', 'LOOKUP_PENDING', 'LOOKUP_RUNNING', 'CONTACT_FOUND',
        'CONTACT_NOT_FOUND', 'READY_FOR_OUTREACH', 'CONTACTED', 'FOLLOW_UP',
        'SIGNED', 'CLOSED', 'REJECTED',
    ];

    public function index(Request $request)
    {
        $victims = CrashVictim::query()
            ->with(['enrichment', 'crashReport:id,crash_id,city,county,crash_date'])
            ->when($request->filled('status'), fn ($q) => $q->where('current_status', $request->status))
            ->when($request->filled('lookup_status'), fn ($q) => $q->whereHas('enrichment',
                fn ($e) => $e->where('lookup_status', $request->lookup_status)))
            ->when($request->filled('search'), function ($q) use ($request) {
                $s = '%' . $request->search . '%';
                $q->where(fn ($w) => $w->where('full_name', 'ilike', $s)
                    ->orWhere('city', 'ilike', $s)
                    ->orWhere('street_address', 'ilike', $s));
            })
            ->latest()
            ->paginate(20);

        return response()->json($victims);
    }

    public function show(CrashVictim $victim)
    {
        $victim->load([
            'enrichment',
            'vehicle',
            'crashReport:id,crash_id,city,county,state,crash_date,crash_time',
            'notes.user:id,name',
            'statuses.changedBy:id,name',
            'searches' => fn ($q) => $q->latest('searched_at'),
        ]);

        return response()->json($victim);
    }

    public function updateStatus(Request $request, CrashVictim $victim)
    {
        $data = $request->validate([
            'status' => ['required', 'in:' . implode(',', self::STATUSES)],
            'reason' => ['nullable', 'string'],
        ]);

        $victim->update(['current_status' => $data['status']]);
        VictimStatus::create([
            'victim_id' => $victim->id,
            'status' => $data['status'],
            'reason' => $data['reason'] ?? null,
            'changed_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Status updated.',
            'victim' => $victim->fresh(['statuses.changedBy:id,name']),
        ]);
    }
}
