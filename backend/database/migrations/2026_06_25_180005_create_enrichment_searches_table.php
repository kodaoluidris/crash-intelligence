<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrichment_searches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('victim_id')->constrained('crash_victims')->cascadeOnDelete();

            $table->string('search_provider'); // BeenVerified | Spokeo | WhitePages | Custom API ...
            $table->string('search_term')->nullable();
            $table->json('response_json')->nullable();

            $table->string('status')->default('pending'); // pending | success | no_results | error
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('searched_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrichment_searches');
    }
};
