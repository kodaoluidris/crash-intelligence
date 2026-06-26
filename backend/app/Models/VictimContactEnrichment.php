<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VictimContactEnrichment extends Model
{
    protected $table = 'victim_contact_enrichment';

    protected $guarded = ['id'];

    protected $casts = [
        'property_owner' => 'boolean',
        'last_lookup_at' => 'datetime',
    ];

    public function victim()
    {
        return $this->belongsTo(CrashVictim::class, 'victim_id');
    }
}
