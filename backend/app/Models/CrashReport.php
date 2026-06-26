<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrashReport extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected $casts = [
        'crash_date' => 'date',
        'latitude' => 'float',
        'longitude' => 'float',
        'raw_extraction' => 'array',
    ];

    public function vehicles()
    {
        return $this->hasMany(CrashVehicle::class);
    }

    public function victims()
    {
        return $this->hasMany(CrashVictim::class);
    }

    public function documents()
    {
        return $this->hasMany(CrashDocument::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
