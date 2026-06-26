<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrashReport;
use App\Models\CrashVictim;
use App\Models\VictimContactEnrichment;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'totals' => [
                'reports' => CrashReport::count(),
                'victims' => CrashVictim::count(),
                'contacts_found' => VictimContactEnrichment::where('lookup_status', 'found')->count(),
                'pending_lookups' => VictimContactEnrichment::whereIn('lookup_status', ['pending', 'searching'])->count(),
            ],
            'reports_by_status' => CrashReport::select('report_status', DB::raw('count(*) as count'))
                ->groupBy('report_status')->pluck('count', 'report_status'),
            'victims_by_status' => CrashVictim::select('current_status', DB::raw('count(*) as count'))
                ->groupBy('current_status')->pluck('count', 'current_status'),
            'recent_reports' => CrashReport::withCount('victims')
                ->latest()->limit(5)->get(),
        ]);
    }
}
