<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VictimStatus extends Model
{
    protected $guarded = ['id'];

    public function victim()
    {
        return $this->belongsTo(CrashVictim::class, 'victim_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
