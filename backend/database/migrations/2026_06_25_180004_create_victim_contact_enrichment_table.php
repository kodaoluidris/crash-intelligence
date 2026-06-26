<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('victim_contact_enrichment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('victim_id')->constrained('crash_victims')->cascadeOnDelete();

            // The redacted / missing fields we go find from people-search providers
            $table->string('primary_phone')->nullable();
            $table->string('secondary_phone')->nullable();
            $table->string('tertiary_phone')->nullable();

            $table->string('primary_email')->nullable();
            $table->string('secondary_email')->nullable();

            $table->string('facebook_url')->nullable();
            $table->string('instagram_url')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('twitter_url')->nullable();
            $table->string('tiktok_url')->nullable();

            $table->string('occupation')->nullable();
            $table->string('employer')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('estimated_income')->nullable();
            $table->boolean('property_owner')->nullable();

            $table->unsignedTinyInteger('confidence_score')->nullable(); // 0-100

            // pending | searching | found | partial | not_found | failed
            $table->string('lookup_status')->default('pending')->index();
            $table->timestamp('last_lookup_at')->nullable();

            $table->timestamps();

            $table->unique('victim_id'); // one enrichment record per victim
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('victim_contact_enrichment');
    }
};
