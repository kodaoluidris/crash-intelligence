<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crash_victims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crash_report_id')->constrained('crash_reports')->cascadeOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained('crash_vehicles')->nullOnDelete();

            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('full_name')->nullable()->index();

            $table->date('dob')->nullable();
            $table->unsignedSmallInteger('age')->nullable();
            $table->string('gender')->nullable();

            $table->string('driver_license_number')->nullable();
            $table->string('driver_license_state')->nullable();

            $table->string('street_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();

            $table->boolean('is_driver')->default(false);
            $table->boolean('is_passenger')->default(false);

            $table->string('injury_severity')->nullable(); // none | possible | minor | serious | fatal | unknown

            $table->string('source')->default('pdf'); // pdf | manual | enriched

            // Denormalized current pipeline status (full history lives in victim_statuses)
            $table->string('current_status')->default('NEW')->index();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['last_name', 'first_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crash_victims');
    }
};
