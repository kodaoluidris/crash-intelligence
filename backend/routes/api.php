<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CrashReportController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EnrichmentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VictimController;
use App\Http\Controllers\Api\VictimNoteController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Crash reports
    Route::get('/crash-reports', [CrashReportController::class, 'index']);
    Route::post('/crash-reports', [CrashReportController::class, 'store']);
    Route::get('/crash-reports/{crashReport}', [CrashReportController::class, 'show']);
    Route::delete('/crash-reports/{crashReport}', [CrashReportController::class, 'destroy']);

    // Victims (leads)
    Route::get('/victims', [VictimController::class, 'index']);
    Route::get('/victims/{victim}', [VictimController::class, 'show']);
    Route::patch('/victims/{victim}/status', [VictimController::class, 'updateStatus']);

    // Enrichment
    Route::post('/victims/{victim}/enrich', [EnrichmentController::class, 'run']);
    Route::put('/victims/{victim}/enrichment', [EnrichmentController::class, 'update']);

    // Notes
    Route::post('/victims/{victim}/notes', [VictimNoteController::class, 'store']);
    Route::delete('/notes/{note}', [VictimNoteController::class, 'destroy']);

    // Admin-only: user & role management
    Route::middleware('role:Admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::get('/roles', [UserController::class, 'roles']);
    });
});
