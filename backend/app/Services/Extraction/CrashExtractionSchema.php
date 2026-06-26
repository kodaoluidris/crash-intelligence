<?php

namespace App\Services\Extraction;

/**
 * Shared JSON schema describing the structured data we expect to pull out of a
 * crash report PDF. Used both as the tool schema sent to Claude and as the
 * contract the ingestion service relies on.
 */
class CrashExtractionSchema
{
    public static function toolSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'crash' => [
                    'type' => 'object',
                    'properties' => [
                        'crash_id' => ['type' => ['string', 'null']],
                        'txdot_id' => ['type' => ['string', 'null']],
                        'crash_date' => ['type' => ['string', 'null'], 'description' => 'ISO 8601 date YYYY-MM-DD'],
                        'crash_time' => ['type' => ['string', 'null'], 'description' => '24h time HH:MM'],
                        'county' => ['type' => ['string', 'null']],
                        'city' => ['type' => ['string', 'null']],
                        'state' => ['type' => ['string', 'null']],
                        'street_address' => ['type' => ['string', 'null']],
                        'road_name' => ['type' => ['string', 'null']],
                        'intersection' => ['type' => ['string', 'null']],
                        'latitude' => ['type' => ['number', 'null']],
                        'longitude' => ['type' => ['number', 'null']],
                        'speed_limit' => ['type' => ['integer', 'null']],
                        'total_units' => ['type' => ['integer', 'null']],
                        'total_persons' => ['type' => ['integer', 'null']],
                    ],
                ],
                'vehicles' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'unit_number' => ['type' => ['integer', 'null']],
                            'vehicle_year' => ['type' => ['integer', 'null']],
                            'vehicle_make' => ['type' => ['string', 'null']],
                            'vehicle_model' => ['type' => ['string', 'null']],
                            'vehicle_color' => ['type' => ['string', 'null']],
                            'vin' => ['type' => ['string', 'null']],
                            'license_plate' => ['type' => ['string', 'null']],
                            'plate_state' => ['type' => ['string', 'null']],
                            'owner_name' => ['type' => ['string', 'null']],
                            'owner_address' => ['type' => ['string', 'null']],
                            'insurance_company' => ['type' => ['string', 'null']],
                            'insurance_policy' => ['type' => ['string', 'null']],
                            'damage_rating_1' => ['type' => ['string', 'null']],
                            'damage_rating_2' => ['type' => ['string', 'null']],
                            'tow_company' => ['type' => ['string', 'null']],
                            'tow_location' => ['type' => ['string', 'null']],
                        ],
                    ],
                ],
                'victims' => [
                    'type' => 'array',
                    'description' => 'Every person involved (drivers and passengers).',
                    'items' => [
                        'type' => 'object',
                        'properties' => [
                            'unit_number' => ['type' => ['integer', 'null'], 'description' => 'Vehicle/unit this person belongs to'],
                            'first_name' => ['type' => ['string', 'null']],
                            'middle_name' => ['type' => ['string', 'null']],
                            'last_name' => ['type' => ['string', 'null']],
                            'dob' => ['type' => ['string', 'null'], 'description' => 'ISO 8601 date YYYY-MM-DD'],
                            'age' => ['type' => ['integer', 'null']],
                            'gender' => ['type' => ['string', 'null']],
                            'driver_license_number' => ['type' => ['string', 'null']],
                            'driver_license_state' => ['type' => ['string', 'null']],
                            'street_address' => ['type' => ['string', 'null']],
                            'city' => ['type' => ['string', 'null']],
                            'state' => ['type' => ['string', 'null']],
                            'zip_code' => ['type' => ['string', 'null']],
                            'is_driver' => ['type' => ['boolean', 'null']],
                            'is_passenger' => ['type' => ['boolean', 'null']],
                            'injury_severity' => ['type' => ['string', 'null'], 'description' => 'none|possible|minor|serious|fatal|unknown'],
                        ],
                    ],
                ],
            ],
            'required' => ['crash', 'vehicles', 'victims'],
        ];
    }
}
