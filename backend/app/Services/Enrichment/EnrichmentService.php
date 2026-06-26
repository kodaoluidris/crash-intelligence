<?php

namespace App\Services\Enrichment;

use App\Models\CrashVictim;
use App\Models\EnrichmentSearch;
use App\Models\User;
use App\Models\VictimStatus;
use Illuminate\Support\Facades\DB;

/**
 * Runs a victim through a people-search provider to recover the redacted
 * contact details (phone, email, social handles).
 *
 * The default driver is a deterministic stub so the pipeline is demoable with
 * no third-party account. Swap config('services.enrichment.driver') to a real
 * provider and implement callProvider() against their API.
 */
class EnrichmentService
{
    public function run(CrashVictim $victim, ?User $user = null): EnrichmentSearch
    {
        $provider = config('services.enrichment.driver', 'stub');
        $searchTerm = trim(($victim->full_name ?? '') . ' ' . ($victim->city ?? '') . ' ' . ($victim->state ?? ''));

        $enrichment = $victim->enrichment()->firstOrCreate(['victim_id' => $victim->id]);
        $enrichment->update(['lookup_status' => 'searching']);
        $this->setStatus($victim, 'LOOKUP_RUNNING', 'Enrichment lookup started.', $user);

        try {
            $result = $provider === 'stub'
                ? $this->stubProvider($victim)
                : $this->callProvider($provider, $victim, $searchTerm);

            $search = EnrichmentSearch::create([
                'victim_id' => $victim->id,
                'search_provider' => $provider,
                'search_term' => $searchTerm,
                'response_json' => $result,
                'status' => empty($result['contacts']) ? 'no_results' : 'success',
                'triggered_by' => $user?->id,
                'searched_at' => now(),
            ]);

            DB::transaction(function () use ($victim, $enrichment, $result, $user, $provider) {
                $contacts = $result['contacts'] ?? [];
                $found = ! empty($contacts);

                if ($found) {
                    $enrichment->update([
                        'primary_phone' => $contacts['primary_phone'] ?? $enrichment->primary_phone,
                        'secondary_phone' => $contacts['secondary_phone'] ?? $enrichment->secondary_phone,
                        'primary_email' => $contacts['primary_email'] ?? $enrichment->primary_email,
                        'secondary_email' => $contacts['secondary_email'] ?? $enrichment->secondary_email,
                        'facebook_url' => $contacts['facebook_url'] ?? $enrichment->facebook_url,
                        'instagram_url' => $contacts['instagram_url'] ?? $enrichment->instagram_url,
                        'linkedin_url' => $contacts['linkedin_url'] ?? $enrichment->linkedin_url,
                        'twitter_url' => $contacts['twitter_url'] ?? $enrichment->twitter_url,
                        'tiktok_url' => $contacts['tiktok_url'] ?? $enrichment->tiktok_url,
                        'occupation' => $contacts['occupation'] ?? $enrichment->occupation,
                        'employer' => $contacts['employer'] ?? $enrichment->employer,
                        'confidence_score' => $result['confidence_score'] ?? $enrichment->confidence_score,
                        'lookup_status' => 'found',
                        'last_lookup_at' => now(),
                    ]);
                    $this->setStatus($victim, 'CONTACT_FOUND', 'Contact details recovered via ' . $provider . '.', $user);
                    $victim->update(['current_status' => 'READY_FOR_OUTREACH']);
                } else {
                    $enrichment->update(['lookup_status' => 'not_found', 'last_lookup_at' => now()]);
                    $this->setStatus($victim, 'CONTACT_NOT_FOUND', 'No contact details found via ' . $provider . '.', $user);
                }
            });

            return $search;
        } catch (\Throwable $e) {
            $enrichment->update(['lookup_status' => 'failed', 'last_lookup_at' => now()]);
            $this->setStatus($victim, 'LOOKUP_PENDING', 'Enrichment failed: ' . $e->getMessage(), $user);

            return EnrichmentSearch::create([
                'victim_id' => $victim->id,
                'search_provider' => $provider,
                'search_term' => $searchTerm,
                'response_json' => ['error' => $e->getMessage()],
                'status' => 'error',
                'triggered_by' => $user?->id,
                'searched_at' => now(),
            ]);
        }
    }

    protected function setStatus(CrashVictim $victim, string $status, string $reason, ?User $user): void
    {
        $victim->update(['current_status' => $status]);
        VictimStatus::create([
            'victim_id' => $victim->id,
            'status' => $status,
            'reason' => $reason,
            'changed_by' => $user?->id,
        ]);
    }

    /**
     * Implement this against your real people-search provider (BeenVerified,
     * Spokeo, WhitePages, a scraping service, etc).
     */
    protected function callProvider(string $provider, CrashVictim $victim, string $searchTerm): array
    {
        throw new \RuntimeException("Enrichment provider [{$provider}] is not configured. Set ENRICHMENT_DRIVER=stub or implement callProvider().");
    }

    /**
     * Deterministic fake result derived from the victim's name so demos are
     * stable and obviously-synthetic.
     */
    protected function stubProvider(CrashVictim $victim): array
    {
        $handle = strtolower(($victim->first_name ?? 'user') . ($victim->last_name ?? ''));
        $handle = preg_replace('/[^a-z0-9]/', '', $handle) ?: 'user';
        $digits = substr(str_pad((string) ($victim->id * 1471 % 10000), 4, '0', STR_PAD_LEFT), 0, 4);

        return [
            'confidence_score' => 82,
            'contacts' => [
                'primary_phone' => "(512) 555-{$digits}",
                'secondary_phone' => null,
                'primary_email' => "{$handle}@example.com",
                'facebook_url' => "https://facebook.com/{$handle}",
                'instagram_url' => "https://instagram.com/{$handle}",
                'linkedin_url' => "https://linkedin.com/in/{$handle}",
                'occupation' => 'Unknown',
                'employer' => null,
            ],
            'note' => 'Synthetic stub data — replace EnrichmentService::callProvider with a real provider.',
        ];
    }
}
