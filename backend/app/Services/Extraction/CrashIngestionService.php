<?php

namespace App\Services\Extraction;

use App\Models\CrashReport;
use App\Models\CrashVehicle;
use App\Models\CrashVictim;
use App\Models\VictimContactEnrichment;
use App\Models\VictimStatus;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Persists an extracted payload (see CrashExtractionSchema) into the crash
 * report, its vehicles, and its victims — and seeds the empty enrichment +
 * status records that the lead pipeline fills in later.
 */
class CrashIngestionService
{
    public function ingest(CrashReport $report, array $payload): CrashReport
    {
        return DB::transaction(function () use ($report, $payload) {
            $crash = Arr::get($payload, 'crash', []);

            $report->fill([
                'crash_id' => $crash['crash_id'] ?? $report->crash_id,
                'txdot_id' => $crash['txdot_id'] ?? null,
                'crash_date' => $crash['crash_date'] ?? null,
                'crash_time' => $crash['crash_time'] ?? null,
                'county' => $crash['county'] ?? null,
                'city' => $crash['city'] ?? null,
                'state' => $crash['state'] ?? null,
                'street_address' => $crash['street_address'] ?? null,
                'road_name' => $crash['road_name'] ?? null,
                'intersection' => $crash['intersection'] ?? null,
                'latitude' => $crash['latitude'] ?? null,
                'longitude' => $crash['longitude'] ?? null,
                'speed_limit' => $crash['speed_limit'] ?? null,
                'total_units' => $crash['total_units'] ?? null,
                'total_persons' => $crash['total_persons'] ?? null,
                'raw_extraction' => $payload,
                'report_status' => 'processed',
                'processing_error' => null,
            ])->save();

            // Map unit_number -> vehicle id so victims can be linked to vehicles.
            $vehicleByUnit = [];
            foreach (Arr::get($payload, 'vehicles', []) as $v) {
                $vehicle = CrashVehicle::create([
                    'crash_report_id' => $report->id,
                    'unit_number' => $v['unit_number'] ?? null,
                    'vehicle_year' => $v['vehicle_year'] ?? null,
                    'vehicle_make' => $v['vehicle_make'] ?? null,
                    'vehicle_model' => $v['vehicle_model'] ?? null,
                    'vehicle_color' => $v['vehicle_color'] ?? null,
                    'vin' => $v['vin'] ?? null,
                    'license_plate' => $v['license_plate'] ?? null,
                    'plate_state' => $v['plate_state'] ?? null,
                    'owner_name' => $v['owner_name'] ?? null,
                    'owner_address' => $v['owner_address'] ?? null,
                    'insurance_company' => $v['insurance_company'] ?? null,
                    'insurance_policy' => $v['insurance_policy'] ?? null,
                    'damage_rating_1' => $v['damage_rating_1'] ?? null,
                    'damage_rating_2' => $v['damage_rating_2'] ?? null,
                    'tow_company' => $v['tow_company'] ?? null,
                    'tow_location' => $v['tow_location'] ?? null,
                ]);

                if (! is_null($vehicle->unit_number)) {
                    $vehicleByUnit[$vehicle->unit_number] = $vehicle->id;
                }
            }

            foreach (Arr::get($payload, 'victims', []) as $p) {
                $fullName = trim(implode(' ', array_filter([
                    $p['first_name'] ?? null,
                    $p['middle_name'] ?? null,
                    $p['last_name'] ?? null,
                ])));

                $victim = CrashVictim::create([
                    'crash_report_id' => $report->id,
                    'vehicle_id' => $vehicleByUnit[$p['unit_number'] ?? null] ?? null,
                    'first_name' => $p['first_name'] ?? null,
                    'middle_name' => $p['middle_name'] ?? null,
                    'last_name' => $p['last_name'] ?? null,
                    'full_name' => $fullName ?: null,
                    'dob' => $p['dob'] ?? null,
                    'age' => $p['age'] ?? null,
                    'gender' => $p['gender'] ?? null,
                    'driver_license_number' => $p['driver_license_number'] ?? null,
                    'driver_license_state' => $p['driver_license_state'] ?? null,
                    'street_address' => $p['street_address'] ?? null,
                    'city' => $p['city'] ?? null,
                    'state' => $p['state'] ?? null,
                    'zip_code' => $p['zip_code'] ?? null,
                    'is_driver' => (bool) ($p['is_driver'] ?? false),
                    'is_passenger' => (bool) ($p['is_passenger'] ?? false),
                    'injury_severity' => $p['injury_severity'] ?? null,
                    'source' => 'pdf',
                    'current_status' => 'PDF_EXTRACTED',
                ]);

                // Empty enrichment record — the redacted contact info gets filled later.
                VictimContactEnrichment::create([
                    'victim_id' => $victim->id,
                    'lookup_status' => 'pending',
                ]);

                VictimStatus::create([
                    'victim_id' => $victim->id,
                    'status' => 'PDF_EXTRACTED',
                    'reason' => 'Imported from crash report PDF.',
                ]);
            }

            return $report->fresh(['vehicles', 'victims']);
        });
    }
}
