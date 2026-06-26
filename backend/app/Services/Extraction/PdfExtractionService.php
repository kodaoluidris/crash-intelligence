<?php

namespace App\Services\Extraction;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

/**
 * Turns a crash-report PDF into structured JSON.
 *
 * Two drivers:
 *   - "claude": sends the PDF to the Anthropic Messages API and forces a
 *               tool call matching CrashExtractionSchema.
 *   - "stub":   returns a fixed sample payload so the whole upload/extract/
 *               ingest pipeline can be exercised with no API key.
 */
class PdfExtractionService
{
    public function extract(string $storagePath): array
    {
        $driver = config('services.anthropic.driver', 'claude');

        if ($driver === 'stub' || empty(config('services.anthropic.key'))) {
            return $this->stubPayload();
        }

        return $this->extractWithClaude($storagePath);
    }

    protected function extractWithClaude(string $storagePath): array
    {
        $absolute = Storage::disk('local')->path($storagePath);
        if (! is_file($absolute)) {
            throw new RuntimeException("PDF not found at {$storagePath}");
        }

        $base64 = base64_encode(file_get_contents($absolute));

        $response = Http::withHeaders([
            'x-api-key' => config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
        ])->timeout(120)->post('https://api.anthropic.com/v1/messages', [
            'model' => config('services.anthropic.model', 'claude-opus-4-8'),
            'max_tokens' => 4096,
            'tools' => [[
                'name' => 'record_crash_data',
                'description' => 'Record all structured data extracted from the crash report.',
                'input_schema' => CrashExtractionSchema::toolSchema(),
            ]],
            'tool_choice' => ['type' => 'tool', 'name' => 'record_crash_data'],
            'messages' => [[
                'role' => 'user',
                'content' => [
                    [
                        'type' => 'document',
                        'source' => [
                            'type' => 'base64',
                            'media_type' => 'application/pdf',
                            'data' => $base64,
                        ],
                    ],
                    [
                        'type' => 'text',
                        'text' => 'Extract every field you can from this crash report. Include all '
                            . 'people involved (drivers and passengers) as victims. Use null for any '
                            . 'field that is redacted, blank, or not present. Do not invent data.',
                    ],
                ],
            ]],
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Anthropic API error: ' . $response->status() . ' ' . $response->body());
        }

        foreach ($response->json('content', []) as $block) {
            if (($block['type'] ?? null) === 'tool_use' && ($block['name'] ?? null) === 'record_crash_data') {
                return $block['input'];
            }
        }

        throw new RuntimeException('Claude did not return structured crash data.');
    }

    /**
     * Sample payload mirroring the certified crash report used during design.
     */
    protected function stubPayload(): array
    {
        return [
            'crash' => [
                'crash_id' => '2025284102',
                'txdot_id' => null,
                'crash_date' => '2025-06-23',
                'crash_time' => '13:15',
                'county' => 'Travis',
                'city' => 'Austin',
                'state' => 'TX',
                'street_address' => null,
                'road_name' => null,
                'intersection' => null,
                'latitude' => null,
                'longitude' => null,
                'speed_limit' => null,
                'total_units' => 2,
                'total_persons' => 3,
            ],
            'vehicles' => [
                [
                    'unit_number' => 1,
                    'vehicle_year' => 2023,
                    'vehicle_make' => 'Chevrolet',
                    'vehicle_model' => 'Malibu',
                    'vehicle_color' => 'Gray',
                    'vin' => '1G1ZD5ST3PF182339',
                    'license_plate' => 'SVM9731',
                    'plate_state' => 'TX',
                    'owner_name' => 'Joel Lomond Godfrey',
                    'owner_address' => '16102 Stoneham Cir, Pflugerville, TX 78660',
                    'insurance_company' => null,
                    'insurance_policy' => null,
                    'damage_rating_1' => null,
                    'damage_rating_2' => null,
                    'tow_company' => null,
                    'tow_location' => null,
                ],
                [
                    'unit_number' => 2,
                    'vehicle_year' => 2015,
                    'vehicle_make' => 'Toyota',
                    'vehicle_model' => 'RAV4',
                    'vehicle_color' => 'White',
                    'vin' => 'JTMWFREV5FD057006',
                    'license_plate' => 'FWD0659',
                    'plate_state' => 'TX',
                    'owner_name' => 'David Edward Myers',
                    'owner_address' => '1900 Barton Springs Rd Apt 3031, Austin, TX 78704',
                    'insurance_company' => null,
                    'insurance_policy' => null,
                    'damage_rating_1' => null,
                    'damage_rating_2' => null,
                    'tow_company' => null,
                    'tow_location' => null,
                ],
            ],
            'victims' => [
                [
                    'unit_number' => 1,
                    'first_name' => 'Joel',
                    'middle_name' => 'Lomond',
                    'last_name' => 'Godfrey',
                    'dob' => '1974-11-13',
                    'age' => 50,
                    'gender' => 'Male',
                    'driver_license_number' => '16057709',
                    'driver_license_state' => 'TX',
                    'street_address' => '16102 Stoneham Cir',
                    'city' => 'Pflugerville',
                    'state' => 'TX',
                    'zip_code' => '78660',
                    'is_driver' => true,
                    'is_passenger' => false,
                    'injury_severity' => 'none',
                ],
                [
                    'unit_number' => 1,
                    'first_name' => 'Robert',
                    'middle_name' => null,
                    'last_name' => 'Brisker',
                    'dob' => null,
                    'age' => 71,
                    'gender' => null,
                    'driver_license_number' => null,
                    'driver_license_state' => null,
                    'street_address' => null,
                    'city' => null,
                    'state' => null,
                    'zip_code' => null,
                    'is_driver' => false,
                    'is_passenger' => true,
                    'injury_severity' => 'possible',
                ],
                [
                    'unit_number' => 2,
                    'first_name' => 'David',
                    'middle_name' => 'Edward',
                    'last_name' => 'Myers',
                    'dob' => '1963-09-30',
                    'age' => 61,
                    'gender' => 'Male',
                    'driver_license_number' => '09864825',
                    'driver_license_state' => 'TX',
                    'street_address' => '1900 Barton Springs Rd Apt 3031',
                    'city' => 'Austin',
                    'state' => 'TX',
                    'zip_code' => '78704',
                    'is_driver' => true,
                    'is_passenger' => false,
                    'injury_severity' => 'minor',
                ],
            ],
        ];
    }
}
