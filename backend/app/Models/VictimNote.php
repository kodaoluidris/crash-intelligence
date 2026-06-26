<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VictimNote extends Model
{
    protected $guarded = ['id'];

    public function victim()
    {
        return $this->belongsTo(CrashVictim::class, 'victim_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
