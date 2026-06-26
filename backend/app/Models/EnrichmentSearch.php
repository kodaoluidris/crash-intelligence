<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnrichmentSearch extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'response_json' => 'array',
        'searched_at' => 'datetime',
    ];

    public function victim()
    {
        return $this->belongsTo(CrashVictim::class, 'victim_id');
    }
}
