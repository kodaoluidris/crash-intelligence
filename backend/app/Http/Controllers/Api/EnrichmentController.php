<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrashVictim;
use App\Services\Enrichment\EnrichmentService;
use Illuminate\Http\Request;

class EnrichmentController extends Controller
{
    public function run(Request $request, CrashVictim $victim, EnrichmentService $service)
    {
        $search = $service->run($victim, $request->user());

        return response()->json([
            'message' => 'Enrichment lookup completed.',
            'search' => $search,
            'victim' => $victim->fresh(['enrichment', 'statuses.changedBy:id,name']),
        ]);
    }

    public function update(Request $request, CrashVictim $victim)
    {
        $data = $request->validate([
            'primary_phone' => ['nullable', 'string'],
            'secondary_phone' => ['nullable', 'string'],
            'primary_email' => ['nullable', 'email'],
            'secondary_email' => ['nullable', 'email'],
            'facebook_url' => ['nullable', 'string'],
            'instagram_url' => ['nullable', 'string'],
            'linkedin_url' => ['nullable', 'string'],
            'twitter_url' => ['nullable', 'string'],
            'tiktok_url' => ['nullable', 'string'],
            'occupation' => ['nullable', 'string'],
            'employer' => ['nullable', 'string'],
            'marital_status' => ['nullable', 'string'],
            'estimated_income' => ['nullable', 'string'],
            'property_owner' => ['nullable', 'boolean'],
        ]);

        $enrichment = $victim->enrichment()->firstOrCreate(['victim_id' => $victim->id]);
        $enrichment->fill($data);

        // If a human filled in any contact detail, mark it found.
        if (collect($data)->filter(fn ($v) => filled($v))->isNotEmpty()) {
            $enrichment->lookup_status = 'found';
        }
        $enrichment->save();

        return response()->json([
            'message' => 'Contact info updated.',
            'enrichment' => $enrichment->fresh(),
        ]);
    }
}
