<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crash_vehicles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crash_report_id')->constrained('crash_reports')->cascadeOnDelete();

            $table->unsignedSmallInteger('unit_number')->nullable();

            $table->unsignedSmallInteger('vehicle_year')->nullable();
            $table->string('vehicle_make')->nullable();
            $table->string('vehicle_model')->nullable();
            $table->string('vehicle_color')->nullable();

            $table->string('vin')->nullable();
            $table->string('license_plate')->nullable();
            $table->string('plate_state')->nullable();

            $table->string('owner_name')->nullable();
            $table->string('owner_address')->nullable();

            $table->string('insurance_company')->nullable();
            $table->string('insurance_policy')->nullable();

            $table->string('damage_rating_1')->nullable();
            $table->string('damage_rating_2')->nullable();

            $table->string('tow_company')->nullable();
            $table->string('tow_location')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crash_vehicles');
    }
};
