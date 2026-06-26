<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crash_reports', function (Blueprint $table) {
            $table->id();

            $table->string('crash_id')->nullable()->index();      // agency crash number
            $table->string('txdot_id')->nullable();

            $table->date('crash_date')->nullable();
            $table->time('crash_time')->nullable();

            $table->string('county')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();

            $table->string('street_address')->nullable();
            $table->string('road_name')->nullable();
            $table->string('intersection')->nullable();

            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->unsignedSmallInteger('speed_limit')->nullable();
            $table->unsignedSmallInteger('total_units')->nullable();
            $table->unsignedSmallInteger('total_persons')->nullable();

            $table->string('pdf_path')->nullable();

            // uploaded | processing | processed | failed
            $table->string('report_status')->default('uploaded')->index();
            $table->text('processing_error')->nullable();
            $table->json('raw_extraction')->nullable(); // full JSON returned by the extractor

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOndelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crash_reports');
    }
};
