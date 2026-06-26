<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrashVictim extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'dob' => 'date',
        'is_driver' => 'boolean',
        'is_passenger' => 'boolean',
    ];

    public function crashReport()
    {
        return $this->belongsTo(CrashReport::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(CrashVehicle::class, 'vehicle_id');
    }

    public function enrichment()
    {
        return $this->hasOne(VictimContactEnrichment::class, 'victim_id');
    }

    public function searches()
    {
        return $this->hasMany(EnrichmentSearch::class, 'victim_id');
    }

    public function notes()
    {
        return $this->hasMany(VictimNote::class, 'victim_id');
    }

    public function statuses()
    {
        return $this->hasMany(VictimStatus::class, 'victim_id');
    }
}
