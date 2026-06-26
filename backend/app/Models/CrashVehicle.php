<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrashVehicle extends Model
{
    protected $guarded = ['id'];

    public function crashReport()
    {
        return $this->belongsTo(CrashReport::class);
    }

    public function victims()
    {
        return $this->hasMany(CrashVictim::class, 'vehicle_id');
    }
}
