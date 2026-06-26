<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrashVictim;
use App\Models\VictimNote;
use Illuminate\Http\Request;

class VictimNoteController extends Controller
{
    public function store(Request $request, CrashVictim $victim)
    {
        $data = $request->validate([
            'note' => ['required', 'string'],
        ]);

        $note = VictimNote::create([
            'victim_id' => $victim->id,
            'user_id' => $request->user()->id,
            'note' => $data['note'],
        ]);

        return response()->json([
            'message' => 'Note added.',
            'note' => $note->load('user:id,name'),
        ], 201);
    }

    public function destroy(VictimNote $note)
    {
        $note->delete();

        return response()->json(['message' => 'Note deleted.']);
    }
}
