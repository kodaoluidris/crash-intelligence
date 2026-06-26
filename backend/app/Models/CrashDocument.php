<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrashDocument extends Model
{
    protected $guarded = ['id'];

    public function crashReport()
    {
        return $this->belongsTo(CrashReport::class);
    }
}
